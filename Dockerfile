FROM node:18

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install
RUN npm install -g typescript ts-node

COPY . .

EXPOSE 8080

CMD [ "ts-node", "./index.ts" ]
