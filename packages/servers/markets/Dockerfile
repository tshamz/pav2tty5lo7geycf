# FROM gcr.io/google-appengine/nodejs
FROM node:12.18.0

ENV BUNDLE_NAME="app.zip"
ENV APP_DIR="app"
ENV REPO_MOUNT_POINT="/srv"

ARG NODE_ENV=production
ENV NODE_ENV $NODE_ENV

ARG PORT=8080
ENV PORT $PORT
EXPOSE $PORT 8080

ARG GOOGLE_APPLICATION_CREDENTIALS="/srv/app/credentials.firebase.json"
ENV GOOGLE_APPLICATION_CREDENTIALS $GOOGLE_APPLICATION_CREDENTIALS

ARG FIREBASE_PROJECT="pav2tty5lo7geycf"
ENV FIREBASE_PROJECT $FIREBASE_PROJECT
ENV GCLOUD_PROJECT $FIREBASE_PROJECT

ARG FIREBASE_DEFAULT_DATABASE_URL="https://pav2tty5lo7geycf-default-rtdb.firebaseio.com"
ENV FIREBASE_DEFAULT_DATABASE_URL $FIREBASE_DEFAULT_DATABASE_URL


ENV FIREBASE_CONFIG='{"storageBucket":"pav2tty5lo7geycf.appspot.com","databaseURL":"https://pav2tty5lo7geycf-default-rtdb.firebaseio.com","projectId":"pav2tty5lo7geycf"}'

WORKDIR /srv
COPY app.zip app.zip
RUN \
  unzip app.zip && \
  mv bundle app && \
  rm app.zip

RUN echo "${BUNDLE_NAME}"
RUN echo "${FIREBASE_DEFAULT_DATABASE_URL}"
RUN echo "${GCLOUD_PROJECT}"



WORKDIR /srv/app

EXPOSE 8080 8080

# check every 30s to ensure this service returns HTTP 200
HEALTHCHECK --interval=30s CMD node healthcheck.js

CMD yarn workspace markets start
