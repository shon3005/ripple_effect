# Use the official Python image
FROM python:3.12-slim

# Set the working directory
WORKDIR /app

# Copy requirements and install dependencies
COPY ./ripple-effect-api/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the app code
COPY ./ripple-effect-api/app /app

# Command to run the FastAPI server
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]

