# Define the base image
FROM python:3.9.13

# Label to identify the creator/maintainer
LABEL maintainer="Your Name <your_email@example.com>"

# Copy the requirements file to the container
COPY requirements.txt /app/requirements.txt

# Set the working directory
WORKDIR /app

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the source code to the container
COPY . /app

# Expose a TCP port
EXPOSE 8000

# Run the default command
CMD ["python", "app.py"]
