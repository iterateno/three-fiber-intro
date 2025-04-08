# ---- Build Stage ----
  FROM node:16-alpine AS build

  # Create app directory inside container
  WORKDIR /
  
  # Copy only the package files first (better for caching)
  COPY package*.json ./
  
  # Install dependencies
  RUN npm install
  
  # Copy the rest of the project files into the container
  COPY . .
  
  # Build the production version of your app
  RUN npm run build
  
  # ---- Production Stage ----
  FROM nginx:alpine
  
  # Copy build output from the build stage to NGINX html folder
  COPY --from=build /dist /usr/share/nginx/html
  
  # Expose port 80 and start NGINX
  EXPOSE 80
  CMD ["nginx", "-g", "daemon off;"]
  