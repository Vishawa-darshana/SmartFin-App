"""Coordinator Agent (Agent 1)
Responsibilities:
- Understand user's message and identify intent.
- Route requests to the appropriate agent.
- Coordinate communication between agents.
- Collect agent results and formulate the final response.
"""
from typing import Dict, Any

class CoordinatorAgent:
    def __init__(self, model_name: str = "gemini-1.5-flash"):
        self.model_name = model_name

    def classify_intent(self, message: str) -> str:
        msg = message.lower()
        if any(w in msg for w in ["spent", "paid", "bought", "received", "earned", "income", "expense", "cost"]):
            return "EXPENSE_ENTRY"
        elif any(w in msg for w in ["budget", "limit", "exceeding"]):
            return "BUDGET_ANALYSIS"
        elif any(w in msg for w in ["recurring", "bill", "subscription", "upcoming"]):
            return "RECURRING_EXPENSE"
        elif any(w in msg for w in ["save", "saving", "goal", "target"]):
            return "SAVINGS_RECOMMENDATION"
        elif any(w in msg for w in ["report", "summary", "trend", "breakdown", "analysis"]):
            return "FINANCIAL_ANALYSIS"
        return "GENERAL_INQUIRY"
