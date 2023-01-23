FROM node:18-alpine
WORKDIR /usr/svsu
COPY package.json .
RUN npm install yarn -g
RUN yarn install
COPY . .
RUN yarn build
RUN yarn start