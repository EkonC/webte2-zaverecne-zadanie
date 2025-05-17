from contextlib import asynccontextmanager

from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.db.models.user import User, Role
from app.core.security import get_password_hash
from app.core.config import settings

@asynccontextmanager
async def lifespan(app):
    db: Session = SessionLocal()
    try:
        admin_role = db.query(Role).filter_by(name="admin").first()
        if not admin_role:
            admin_role = Role(name="admin")
            db.add(admin_role)

        user_role = db.query(Role).filter_by(name="user").first()
        if not user_role:
            user_role = Role(name="user")
            db.add(user_role)

        db.commit()

        admin_email = settings.INIT_ADMIN_EMAIL
        admin_password = settings.INIT_ADMIN_PASSWORD

        if admin_email and admin_password:
            any_admin = (
                db.query(User)
                  .filter(User.role_id == admin_role.id)
                  .first()
            )
            if not any_admin:
                db.add(
                    User(
                        email=admin_email,
                        hashed_password=get_password_hash(admin_password),
                        role_id=admin_role.id,
                    )
                )
                db.commit()
                print(f"[startup] Seeded default admin {admin_email}")
        else:
            print("[startup] Skipping admin seeding – "
                  "INIT_ADMIN_EMAIL/PASSWORD not provided")

        yield

    finally:
        db.close()