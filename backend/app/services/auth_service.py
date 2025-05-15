from sqlalchemy.orm import Session
from app.db.models.user import User, Role
from app.core.security import get_password_hash, verify_password, create_access_token
from app.schemas.auth import UserCreate, Token as TokenSchema

def authenticate_user(db: Session, email: str, password: str) -> User | None:
    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(password, user.hashed_password):
        return None
    return user


def create_user(db: Session, user_in: UserCreate) -> User:
    hashed_password = get_password_hash(user_in.password)
    role = db.query(Role).filter(Role.name == "user").first()
    if not role:
        role = Role(name="user")
        db.add(role)
        db.commit()
        db.refresh(role)
    new_user = User(email=str(user_in.email), hashed_password=hashed_password, role_id=role.id)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


def create_tokens_for_user(user: User) -> TokenSchema:
    access_token = create_access_token({"sub": str(user.id)})
    return TokenSchema(access_token=access_token, token_type="bearer")