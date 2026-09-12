"""Thin wrapper around the Anthropic API used by every pipeline stage."""

import os
import re
import json

from anthropic import Anthropic

_client = None


def get_client() -> Anthropic:
    global _client
    if _client is None:
        _client = Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))
    return _client


def call_json(system_prompt: str, user_content: str, max_tokens: int = 1200) -> dict:
    """Call the model with a system prompt that demands JSON-only output,
    then parse and return that JSON as a dict.

    Raises json.JSONDecodeError if the model didn't return valid JSON -
    callers should let that surface rather than silently swallowing it,
    since a malformed response is a real failure worth seeing.
    """
    client = get_client()
    response = client.messages.create(
        model="claude-sonnet-5",
        max_tokens=max_tokens,
        system=system_prompt,
        messages=[{"role": "user", "content": user_content}],
    )
    raw = "".join(block.text for block in response.content if block.type == "text")
    cleaned = re.sub(r"```json|```", "", raw).strip()
    return json.loads(cleaned)
