FROM ubuntu:26.04 AS prebuild
WORKDIR /home/ubuntu

RUN apt-get update && \
    apt-get install -y --no-install-recommends --no-install-suggests \
    curl unzip xz-utils ca-certificates && \
    apt clean && \
    rm -rf /var/lib/apt/lists/*

# Download NodeJS
RUN curl -o nodejs.tar.xz https://nodejs.org/dist/v24.13.1/node-v24.13.1-linux-x64.tar.xz --no-progress-meter && \
    mkdir -p nodejs && tar -xf nodejs.tar.xz -C nodejs --strip-components=1 && \
    rm nodejs.tar.xz

ENV PATH="$PATH:/home/ubuntu/nodejs/bin"

# Download Rclone
RUN curl -Lo rclone.zip https://github.com/rclone/rclone/releases/download/v1.73.1/rclone-v1.73.1-linux-amd64.zip --no-progress-meter && \
    unzip rclone.zip && \
    cd rclone-* && \
    cp rclone ../ && \
    rm -rf ../rclone.zip ../rclone-*

FROM ubuntu:26.04

COPY --from=prebuild /home/ubuntu/rclone /usr/local/bin/rclone
COPY --from=prebuild /etc/ssl/certs /etc/ssl/certs
COPY --from=prebuild /home/ubuntu/nodejs /usr/local/nodejs

ENV PATH="$PATH:/usr/local/nodejs/bin"

RUN npm install pnpm@latest-10 -g --omit=dev --prefer-online && \
    npm cache clean --force

WORKDIR /home/ubuntu
