"""Expense Management Agent (Agent 2)
Responsibilities:
- Understand natural-language transaction descriptions.
- Extract structured transaction data.
- Identify income/expense type and suggest category.
- Detect possible duplicates.
- Always require user confirmation before saving to database.
"""
from typing import Dict, Any, Optional

class ExpenseManagementAgent:
    def __init__(self, model_name: str = "gemini-1.5-flash"):
        self.model_name = model_name

    def extract_transaction(self, text: str) -> Optional[Dict[str, Any]]:
        # In Phase 3, this uses Gemini LLM with structured output
        return None
