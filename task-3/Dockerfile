FROM node:18.17.1-alpine

WORKDIR /app

# Configure npm
RUN npm config set registry https://registry.npmjs.org/ \
    && npm config set fetch-retries 5 \
    && npm config set fetch-retry-mintimeout 60000 \
    && npm config set fetch-retry-maxtimeout 300000

COPY package*.json ./
RUN npm install && npm install -g typescript

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"] 