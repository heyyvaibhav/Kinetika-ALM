# Step 1: Use an official Node.js image as a base
FROM node:16

# Step 2: Set the working directory inside the container
WORKDIR /app

# Step 3: Copy package.json and install dependencies
COPY package.json .
RUN npm install

# Step 4: Copy the rest of the application files
COPY . .

# Step 5: Expose the port your app runs on
EXPOSE 3000

# Step 6: Define the command to run the app
CMD ["npm", "start"]
