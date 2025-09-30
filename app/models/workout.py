from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING
from sqlalchemy import String, ForeignKey, DateTime, Text, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base

if TYPE_CHECKING:
	from app.models.user import User


class WorkoutSession(Base):
	__tablename__ = "workout_sessions"

	id: Mapped[int] = mapped_column(primary_key=True, index=True)
	title: Mapped[str] = mapped_column(String(255), nullable=False)
	notes: Mapped[str | None] = mapped_column(Text, nullable=True)
	performed_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
	# duration in minutes
	duration_minutes: Mapped[int | None] = mapped_column(Integer, nullable=True)

	owner_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
	owner: Mapped[User] = relationship(back_populates="workouts")


class Workout(Base):
	__tablename__ = "workouts"

	id: Mapped[int] = mapped_column(primary_key=True, index=True)
	title: Mapped[str] = mapped_column(String(255), nullable=False)
	description: Mapped[str | None] = mapped_column(Text, nullable=True)
	created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
	# Plan categorization
	level: Mapped[str | None] = mapped_column(String(50), nullable=True)
	duration_days: Mapped[int | None] = mapped_column(Integer, nullable=True)

	# If NULL => system plan; else user-specific plan
	owner_id: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=True)
	owner: Mapped[User] = relationship(back_populates="workout_plans")


class SavedPlan(Base):
	__tablename__ = "saved_plans"

	id: Mapped[int] = mapped_column(primary_key=True, index=True)
	user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
	workout_id: Mapped[int] = mapped_column(ForeignKey("workouts.id", ondelete="CASCADE"), index=True, nullable=False)

