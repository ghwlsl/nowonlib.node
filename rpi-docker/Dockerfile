# Raspberry PI Dockerfile

# 베이스 이미지
FROM hypriot/rpi-node:6.11

# 내 정보
MAINTAINER bynaki <bynaki@icloud.com>

# 정보
LABEL title="nowonlib.node"
LABEL version="latest"
LABEL description="https://github.com/bynaki/nowonlib.node"

# 인프라 구성
RUN ["bin/sh", "-c", "ln -sf /usr/share/zoneinfo/Asia/Seoul /etc/localtime"]
RUN npm install -g nodemon node-gyp
ADD start-nowonlib /bin/
RUN chmod 755 /bin/start-nowonlib \
    && ln -s /bin/start-nowonlib /
ENTRYPOINT ["start-nowonlib"]
CMD ["node", "3000"]
