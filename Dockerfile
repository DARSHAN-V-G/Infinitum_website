FROM node:18-slim  

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json for dependency installation
COPY backend/package*.json ./

# Install dependencies and rebuild bcrypt specifically for this environment
RUN npm install --legacy-peer-deps

# Copy the rest of your app's code into the container
COPY backend/ ./

# Create logs directory
RUN mkdir -p logs
RUN mkdir -p public

# Expose the port your app runs on
EXPOSE 5500

# Start the application
CMD ["node", "server.js"]