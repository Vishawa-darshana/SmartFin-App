# SmartFin AI - API Documentation

FastAPI base URL: `http://localhost:8000/api`

## Endpoints

### 1. Dashboard
- `GET /api/dashboard/summary?month={m}&year={y}` – Aggregates total income, expenses, balance, savings.
- `GET /api/dashboard/charts?month={m}&year={y}` – Returns category distribution, income vs expense, monthly trends, budget vs actual.

### 2. Transactions
- `GET /api/transactions` – List transactions with filters (`category`, `type`, `start_date`, `end_date`, `search`).
- `POST /api/transactions` – Create new transaction.
- `GET /api/transactions/{id}` – Retrieve transaction by ID.
- `PUT /api/transactions/{id}` – Update transaction.
- `DELETE /api/transactions/{id}` – Delete transaction.

### 3. Budgets
- `GET /api/budgets?month={m}&year={y}` – List budgets with actual spending and remaining limits.
- `POST /api/budgets` – Create a budget limit.
- `PUT /api/budgets/{id}` – Update budget limit.
- `DELETE /api/budgets/{id}` – Delete budget limit.

### 4. Recurring Expenses
- `GET /api/recurring-expenses` – List recurring expenses.
- `POST /api/recurring-expenses` – Add recurring expense.
- `PUT /api/recurring-expenses/{id}` – Update recurring expense.
- `DELETE /api/recurring-expenses/{id}` – Delete recurring expense.
- `POST /api/recurring-expenses/{id}/mark-paid` – Marks current due date as paid, creates transaction, advances next date.

### 5. Savings Goals
- `GET /api/savings-goals` – List savings goals with progress percentages and required monthly savings.
- `POST /api/savings-goals` – Create savings goal.
- `PUT /api/savings-goals/{id}` – Update savings goal.
- `DELETE /api/savings-goals/{id}` – Delete savings goal.
- `POST /api/savings-goals/{id}/contributions` – Add contribution to goal.

### 6. AI Assistant
- `POST /api/assistant/chat` – Chat endpoint with multi-agent orchestration.
- `GET /api/assistant/conversations` – Fetch chat history.

### 7. Reports
- `GET /api/reports/monthly?month={m}&year={y}` – Monthly financial performance breakdown.
- `GET /api/reports/financial-summary` – High-level financial overview.
- `GET /api/reports/export/pdf?month={m}&year={y}` – Downloadable PDF report.
