FROM gcr.io/google-appengine/nodejs

WORKDIR /app

ENV NODE_ENV=production

ADD yarn.lock /app/
ADD package.json /app/

# Only copy the packages that I need
ADD firebase/functions/services /app/services
ADD servers/markets /app/markets
ADD servers/server /app/server
ADD servers/websocket /app/websocket

RUN cd /app && yarn install --frozen-lockfile

EXPOSE 8080
