# Build Stage
FROM node:18-alpine as build

WORKDIR /app

# Install dependencies (only copy package files first)
COPY package*.json ./
RUN npm install

# Build the app
COPY . .
RUN npm run build

# Production Stage
FROM nginx:stable-alpine

# Copy built assets from build stage
COPY --from=build /app/build /usr/share/nginx/html

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
