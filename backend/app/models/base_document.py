from datetime import date, datetime
from decimal import Decimal
from typing import Annotated, Any
from bson import Decimal128
from pydantic import BeforeValidator
from beanie import Document


def _coerce_decimal(value: Any) -> Decimal:
    if isinstance(value, Decimal128):
        return value.to_decimal()
    if isinstance(value, Decimal):
        return value
    return Decimal(str(value))


def _encode_date(value: date) -> Any:
    if isinstance(value, datetime):
        return value
    return value.isoformat()


MoneyDecimal = Annotated[Decimal, BeforeValidator(_coerce_decimal)]


class BaseDocument(Document):
    """Shared Beanie Document base with deterministic Decimal128 & ISO date BSON encoding."""

    class Settings:
        bson_encoders = {
            Decimal: lambda v: Decimal128(str(v)),
            date: _encode_date,
        }
