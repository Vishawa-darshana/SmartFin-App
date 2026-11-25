from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.config.settings import get_settings
from app.database.connection import init_db, close_db
from app.database.seed import seed_default_categories

from app.api.routes import (
    categories,
    dashboard,
    transactions,
    budgets,
    recurring_expenses,
    savings_goals,
    assistant,
    reports,
)

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Connect to MongoDB Atlas, initialize Beanie collections/indexes, and seed default categories
    await init_db()
    await seed_default_categories(settings.APP_PROFILE_ID)
    yield
    # Shutdown: Close MongoDB Atlas connection cleanly
    await close_db()


app = FastAPI(
    title="SmartFin AI API",
    description="Multi-Agent Personal Finance Assistant Backend (MongoDB Atlas)",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS middleware for mobile client
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(categories.router, prefix="/api/categories", tags=["Categories"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])
app.include_router(transactions.router, prefix="/api/transactions", tags=["Transactions"])
app.include_router(budgets.router, prefix="/api/budgets", tags=["Budgets"])
app.include_router(recurring_expenses.router, prefix="/api/recurring-expenses", tags=["Recurring Expenses"])
app.include_router(savings_goals.router, prefix="/api/savings-goals", tags=["Savings Goals"])
app.include_router(assistant.router, prefix="/api/assistant", tags=["AI Assistant"])
app.include_router(reports.router, prefix="/api/reports", tags=["Reports"])


@app.get("/api/health")
async def health_check():
    from app.database.connection import get_database
    from app.models.category import Category
    from app.models.transaction import Transaction

    db = get_database()
    try:
        await db.command("ping")
        categories_count = await Category.count()
        transactions_count = await Transaction.count()
        return {
            "status": "healthy",
            "mongodb_connected": True,
            "app": "SmartFin AI",
            "database": "MongoDB Atlas",
            "db_name": settings.MONGODB_DB_NAME,
            "categories_count": categories_count,
            "transactions_count": transactions_count,
            "profile": settings.APP_PROFILE_ID,
        }
    except Exception as exc:
        return {
            "status": "unhealthy",
            "mongodb_connected": False,
            "error": str(exc),
        }
