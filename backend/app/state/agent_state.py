from typing import TypedDict, Optional, Dict, Any, List

class AgentState(TypedDict, total=False):
    profile_id: str
    session_id: str
    user_message: str
    identified_intent: Optional[str]
    current_agent: Optional[str]
    extracted_transaction: Optional[Dict[str, Any]]
    financial_analysis: Optional[Dict[str, Any]]
    budget_results: Optional[List[Dict[str, Any]]]
    recurring_expense_results: Optional[List[Dict[str, Any]]]
    savings_results: Optional[Dict[str, Any]]
    report_results: Optional[Dict[str, Any]]
    requires_confirmation: bool
    confirmation_payload: Optional[Dict[str, Any]]
    final_response: str
    execution_logs: List[Dict[str, Any]]
