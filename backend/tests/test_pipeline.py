"""Verifies the six-stage pipeline is wired correctly end to end.

Mocks the LLM call so this runs without a real ANTHROPIC_API_KEY - it's
checking the graph structure and data flow between stages, not the model's
output quality.
"""

from unittest.mock import patch

FAKE_RESPONSES = {
    "extraction": {
        "diagnoses": ["hypertension"],
        "medications": ["lisinopril"],
        "labs": ["troponin 0.02"],
        "key_findings": ["chest tightness"],
    },
    "summary": {
        "chief_complaint": "chest tightness",
        "findings": "borderline stress test finding",
        "plan": "repeat imaging in 3 months",
    },
    "critical": {
        "flags": [
            {
                "finding": "uncertain stress test finding",
                "reason": "needs follow-up",
                "source_excerpt": "mild inferior wall hypoperfusion of uncertain significance",
                "visit_date": "Aug 9, 2026",
            }
        ]
    },
    "timeline": {
        "timeline": [
            {"date": "Aug 2, 2026", "summary": "initial visit for chest tightness"},
            {"date": "Aug 9, 2026", "summary": "stress test follow-up"},
        ]
    },
    "care_gaps": {"care_gaps": []},
}


def fake_call_json(system_prompt, user_content, max_tokens=1200):
    # Matched on phrases unique to each real prompt (checked this against the
    # actual prompts - "timeline" alone isn't unique, since the timeline
    # prompt's wording also contains "summarizing").
    prompt = system_prompt.lower()
    if "entity extraction" in prompt:
        return FAKE_RESPONSES["extraction"]
    if "triage" in prompt:
        return FAKE_RESPONSES["critical"]
    if "visit-by-visit" in prompt:
        return FAKE_RESPONSES["timeline"]
    if "preventive-care" in prompt:
        return FAKE_RESPONSES["care_gaps"]
    if "fact-checking" in prompt:
        return {"supported": True}
    if "chief_complaint" in prompt:
        return FAKE_RESPONSES["summary"]
    raise ValueError(f"Unexpected prompt in test: {system_prompt[:60]}")


def test_pipeline_end_to_end():
    with patch("app.pipeline.nodes.call_json", side_effect=fake_call_json):
        from app.pipeline.graph import build_pipeline

        test_pipeline = build_pipeline()
        state = {
            "patient_id": "alvarez",
            "patient_name": "R. Alvarez",
            "visits": [
                {
                    "date": "Aug 2, 2026",
                    "text": "Chief complaint: chest tightness, 3 days.",
                },
                {
                    "date": "Aug 9, 2026",
                    "text": (
                        "Follow-up: mild inferior wall hypoperfusion of uncertain "
                        "significance on stress test."
                    ),
                },
            ],
        }
        result = test_pipeline.invoke(state)

    assert result["summary"]["chief_complaint"] == "chest tightness"
    assert len(result["flags"]) == 1
    # The excerpt is an exact substring of the Aug 9 visit text, so the cheap
    # string-match path in verify_flags should grade it "grounded" without
    # ever needing the fact-checking LLM fallback.
    assert result["flags"][0]["confidence"] == "grounded"
    assert result["timeline_graph"]["nodes"] == ["Aug 2, 2026", "Aug 9, 2026"]
    assert result["timeline_graph"]["edges"] == [{"from": "Aug 2, 2026", "to": "Aug 9, 2026"}]
    assert result["care_gaps"] == []


def test_verify_flags_marks_unsupported_claims():
    """A flag whose excerpt doesn't appear anywhere in the source note, and
    that the fact-checking fallback rejects, should come back unsupported -
    proving the verification stage actually can catch a bad claim rather
    than rubber-stamping everything."""
    from app.pipeline.nodes import verify_flags

    with patch("app.pipeline.nodes.call_json", return_value={"supported": False}):
        state = {
            "visits": [{"date": "Aug 9, 2026", "text": "Patient reports feeling well overall."}],
            "flags": [
                {
                    "finding": "fabricated finding",
                    "reason": "does not actually appear in the note",
                    "source_excerpt": "elevated troponin of 4.5 ng/mL",
                    "visit_date": "Aug 9, 2026",
                }
            ],
        }
        result = verify_flags(state)

    assert result["flags"][0]["confidence"] == "unsupported"
