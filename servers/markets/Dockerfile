FROM gcr.io/google-appengine/nodejs

# set our node environment, either development or production
# defaults to production, compose overrides this to development on build and run
ARG NODE_ENV=production
ENV NODE_ENV $NODE_ENV

ARG PORT=8080
ENV PORT $PORT
EXPOSE $PORT 8080

ARG GOOGLE_APPLICATION_CREDENTIALS="/opt/node_app/credentials.firebase.json"
ENV GOOGLE_APPLICATION_CREDENTIALS $GOOGLE_APPLICATION_CREDENTIALS

ARG FIREBASE_PROJECT="pav2tty5lo7geycf"
ENV FIREBASE_PROJECT $FIREBASE_PROJECT
ENV GCLOUD_PROJECT $FIREBASE_PROJECT

ARG FIREBASE_DEFAULT_DATABASE_URL="https://pav2tty5lo7geycf-default-rtdb.firebaseio.com"
ENV FIREBASE_DEFAULT_DATABASE_URL $FIREBASE_DEFAULT_DATABASE_URL

# you'll likely want the latest yarn, regardless of node version, for speed and fixes
# but pin this version for the best stability
RUN npm i yarn -g

# install dependencies first, in a different location for easier app bind mounting for local development
RUN mkdir /opt/
WORKDIR /opt/

RUN git clone https://tshamz:!Hxk99500!@github.com/tshamz/pav2tty5lo7geycf.git

RUN cd pav2tty5lo7geycf

RUN yarn set version berry

# ARG NPM_TOKEN="3566d6c9-6a0b-4de3-8567-8c81efd2cd48"
# ENV NPM_TOKEN $NPM_TOKEN

# COPY package.json ./
# COPY services/ ./
# RUN touch yarn.lock ./

# Copy over node_modules instead
# RUN yarn install --no-optional --production && yarn cache clean --force

ENV PATH /opt/node_app/node_modules/.bin:$PATH

COPY . .

# check every 30s to ensure this service returns HTTP 200
HEALTHCHECK --interval=30s CMD node healthcheck.js

ENTRYPOINT [ "yarn", "start" ]
