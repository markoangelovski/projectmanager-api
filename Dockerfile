# Common build stage
FROM node:16-alpine

WORKDIR /app

COPY package*.json /app/

RUN npm install

COPY . /app

RUN npm run widget-prod

RUN npm prune --production

EXPOSE 3000

CMD ["node", "index.js"]