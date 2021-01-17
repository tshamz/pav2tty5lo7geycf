FROM gcr.io/google-appengine/nodejs

RUN pwd
RUN echo 1
RUN ls

# set our node environment, either development or production
# defaults to production, compose overrides this to development on build and run
ARG NODE_ENV=production
ENV NODE_ENV $NODE_ENV

# default to port 8080 for node
ARG PORT=8080
ENV PORT $PORT
EXPOSE $PORT 8080

# you'll likely want the latest npm, regardless of node version, for speed and fixes
# but pin this version for the best stability
RUN npm i npm@latest -g

# install dependencies first, in a different location for easier app bind mounting for local development
# due to default /opt permissions we have to create the dir with root and change perms
RUN mkdir /opt/node_app
WORKDIR /opt/node_app

RUN pwd
RUN echo 2

ARG GOOGLE_APPLICATION_CREDENTIALS="/opt/node_app/credentials.firebase.json"
ENV GOOGLE_APPLICATION_CREDENTIALS $GOOGLE_APPLICATION_CREDENTIALS

ARG FIREBASE_PROJECT="pav2tty5lo7geycf"
ENV FIREBASE_PROJECT $FIREBASE_PROJECT
ENV GCLOUD_PROJECT $FIREBASE_PROJECT

ARG FIREBASE_DEFAULT_DATABASE_URL="https://pav2tty5lo7geycf-default-rtdb.firebaseio.com"
ENV FIREBASE_DEFAULT_DATABASE_URL $FIREBASE_DEFAULT_DATABASE_URL

ARG NPM_TOKEN="3566d6c9-6a0b-4de3-8567-8c81efd2cd48"
ENV NPM_TOKEN $NPM_TOKEN

# RUN printf 'registry=https://registry.npmjs.org\n//registry.npmjs.org/:_authToken=${NPM_TOKEN}' >> .npmrc

RUN pwd
RUN echo 3

# Only copy the packages that I need
COPY .npmrc ./
COPY package.json yarn.lock* ./
COPY firebase/functions/services firebase/functions/services
COPY servers/notifications servers/notifications
COPY servers/server servers/server
COPY servers/websocket servers/websocket

RUN yarn install --no-optional --production && yarn cache clean --force
ENV PATH /opt/node_app/node_modules/.bin:$PATH

COPY .firebaserc ./
COPY credentials.firebase.json ./

RUN pwd
RUN echo 4

# check every 30s to ensure this service returns HTTP 200
HEALTHCHECK --interval=30s CMD node healthcheck.js

ENTRYPOINT [ "yarn", "start:notifications" ]
