# Stage 1: Build the Angular application
FROM node:18 AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .
RUN npm run build -- --configuration production

# Stage 2: Serve the application from Nginx
FROM nginx:alpine

COPY --from=build /app/dist/pokedex/browser /usr/share/nginx/html

EXPOSE 80