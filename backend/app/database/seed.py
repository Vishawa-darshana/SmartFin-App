from app.models.category import Category

DEFAULT_CATEGORIES = [
    # Expenses
    {"name": "Food", "type": "EXPENSE", "icon": "utensils", "color": "#f97316"},
    {"name": "Transport", "type": "EXPENSE", "icon": "car", "color": "#3b82f6"},
    {"name": "Shopping", "type": "EXPENSE", "icon": "shopping-bag", "color": "#ec4899"},
    {"name": "Education", "type": "EXPENSE", "icon": "graduation-cap", "color": "#8b5cf6"},
    {"name": "Healthcare", "type": "EXPENSE", "icon": "heart-pulse", "color": "#ef4444"},
    {"name": "Entertainment", "type": "EXPENSE", "icon": "film", "color": "#a855f7"},
    {"name": "Housing", "type": "EXPENSE", "icon": "home", "color": "#6366f1"},
    {"name": "Utilities", "type": "EXPENSE", "icon": "zap", "color": "#eab308"},
    {"name": "Other", "type": "EXPENSE", "icon": "more-horizontal", "color": "#64748b"},
    # Income
    {"name": "Salary", "type": "INCOME", "icon": "briefcase", "color": "#10b981"},
    {"name": "Freelance Income", "type": "INCOME", "icon": "laptop", "color": "#06b6d4"},
]


async def seed_default_categories(profile_id: str = "default_profile") -> None:
    """Seed default categories into MongoDB if they do not already exist."""
    for cat in DEFAULT_CATEGORIES:
        exists = await Category.find_one(Category.name == cat["name"])
        if not exists:
            new_cat = Category(
                name=cat["name"],
                type=cat["type"],
                icon=cat.get("icon"),
                color=cat.get("color"),
                profile_id=profile_id,
                is_default=True,
            )
            await new_cat.insert()
