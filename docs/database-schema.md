# SmartFin AI - Database Schema Documentation (MongoDB Atlas)

Database Name: `smartfin_ai`

## Collections

1. **`categories`**
   - Stores income and expense categories (Food, Transport, Shopping, Salary, etc.).
   - Unique index on `name`; pre-seeded automatically on startup.

2. **`transactions`**
   - Primary financial ledger for actual income and expense events.
   - `amount` (`Decimal128`), `type` (`INCOME`/`EXPENSE`), `date` (`YYYY-MM-DD`), `category_name`, `category_id`, `description`, `payment_method`, `notes`, `recurring_expense_id`.

3. **`recurring_expenses`**
   - Active recurring definitions (Rent, Electricity, Subscriptions).
   - `frequency` (`DAILY`, `WEEKLY`, `MONTHLY`, `QUARTERLY`, `YEARLY`), `start_date`, `next_payment_date`, `is_active`.

4. **`recurring_payment_instances`**
   - Recorded instances when a recurring expense is marked as paid.
   - Compound unique index `(recurring_expense_id, due_date)` to prevent duplicate payments.

5. **`budgets`**
   - Monthly category limits.
   - Compound unique index `(profile_id, category_name, month, year)`.

6. **`savings_goals`**
   - User targets (e.g. "Buy a Laptop").
   - `target_amount`, `current_amount`, `target_date`, `is_completed`.

7. **`savings_contributions`**
   - Ledger of contributions made toward a goal.

8. **`conversations`**
   - Stores chat history and structured JSON metadata for the AI Assistant.

9. **`agent_execution_logs`**
   - Audit log of agent executions, intents, input/output states, runtime, and status.
