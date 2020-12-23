FROM node:12.16.2-alpine

ENV NODE_ENV=production

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

WORKDIR /home/node/app

COPY package*.json ./

USER node

RUN npm install --production

COPY --chown=node:node . .

RUN mv configs/config.empty.js configs/config.js

CMD [ "node", "start.js" ]