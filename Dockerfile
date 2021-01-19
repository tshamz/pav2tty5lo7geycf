# This is a mutli-stage Docker build. Stage 1 (named `manifests`) collects
# dependency manifest files (`package.json` and `yarn.lock`) which are then
# used by stage 2 to install these dependencies into the final image used for
# development. The only reason we need a separate stage just for collecting the
# dependency manifests is that Docker's `COPY` command still does not allow
# copying based on a glob pattern (see this GitHub issue for more details
# https://github.com/moby/moby/issues/15858). Being able to copy only manifests
# into stage 2 (the `COPY --from=manifests` statement) is important to maximize
# Docker build cache hit rate. `alpine` is chosen as the base image for the
# first stage because it's the smallest image that have access to the `cp
# --parents -t` command (by installing the `coreutils` package).
FROM alpine:3.11 as manifests
RUN apk add coreutils

WORKDIR /tmp
COPY ./ ./src
RUN \
  mkdir manifests && \
  cd src && \
  # Note: need to exclude `.vscode` directory because the `package.json` file
  # it contains is not a dependency manifest:
  find . -name 'package.json' \! -path '*\.vscode*' | xargs cp --parents -t ../manifests/ && \
  cp yarn.lock ../manifests/;
  # cp yarn.lock ../manifests/ 2>/dev/null || :

# Second build stage:
FROM node:12.18.0

ARG REPO_MOUNT_POINT
ARG REPO_MOUNT_POINT_PARENT
ARG MAIN_YARN_DIR
ARG MAIN_YARN_VERSION

# Every directory created here is `chown`ed to `node` because all development
# at container runtime will be done under the `node` user. It's good practice
# to avoid running as `root` wheneer possible.
RUN mkdir $REPO_MOUNT_POINT && \
  chown -R node:node ${REPO_MOUNT_POINT} && \
  touch ${REPO_MOUNT_POINT_PARENT}/.yarnrc.yml && \
  chown node:node ${REPO_MOUNT_POINT_PARENT}/.yarnrc.yml && \
  mkdir ${MAIN_YARN_DIR} && \
  chown -R node:node ${MAIN_YARN_DIR} && \
  mkdir ${MAIN_YARN_DIR}/releases && \
  chown -R node:node ${MAIN_YARN_DIR}/releases && \
  mkdir ${MAIN_YARN_DIR}/cache && \
  chown -R node:node ${MAIN_YARN_DIR}/cache && \
  mkdir ${MAIN_YARN_DIR}/global && \
  chown -R node:node ${MAIN_YARN_DIR}/global && \
  mkdir ${MAIN_YARN_DIR}/\$\$virtual && \
  chown -R node:node ${MAIN_YARN_DIR}/\$\$virtual && \
  mkdir ${MAIN_YARN_DIR}/unplugged && \
  chown -R node:node ${MAIN_YARN_DIR}/unplugged

WORKDIR ${REPO_MOUNT_POINT}

USER node

# This step is roughly equivalent to running `yarn set version berry`, which 1)
# downloads the latest version of Yarn v2 CLI executable to the
# $MAIN_YARN_DIR/releases directory and 2) creates a `.yarnrc` in a location
# accessible to Yarn that tells the system-wide Yarn (which can be either v1 or
# v2) where to find the Yarn executable for the *current* project. Note: Hash
# in the URL is explicitly specified for reproducibility and will need to be
# updated when new versions of Yarn are released.
RUN curl -s https://raw.githubusercontent.com/yarnpkg/berry/@yarnpkg/cli/${MAIN_YARN_VERSION}/packages/yarnpkg-cli/bin/yarn.js > ${MAIN_YARN_DIR}/releases/yarn-${MAIN_YARN_VERSION}.js && \
  echo "yarn-path \"${MAIN_YARN_DIR}/releases/yarn-${MAIN_YARN_VERSION}.js\"" > ~/.yarnrc

# The following lines copy the plugins `@yarnpkg/plugin-workspace-tools`
# so that it can be specified in `.yarnrc.yml`.
# The URL points to the current version (at the time of writing) of this file:
# https://github.com/yarnpkg/berry/blob/master/packages/plugin-workspace-tools/bin/%40yarnpkg/plugin-workspace-tools.js
RUN curl -s https://raw.githubusercontent.com/yarnpkg/berry/master/packages/plugin-workspace-tools/bin/@yarnpkg/plugin-workspace-tools.js -o ${MAIN_YARN_DIR}/plugin-workspace-tools.js

# This instruction writes the `.yarnrc.yml` to $MAIN_YARN_DIR.
# The ugliness is needed to save multiline string to a file. For reference, see:
# https://www.virtuallyghetto.com/2017/04/quick-tip-creating-a-multiline-dockerfile-using-heredoc-wvariable-substitution.html

# The content of the resultant `.yarnrc.yml` looks like this:
# bstatePath: "/yarn/build-state.yml"
# cacheFolder: "/yarn/cache"
# globalFolder: "/yarn/global"
# virtualFolder: "/yarn/$$virtual"
# pnpUnpluggedFolder: "/yarn/unplugged"
# plugins:
#   - path: "/yarn/plugin-workspace-tools.js"
#     spec: "@yarnpkg/plugin-interactive-tools"

