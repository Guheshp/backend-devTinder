# Use Node.js
FROM node:20-alpine

# Set folder
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Expose Port (Internal)
EXPOSE 7777

# Start
CMD ["npm", "start"]