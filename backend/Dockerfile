FROM python:3.11-slim

WORKDIR /usr/src/app

RUN apt-get update \
 && apt-get install -y netcat-openbsd \
 && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY wait-for.sh ./
RUN sed -i 's/\r$//' wait-for.sh \
 && chmod +x wait-for.sh

COPY . .

EXPOSE 8000

ENTRYPOINT ["sh", "./wait-for.sh", "db", "5432", "--"]
CMD ["sh", "-c", "alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"]