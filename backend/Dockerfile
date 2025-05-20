FROM python:3.11-slim
WORKDIR /usr/src/app

RUN apt-get update && apt-get install -y netcat-openbsd dos2unix wkhtmltopdf \
 && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

ENTRYPOINT ["sh","-c","dos2unix wait-for.sh && sh ./wait-for.sh db 5432 -- alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"]