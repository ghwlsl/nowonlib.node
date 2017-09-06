# NowonLib

노원 정보 도서관 노트북 좌석 인터넷 예약.


## Dockerfile Build & Usage

**build:**
```bash
$ cd path/to/nowonlib.node/docker
# 만약 Raspberry PI 라면 nowonlib.node/rpi-docker
$ docker build -t bynaki/rpi-nowonlib .
```

**run dev:**
```bash
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
  --name nowonlib-release bynaki/nowonlib node 3000

# Raspberry PI 버전 이라면
$ docker run -d -p 3000:3000 --restart=on-failure:10 \
  --name nowonlib-release bynaki/rpi-nowonlib node 3000
```


## License

Copyright (c) bynaki. All rights reserved.

Licensed under the MIT License.
