from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.security import get_current_active_user
from app.schemas.auth import UserCreate, Token, UserRead
from app.services.auth_service import authenticate_user, create_user, create_tokens_for_user
from app.api.dependencies import get_db
from app.db.models.user import User

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserRead)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == user_in.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    user = create_user(db, user_in)
    return {
        "id": user.id,
        "email": user.email,
        "role": user.role.name,
    }


@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return create_tokens_for_user(user)

@router.post(
    "/refresh",
    response_model=Token,
    summary="Obnoví (nanovo vygeneruje) prístupový JWT token",
)
def refresh_access_token(current_user: User = Depends(get_current_active_user)):
    """
    Vyžaduje platný **access token** v hlavičke `Authorization: Bearer <token>`.
    Vráti nový, časovo predĺžený token (rovnaký *payload*, nové `exp`).
    """
    return create_tokens_for_user(current_user)
