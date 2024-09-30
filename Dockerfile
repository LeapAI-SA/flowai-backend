FROM node:20

# Set the working directory
WORKDIR /usr/src/app

# Copy the package.json and package-lock.json (if available)
COPY package*.json ./

# Install the dependencies
RUN npm install --force

# Copy the entire app to the container
COPY . .

# Build the NestJS app
RUN npm run build

EXPOSE 8080

# The command to run the app
CMD ["npm", "start"]
# CMD ["echo", "CHANGE THE DOCKERFILE"]

