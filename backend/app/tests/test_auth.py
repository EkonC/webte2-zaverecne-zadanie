# tests/test_auth.py
import json
import pytest

def test_register_and_login_success(client):
    # 1. Registrácia nového používateľa
    response = client.post(
        "/auth/register",
        json={"email": "alice@example.com", "password": "secret123"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "id" in data
    assert data["email"] == "alice@example.com"
    assert data["role"] == "user"

    # 2. Úspešné prihlásenie
    response = client.post(
        "/auth/login",
        data={"username": "alice@example.com", "password": "secret123"},
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    assert response.status_code == 200
    token_data = response.json()
    assert "access_token" in token_data
    assert token_data["token_type"] == "bearer"

def test_register_existing_email(client):
    # Registrácia prvýkrát
    client.post(
        "/auth/register",
        json={"email": "bob@example.com", "password": "topsecret"}
    )
    # Druhá registrácia so rovnakým emailom
    response = client.post(
        "/auth/register",
        json={"email": "bob@example.com", "password": "otherpass"}
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "Email already registered"

def test_login_invalid_credentials(client):
    # Prihlásenie pred tým, než existuje akýkoľvek user
    response = client.post(
        "/auth/login",
        data={"username": "nouser@example.com", "password": "doesntmatter"},
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid credentials"