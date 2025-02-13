FROM node:18-slim  

# Set the working directory inside the container to /app/backend
WORKDIR /backend

# Copy only package.json and package-lock.json for dependency installation
COPY backend/package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps 

# Copy the rest of your app's code into the container
COPY backend/ .

# Expose the port your app runs on (modify according to your app)
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
