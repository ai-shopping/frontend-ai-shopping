# Build stage
FROM node:latest as build-stage
WORKDIR /app
COPY . /app
RUN npm install --force
COPY .env /app
# RUN npm run build

# Production stage
# FROM nginx:alpine as production-stage
# COPY --from=build-stage /app/dist /usr/share/nginx/html
# EXPOSE 80
# CMD ["nginx", "-g", "daemon off;"]