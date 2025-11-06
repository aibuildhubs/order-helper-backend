# Dockerfile — Order Helper Backend
FROM node:20-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --omit=dev

# ✅ Copy service account file explicitly into container
# COPY firebase-service-account.json ./firebase-service-account.json

# Copy all remaining source files
COPY . .

# Expose the Cloud Run port
EXPOSE 8080

# Start the server
CMD ["node", "server.js"]
