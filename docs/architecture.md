# SmartFin AI - System Architecture

## Architecture Overview

```
React Native + Expo Mobile Application
                 ↓
      Axios API Communication
                 ↓
       Python FastAPI Backend
                 ↓
LangGraph Multi-Agent Orchestration
                 ↓
Google Gemini + Seven Specialized Agents
                 ↓
         Beanie ODM + Motor
                 ↓
       MongoDB Atlas Cloud DB
```

## Multi-Agent Architecture (LangGraph)

The backend incorporates seven distinct, specialized AI agents, orchestrated with LangGraph:

1. **Coordinator Agent (`coordinator_agent.py`)**: Intent classification, conditional routing, state synthesis.
2. **Expense Management Agent (`expense_management_agent.py`)**: Natural-language transaction extraction with required user confirmation before commit.
3. **Financial Analysis Agent (`financial_analysis_agent.py`)**: Deterministic calculations of totals, spending breakdown, and trends.
4. **Budget Agent (`budget_agent.py`)**: Real-time spending versus limit evaluations.
5. **Recurring Expense Agent (`recurring_expense_agent.py`)**: Schedule calculation, overdue detection, user-confirmed payments.
6. **Savings Recommendation Agent (`savings_recommendation_agent.py`)**: Goal feasibility and monthly plan generation.
7. **Financial Report Agent (`financial_report_agent.py`)**: Monthly summaries and downloadable PDF reports.
