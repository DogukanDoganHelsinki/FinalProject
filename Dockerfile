FROM node:16-alpine

ARG PG_HOST
ARG PG_PORT
ARG PG_USER
ARG PG_PASSWORD
ARG PG_DB
ARG PORT
ARG SECRET
ARG NODE_ENV

ENV PG_HOST=${PG_HOST}
ENV PG_PORT=${PG_PORT}
ENV PG_USER=${PG_USER}
ENV PG_PASSWORD=${PG_PASSWORD}
ENV PG_DB=${PG_DB}
ENV PORT=${PORT}
ENV SECRET=${SECRET}

ENV NODE_ENV=${NODE_ENV}

WORKDIR /app
COPY ./backend/package*.json ./
RUN npm install

COPY ./backend/src/ ./src
COPY ./frontend/dist ./dist
COPY ./frontend/src/images ./dist/src/images

EXPOSE ${PORT}
CMD ["npm", "start"]