FROM gcr.io/google-appengine/nodejs

ENV GAE_SERVICE="notifications"

RUN apt-get update && apt-get install unzip

ENV GOOGLE_APPLICATION_CREDENTIALS="/srv/bundle/credentials.firebase.json"

ENV GCLOUD_PROJECT="pav2tty5lo7geycf"
ENV FIREBASE_PROJECT="pav2tty5lo7geycf"
ENV FIREBASE_DEFAULT_DATABASE_URL="https://pav2tty5lo7geycf-default-rtdb.firebaseio.com/"
ENV FIREBASE_CONFIG='{"storageBucket":"pav2tty5lo7geycf.appspot.com","databaseURL":"https://pav2tty5lo7geycf-default-rtdb.firebaseio.com","projectId":"pav2tty5lo7geycf"}'

EXPOSE $PORT 8080

WORKDIR /srv

COPY .build.zip .

RUN unzip -o -qq .build.zip

WORKDIR /srv/bundle

# check every 30s to ensure this service returns HTTP 200
HEALTHCHECK --interval=30s CMD node healthcheck.js

CMD yarn node entrypoint.js
