#!/usr/bin/env python3
"""
Print pending Agentation annotations as markdown context.
Invoked from a UserPromptSubmit hook.

- Silent if the server is down (no error, no output).
- Silent if there are no pending annotations.
- Otherwise emits a short markdown block with annotation IDs.
"""
import json
import os
import sys
from urllib.request import urlopen, Request

endpoint = os.environ.get("AGENTATION_ENDPOINT", "http://localhost:4747")

try:
    req = Request(f"{endpoint}/pending", headers={"Accept": "application/json"})
    with urlopen(req, timeout=1.5) as resp:
        data = json.load(resp)
except Exception:
    sys.exit(0)

items = data.get("annotations") or []
if not items:
    sys.exit(0)

print(
    f"**Pending Agentation annotations ({len(items)})** — read these and "
    f"address inline before answering. Resolve each via "
    f"`mcp__agentation__agentation_resolve` once handled.\n"
)
for a in items:
    aid = a.get("id") or "?"
    sid = a.get("sessionId") or "?"
    cmt = (a.get("comment") or "").strip().replace("\n", " ")
    near = (a.get("nearbyText") or "").strip().replace("\n", " ")
    if len(near) > 140:
        near = near[:140].rstrip() + "…"
    cls = (a.get("cssClasses") or "").split(",")[0].strip()
    cls_part = f", `.{cls}`" if cls else ""
    print(f"- `{aid}` (session `{sid}`{cls_part}): \"{cmt}\"")
    if near:
        print(f"  — near: {near}")
