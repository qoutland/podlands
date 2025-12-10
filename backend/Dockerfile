FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .

RUN pip install -r requirements.txt

COPY common/ ./common/
COPY routers/ ./routers/
COPY main.py .

COPY kubernetes/ ./kubernetes/

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
