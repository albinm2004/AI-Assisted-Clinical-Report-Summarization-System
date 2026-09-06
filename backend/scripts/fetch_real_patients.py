"""
Optional: pull a few REAL, freely-licensed patient case narratives from the
PMC-Patients dataset and convert them into this app's patient/visit format.

WHY THIS IS A SEPARATE, MANUAL SCRIPT
--------------------------------------
This project's cloud build environment could not reach huggingface.co (the
sandbox's network egress is allowlisted and doesn't include it), so this
script is meant to be run *by you*, locally, where you presumably have
normal internet access. It has not been run end-to-end against live data --
skim it before trusting it blindly, and see the "if this breaks" note below.

WHAT PMC-PATIENTS ACTUALLY IS
------------------------------
https://huggingface.co/datasets/zhengyun21/PMC-Patients -- ~167k patient
summaries extracted from real, published case reports in PubMed Central.
This is genuinely real, de-identified clinical narrative (written up by the
treating clinicians and peer-reviewed/published), not a credentialed hospital
records dataset like MIMIC-III/IV or n2c2 (which need a signed data use
agreement and PhysioNet/DUA credentialing -- out of scope here, and this
project's original brief explicitly said not to attempt that access).
License: CC BY-NC-SA 4.0 -- non-commercial use, attribution required, and any
redistribution must carry the same license. That's why the output of this
script (app/real_patients.py) is gitignored rather than committed: keep it
local, and if you want to publish it, credit the dataset per its license.

ON "REAL INDIAN CLINICAL REPORTS" SPECIFICALLY
------------------------------------------------
We looked for an open, non-credentialed dataset of real Indian clinical
reports/discharge summaries and didn't find one. The closest relevant work
(arXiv:2407.05887, "Generation and De-Identification of Indian Clinical
Discharge Summaries using LLMs") used 99 real de-identified summaries from
SGPGIMS, Lucknow -- but that data requires the institution's own IRB
approval and isn't public. Facing the same gap, that paper's own authors
generated LLM-synthesized summaries styled after Indian documentation
practice instead of using real data. So: real + open + Indian doesn't appear
to exist right now. PMC-Patients does include case reports authored by
clinicians at Indian hospitals (among many other countries), so the
--india-only flag below does a best-effort keyword filter for those.

USAGE
-----
    pip install -r scripts/requirements.txt
    python scripts/fetch_real_patients.py --count 2
    python scripts/fetch_real_patients.py --count 2 --india-only

This writes backend/app/real_patients.py with a REAL_PATIENTS list. Restart
the backend afterwards and the new patients will show up in the "Patients"
tab automatically (app/data.py picks the file up if present).

IF THE FIELD NAMES BELOW DON'T MATCH WHAT YOU SEE
----------------------------------------------------
Hugging Face's own dataset schema can shift. If this errors on a KeyError,
run this first to see the actual columns and adjust the row[...] lookups
below accordingly:

    python -c "from datasets import load_dataset; ds = load_dataset('zhengyun21/PMC-Patients', split='train'); print(ds.column_names); print(ds[0])"
"""

import argparse
import json
import re
import sys

# Rough heuristic for splitting one continuous case narrative into
# pseudo-"visits" wherever it mentions a later point in time. Real case
# reports don't hand you calendar dates the way an EHR would, so the
# resulting "date" fields are relative labels ("Visit 2"), not real dates --
# that's honest about what this data actually is.
TEMPORAL_SPLIT_RE = re.compile(
    r"(?=\b(?:One|Two|Three|Four|Five|Six|Several|A few)\s+(?:day|days|week|weeks|month|months|year|years)\s+later\b"
    r"|\bOn (?:follow-up|admission|presentation|readmission)\b"
    r"|\bAt (?:the )?\d+[- ](?:day|week|month|year)s?\s+(?:follow-up|visit)\b"
    r"|\b\d+\s+(?:days?|weeks?|months?|years?)\s+(?:after|later|post)\b)",
    re.IGNORECASE,
)


def split_into_visits(narrative: str, min_chunk_chars: int = 120):
    parts = [p.strip() for p in TEMPORAL_SPLIT_RE.split(narrative) if p.strip()]
    parts = [p for p in parts if len(p) >= min_chunk_chars] or [narrative.strip()]
    return parts


def build_patient(row, index):
    narrative = row["patient"]
    chunks = split_into_visits(narrative)
    visits = [{"date": f"Visit {i + 1}", "note": chunk} for i, chunk in enumerate(chunks)]

    patient_uid = row.get("patient_uid", index)
    pmid = row.get("PMID", "unknown")

    return {
        "id": f"real-{patient_uid}",
        "name": f"Real case report #{index + 1}",
        "age": None,
        "sex": "unknown",
        "source": f"PMC-Patients dataset, PMID {pmid} (CC BY-NC-SA 4.0) -- a real, published, de-identified case report, not a synthetic patient",
        "visits": visits,
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--count", type=int, default=2, help="How many real patients to pull")
    parser.add_argument(
        "--india-only",
        action="store_true",
        help="Best-effort keyword filter for case reports mentioning India/Indian hospitals",
    )
    args = parser.parse_args()

    try:
        from datasets import load_dataset
    except ImportError:
        sys.exit("Run `pip install -r scripts/requirements.txt` first (needs the `datasets` package).")

    print("Downloading/loading PMC-Patients (this can take a minute the first time)...")
    ds = load_dataset("zhengyun21/PMC-Patients", split="train")

    # Work over a bounded sample rather than the full 167k rows for speed.
    sample = ds.select(range(min(len(ds), 20000)))

    if args.india_only:
        sample = sample.filter(lambda r: "india" in (r.get("title", "") + " " + r.get("patient", "")).lower())

    candidates = [r for r in sample if len(r["patient"]) > 800]
    if not candidates:
        sys.exit("No candidates found -- try without --india-only, or raise the sample size in this script.")

    picked = candidates[: args.count]
    real_patients = [build_patient(row, i) for i, row in enumerate(picked)]

    out_path = "app/real_patients.py"
    with open(out_path, "w") as f:
        f.write(
            '"""Auto-generated by scripts/fetch_real_patients.py.\n'
            "Real, published, de-identified case-report patients from the PMC-Patients\n"
            'dataset (CC BY-NC-SA 4.0). Do not hand-edit; re-run the script instead."""\n\n'
        )
        f.write(f"REAL_PATIENTS = {json.dumps(real_patients, indent=4)}\n")

    print(f"Wrote {len(real_patients)} real patient(s) to {out_path}. Restart the backend to see them.")


if __name__ == "__main__":
    main()
