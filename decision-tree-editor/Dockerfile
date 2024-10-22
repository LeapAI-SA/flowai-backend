# Use the official Node.js image for building and running the React app
FROM node:20

# Set working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json files to install dependencies
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Expose port 3000 to the outside world
EXPOSE 3000

# Start the React app using the development server
CMD ["npm", "start"]
