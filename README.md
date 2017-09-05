# NowonLib

노원 정보 도서관 노트북 좌석 인터넷 예약.


## Dockerfile Build & Usage

**build:**
```bash
$ cd path/to/nowonlib.node/docker
# 만약 Raspberry PI 라면 nowonlib.node/rpi-docker
$ docker build -t nowonlib .
```

**run dev:**
```bash
$ cd path/to/nowonlib.node
$ docker run -it -p 8001:8001 --volume `pwd`:/nowonlib.node \
  --name nowonlib-dev nowonlib nodemon 8001

# 만약 Docker Hub 에서 가져 올려면
$ cd path/to/nowonlib.node
$ docker run -it -p 8001:8001 --volume `pwd`:/nowonlib.node \
  --name nowonlib-dev bynaki/nowonlib nodemon 8001
  
# Raspberry PI 버전 이라면
$ cd path/to/nowonlib.node
$ docker run -it -p 8001:8001 --volume `pwd`:/nowonlib.node \
  --name nowonlib-dev bynaki/rpi-nowonlib nodemon 8001
```

**run release:**
```bash
$ docker run -d -p 3000:3000 --restart=on-failure:10 \
  --name nowonlib-release nowonlib node 3000

# 만약 Docker Hub 에서 가져 올려면
$ docker run -d -p 3000:3000 --restart=on-failure:10 \
  --name nowonlib-release bynaki/nowonlib node 3000

# Raspberry PI 버전 이라면
$ docker run -d -p 3000:3000 --restart=on-failure:10 \
  --name nowonlib-release bynaki/rpi-nowonlib node 3000
```

Dockerfile이 바뀌었다면 `Docker Hub` 자동 빌드를 위해 `make-rpi-image-file` 스크립트로
`rpi-nowonlib.tar.xz` 파일을 생성해 주어야 한다.



## License

Copyright (c) bynaki. All rights reserved.

Licensed under the MIT License.
