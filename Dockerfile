FROM node:16-slim

WORKDIR /app/src
COPY . .
CMD ["npm", "start"]