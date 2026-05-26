# Start from official Node 20 image (slim = smaller size)
FROM node:20-alpine

# Set working directory inside the container
WORKDIR /app

# Copy package files first (separate layer — faster rebuilds)
# If package.json didn't change, Docker reuses cached layer
COPY package*.json ./

# Install production dependencies only
RUN npm install --production

# Copy the rest of the source code
COPY . .

# Expose the port Express runs on
EXPOSE 5000

# Start the server
CMD ["node", "src/index.js"]