RUN echo 'bstatePath: "'${MAIN_YARN_DIR}'/build-state.yml"\n\
cacheFolder: "'${MAIN_YARN_DIR}'/cache"\n\
globalFolder: "'${MAIN_YARN_DIR}'/global"\n\
virtualFolder: "'${MAIN_YARN_DIR}'/$$virtual"\n\
pnpUnpluggedFolder: "'${MAIN_YARN_DIR}'/unplugged"\n\
plugins:\n\
  - path: "'${MAIN_YARN_DIR}'/plugin-workspace-tools.js"\n\
    spec: "@yarnpkg/plugin-interactive-tools"\n\
' >> ${REPO_MOUNT_POINT_PARENT}/.yarnrc.yml

# Copy `yarn.lock` and all `package.json` files from the first build stage in
# preparation for `yarn install`.
COPY --from=manifests --chown=node:node /tmp/manifests  ./

# Install all dependencies and verify that `yarn.lock` will not be modified
# during the process. If `yarn.lock` needs to be modified, this step is
# deliberately designed to fail (Please refer to the article for the remedy.).
# This is to prevent `yarn.lock` from going out-of-sync with the `package.json`
# files inside each workspace, which can happen if npm is used as the package
# manager on the host side.
RUN yarn install --immutable;

# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # `
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #


# RUN \
#   yarn plugin import workspace-tools && \
#   yarn plugin import https://yarn.build/latest;

# The following lines copy the plugins `@yarnpkg/plugin-workspace-tools`
# so that it can be specified in `.yarnrc.yml`.
# The URL points to the current version (at the time of writing) of this file:
# https://github.com/yarnpkg/berry/blob/master/packages/plugin-workspace-tools/bin/@yarnpkg/plugin-workspace-tools.js
# RUN curl -s https://raw.githubusercontent.com/yarnpkg/berry/master/packages/plugin-workspace-tools/bin/@yarnpkg/plugin-workspace-tools.js -o ${MAIN_YARN_DIR}/plugins/plugin-.js
# RUN curl -s https://raw.githubusercontent.com/ojkelly/yarn.build/trunk/.yarn/plugins/@ojkelly/plugin-build.cjs -o ${MAIN_YARN_DIR}/plugins/plugin-build.js

# The content of the resultant `.yarnrc.yml` looks like this:
# bstatePath: "/yarn/build-state.yml"
# cacheFolder: "/yarn/cache"
# globalFolder: "/yarn/global"
# virtualFolder: "/yarn/$$virtual"
# pnpUnpluggedFolder: "/yarn/unplugged"
# plugins:
#   - path: "/yarn/plugin-workspace-tools.js"
#     spec: "@yarnpkg/plugin-interactive-tools"

# RUN echo 'bstatePath: "'${MAIN_YARN_DIR}'/build-state.yml"\n\
# cacheFolder: "'${MAIN_YARN_DIR}'/cache"\n\
# globalFolder: "'${MAIN_YARN_DIR}'/global"\n\
# virtualFolder: "'${MAIN_YARN_DIR}'/$$virtual"\n\
# pnpUnpluggedFolder: "'${MAIN_YARN_DIR}'/unplugged"\n\
# plugins:\n\
#   - path: "'${MAIN_YARN_DIR}'/plugins/plugin-workspace-tools.js"\n\
#     spec: "@yarnpkg/plugin-interactive-tools"\n\
#   - path: "'${MAIN_YARN_DIR}'/plugins/plugin-build.js"\n\
#     spec: "https://yarn.build/latest"\n\
# ' >> ${REPO_MOUNT_POINT_PARENT}/.yarnrc.yml

# RUN \
#   mkdir ${MAIN_YARN_DIR}/cache && \
#   chown -R node:node ${MAIN_YARN_DIR}/cache && \
#   mkdir ${MAIN_YARN_DIR}/global && \
#   chown -R node:node ${MAIN_YARN_DIR}/global && \
#   mkdir ${MAIN_YARN_DIR}/plugins && \
#   chown -R node:node ${MAIN_YARN_DIR}/plugins && \
#   mkdir ${MAIN_YARN_DIR}/\$\$virtual && \
#   chown -R node:node ${MAIN_YARN_DIR}/\$\$virtual && \
#   mkdir ${MAIN_YARN_DIR}/unplugged && \
#   chown -R node:node ${MAIN_YARN_DIR}/unplugged && \
#   mkdir $REPO_MOUNT_POINT && \
#   chown -R node:node ${REPO_MOUNT_POINT} && \
#   touch ${REPO_MOUNT_POINT_PARENT}/.yarnrc.yml && \
#   chown node:node ${REPO_MOUNT_POINT_PARENT}/.yarnrc.yml;

# # Every directory created here is `chown`ed to `node` because all development
# # at container runtime will be done under the `node` user. It's good practice
# # to avoid running as `root` whenever possible.
# # RUN \
# #   yarn set version berry && \
# #   yarn set version ${MAIN_YARN_VERSION} && \
# #   chown -R node:node ${MAIN_YARN_DIR} && \
# #   chown -R node:node ${MAIN_YARN_DIR}/releases;

# RUN \
#   mkdir $REPO_MOUNT_POINT && \
#   chown -R node:node ${REPO_MOUNT_POINT};


# RUN \
#   yarn set version berry && \
#   yarn set version ${MAIN_YARN_VERSION};
