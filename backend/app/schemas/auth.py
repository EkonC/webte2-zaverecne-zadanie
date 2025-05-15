from pydantic import BaseModel, EmailStr, ConfigDict


class UserCreate(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class UserRead(BaseModel):
    id: int
    email: EmailStr
    role: str

    model_config = ConfigDict(from_attributes=True)