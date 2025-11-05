# Use Node.js base image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install the dependencies defined in package.json
RUN npm install

# Copy all the other application files into the container
COPY . .

# Expose port 5000 for the backend application
EXPOSE 5000

# Command to run the backend application
CMD ["npm", "start"]
