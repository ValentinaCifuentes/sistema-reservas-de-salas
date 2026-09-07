FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN if [ -f package.json ]; then npm install --omit=dev; fi

COPY . .

EXPOSE 3002

CMD ["npm", "start"]
