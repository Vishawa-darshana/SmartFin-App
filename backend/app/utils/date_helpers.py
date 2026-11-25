from datetime import date, timedelta
import calendar

def calculate_next_payment_date(current_date: date, frequency: str) -> date:
    """Calculates the next payment date based on frequency, handling leap years and month lengths."""
    freq = frequency.upper()
    if freq == "DAILY":
        return current_date + timedelta(days=1)
    elif freq == "WEEKLY":
        return current_date + timedelta(days=7)
    elif freq == "MONTHLY":
        # Add 1 month safely
        year = current_date.year
        month = current_date.month + 1
        if month > 12:
            month = 1
            year += 1
        max_day = calendar.monthrange(year, month)[1]
        day = min(current_date.day, max_day)
        return date(year, month, day)
    elif freq == "QUARTERLY":
        # Add 3 months safely
        month = current_date.month + 3
        year = current_date.year
        while month > 12:
            month -= 12
            year += 1
        max_day = calendar.monthrange(year, month)[1]
        day = min(current_date.day, max_day)
        return date(year, month, day)
    elif freq == "YEARLY":
        # Add 1 year safely (handling Feb 29 on non-leap years)
        year = current_date.year + 1
        max_day = calendar.monthrange(year, current_date.month)[1]
        day = min(current_date.day, max_day)
        return date(year, current_date.month, day)
    return current_date + timedelta(days=30)
