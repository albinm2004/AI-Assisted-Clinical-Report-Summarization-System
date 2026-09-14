"""Thin wrapper around a local Ollama model used by every pipeline stage.

No API key needed - this calls Ollama's REST API running on your own
machine (http://localhost:11434 by default). Every calling node in
nodes.py just calls call_json(...), so this is the only file that needed
to change to switch providers.

One-time setup:
  1. Install Ollama: https://ollama.com/download
  2. Pull a model:   ollama pull llama3.1:8b
  3. Ollama runs as a background service after install (or start it
     manually with `ollama serve`) - no key, no account, no internet
     needed once the model is downloaded.
"""

import os
import re
import json

import requests

OLLAMA_HOST = os.environ.get("OLLAMA_HOST", "http://localhost:11434").rstrip("/")
DEFAULT_MODEL = os.environ.get("OLLAMA_MODEL", "llama3.1:8b")


def call_json(system_prompt: str, user_content: str, max_tokens: int = 1200) -> dict:
    """Call the local model with a system prompt that demands JSON-only
    output, then parse and return that JSON as a dict.

    Raises json.JSONDecodeError if the model didn't return valid JSON -
    callers should let that surface rather than silently swallowing it,
    since a malformed response is a real failure worth seeing. Raises
    RuntimeError with a clear message if Ollama itself isn't reachable.
    """
    try:
        response = requests.post(
            f"{OLLAMA_HOST}/api/chat",
            json={
                "model": DEFAULT_MODEL,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_content},
                ],
                "format": "json",
                "stream": False,
                "options": {"num_predict": max_tokens},
            },
            timeout=180,
        )
    except requests.exceptions.ConnectionError as e:
        raise RuntimeError(
            f"Can't reach Ollama at {OLLAMA_HOST}. Make sure it's installed "
            f"and running (`ollama serve`), and that you've pulled the model "
            f"(`ollama pull {DEFAULT_MODEL}`)."
        ) from e

    if response.status_code == 404:
        raise RuntimeError(
            f"Ollama doesn't have the model '{DEFAULT_MODEL}' pulled yet. "
            f"Run `ollama pull {DEFAULT_MODEL}` and try again."
        )
    response.raise_for_status()

    raw = response.json().get("message", {}).get("content", "")
    cleaned = re.sub(r"```json|```", "", raw).strip()
    return json.loads(cleaned)
