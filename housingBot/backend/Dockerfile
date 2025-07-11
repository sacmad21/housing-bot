# backend/Dockerfile
FROM python:3.10.10

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy app files
COPY . .

# Expose port and run server
EXPOSE 5000
CMD ["python", "server.py"]
