FROM node:20-alpine3.19

# Set working directory
WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --production

# Copy the rest of the application code
COPY . .

# Expose the app port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]