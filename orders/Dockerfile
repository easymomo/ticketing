FROM node:18.17-alpine3.17

WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev
COPY . .

CMD [ "npm", "start" ]
