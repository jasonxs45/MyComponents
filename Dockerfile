FROM node:14.18.2-alpine as build-stage
COPY ./ /app
WORKDIR /app
RUN npm run initialize
RUN npm run docs:build

FROM nginx:1.18.0-alpine as production-stage
RUN mkdir /app
COPY --from=build-stage /app/docs-dist /app
COPY nginx.conf /etc/nginx/nginx.conf

# FROM nginx:1.18.0-alpine
# RUN mkdir /app
# COPY /docs-dist /app
# COPY nginx.conf /etc/nginx/nginx.conf