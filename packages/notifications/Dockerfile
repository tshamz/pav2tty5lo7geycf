FROM node:12.18.0

ARG NODE_ENV=production
ARG PORT=8080
ARG GOOGLE_APPLICATION_CREDENTIALS="/srv/app/credentials.firebase.json"
ARG FIREBASE_PROJECT="pav2tty5lo7geycf"
ARG FIREBASE_DEFAULT_DATABASE_URL="https://pav2tty5lo7geycf-default-rtdb.firebaseio.com"
ARG FIREBASE_CONFIG='{"storageBucket":"pav2tty5lo7geycf.appspot.com","databaseURL":"https://pav2tty5lo7geycf-default-rtdb.firebaseio.com","projectId":"pav2tty5lo7geycf"}'
ARG BUNDLE_NAME="app.zip"
ARG APP_DIR="app"
ARG REPO_MOUNT_POINT="/srv"


ENV PORT $PORT
ENV APP_DIR $APP_DIR
ENV NODE_ENV $NODE_ENV
ENV BUNDLE_NAME $BUNDLE_NAME
ENV FIREBASE_CONFIG $FIREBASE_CONFIG
ENV GCLOUD_PROJECT $FIREBASE_PROJECT
ENV REPO_MOUNT_POINT $REPO_MOUNT_POINT
ENV FIREBASE_PROJECT $FIREBASE_PROJECT
ENV FIREBASE_DEFAULT_DATABASE_URL $FIREBASE_DEFAULT_DATABASE_URL
ENV GOOGLE_APPLICATION_CREDENTIALS $GOOGLE_APPLICATION_CREDENTIALS

EXPOSE $PORT 8080

WORKDIR /srv

COPY app.zip app.zip

RUN \
  unzip app.zip && \
  mv bundle app && \
  rm app.zip

WORKDIR /srv/app

# check every 30s to ensure this service returns HTTP 200
HEALTHCHECK --interval=30s CMD node healthcheck.js

CMD yarn workspace markets start
