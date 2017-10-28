# nowonlib.node Dockerfile

# 베이스 이미지
FROM node:latest

# 정보
LABEL maintainer="bynaki <bynaki@icloud.com>"
LABEL title="nowonlib.node"
LABEL version="latest"
LABEL description="https://github.com/bynaki/nowonlib.node"

# 인프라 구성
RUN ["bin/sh", "-c", "ln -sf /usr/share/zoneinfo/Asia/Seoul /etc/localtime"]
RUN npm install -g nodemon node-gyp
ADD start-nowonlib /bin/
WORKDIR /bin
RUN chmod 755 /bin/start-nowonlib \
    && ln -s /bin/start-nowonlib /
ENTRYPOINT ["start-nowonlib"]
CMD ["node", "3000"]
