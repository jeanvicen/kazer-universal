"""Minimal Kazer Universal SDK for the public MVP."""
from __future__ import annotations
import json
from urllib.request import Request, urlopen

class Kazer:
    def __init__(self, api_key: str | None = None, base_url: str = "http://localhost:3000"):
        self.api_key = api_key
        self.base_url = base_url.rstrip("/")

    def _request(self, path: str, payload: dict | None = None) -> dict:
        data = json.dumps(payload).encode() if payload is not None else None
        headers = {"Content-Type": "application/json"}
        if self.api_key:
            headers["Authorization"] = f"Bearer {self.api_key}"
        response = urlopen(Request(self.base_url + path, data=data, headers=headers, method="POST" if data else "GET"))
        return json.loads(response.read())

    def chat(self, prompt: str | None = None, messages: list[dict] | None = None, model: str | None = None) -> dict:
        body = {"messages": messages} if messages else {"prompt": prompt}
        if model: body["model"] = model
        return self._request("/v1/chat", body)

    def capabilities(self) -> dict: return self._request("/v1/capabilities")
    def registry(self) -> dict: return self._request("/v1/registry")
    def skills(self) -> dict: return self._request("/v1/skills")
    def auto(self, task: str) -> dict: return self.chat(prompt=task)
