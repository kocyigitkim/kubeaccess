FROM node:16

WORKDIR /app/src
COPY . .
CMD ["npm", "start"]