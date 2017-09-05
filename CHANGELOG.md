
## v0.2

### v0.2.8
- Raspbreyy PI 의 Docker Hub 자동 이미지 빌드를 위해.
- make-rpi-image-file
- rpi-docker > 수정.
- rpi-nowonlib.tar > github 용량 제한에 걸리지 않기 위해 압축 파일 바꿈.

### v0.2.7
- README.md > 수정.
- Dockerfile > timezone 명령 수정

### v0.2.6
- [x] rpi- 버전 Dockerfile 도 만든다.
- [x] release 버전에서 git clone 으로 nowonlib.node 를 직접 집어 넣는다.

### v0.2.5
- Dockerfile > 수정

### v0.2.4
- [x] Dockerfile 생성

### v0.2.3
- .gitignore > 수정.
- Bugfix: tomorrow.js > Timer.reserve > sendMailReserve fixed

### v0.2.2
- nowonlib.js > sendMailReserve()
- 예약 이메일 기능 추가; bootstrap 로컬에 저장; from, to, co.db에 추가.

### v0.2.1
- test server(:8001)와 release server(:3000) 분리.
- nowonlib.js > euc-kr encoding을 제대로 decoding 하여 co.log()로 전달.
- tomorrow.js > 예약시간 제대로 표시.
- users.js > method get 에서 id만 반환; main.js > id만 받아 처리; password를 감추어 보안 강화.
- CHANGELOG.md > reverse log; LICENSE; package.json > 추가.

### v0.2.0
- Bugfix: tomorrow.js > put on_off
- index.ejs > sign in modal
- main.js > localStorage 시작
- #signin-modal
- users를 서버에 저장한다. 예비적으로 localStorage에도 저장한다.
- users를 co.db.users에 저장; co.db.users로 참조.
- front-end users 로그 메시지 수정.



## v0.1

### v0.1.14
- package.json > version
- CHANGELOG.md, README.md

### v0.1.13
- Beautify, gulp-nodemon, delete web.js

### v0.1.12
- issue#0001: 원격 서버에서 /tomorrow/on_off 에 네트워크 연결이 유실되었다고 나온다.
- log 기능 추가.
- log 다시 작성. 가능한.
- 주석 작업.
- 정리.
- 내일예약이 정상적으로 이루어 지지 않았을 때 다시 예약시도 구현.
- 내일예약 자동 예약 시작 로그.
- issue#0002: 예약 시간을 09:00:10 으로 했을 때 그 시각 노원도서관 서버에 연결이 원할하지 않다.
- fixing: issue#0002: 내일예약 시간을 09:00:40 으로 변경.
- 바의 css border-radius 삭제.

### v0.1.11
- jsdom-little 사용해 보자.
- jsdom-little 도 503 발생.
- /data 쌩으로 정규표현식을 써서 해보자.
- /data bar 인식 맞게 고침.
- 내일예약 기능 구현.
    - /tomorrow 구현.
- fixed: 예약 재활용 구현에 날짜 계산 부분.
- /data 를 여느 서비스와 마찬 가지로 nowonlib.js 에 두어야 한다. (예약 기능 완성을 위해.)
- /data 질의를 rest 방식으로 전달하자. /data/[69, 70, 87, ..]
- /tomorrow > setTimeout 으로 예약 시간에 예약 하기 구현.
- RangeList 타입을 그냥 [] 타입으로 교체하고 수정.
- 예약이 정상적으로 되지 안을때 다시시도 기능 구현.

### v0.1.10
- Cafe24 호스팅으로 옮기기.
- bin/www 를 복사해서 ./web.js 로 붙여넣기. (cafe24 기본 실행 파일 만들기.)
- jsdom 3.1.2 로 인스톨 시도. --> cafe24 인스톨 실패.
- node-jsdom 으로 다시 시도.
- issue#0000: 요청 후 응답이 제대로 되지 않는다.
- checkReserve 최적화. (Cafe24 원활한 호스팅을 위해.)
- Test 페이지 만들기. /test
- /data 테스트.
- /data jsdom 제거후 테스트.
- fixed: issue#0000: 원인은 jsdom 때문이다.

### v0.1.9
- 보여줄 좌석 선택 뷰 구현.
- 내일 예약 뷰 구현.
- 보여줄 좌석 기능 구현.
- 보여줄 좌석 저장 서비스 구현. /show_seat
- /data 수정하지 말고 view 에서 해결 해 보자.
- 보여줄 좌석 포멧에 맞게 뷰 수정.
- 정리.

### v0.1.8
- 메시지 바 구현.

### v0.1.7
#### index view 수정.
- 모바일에 맞게 수정.
- data.js tick 을 0부터가 아닌 1부터 사작하게 수정.
- tick bar 선택 기능 구현.
- 각 좌석 마다 따로 데이터 불러 오기로 수정.
- 예약 기능 구현.
- 예약 취소 기능 구현.
- data.js: 예약된 userid 구분해서 데이터에 표시하고 전송.

### v0.1.6
#### 예약취소 [url](http://connect.nowonlib.kr:8800/Web_LibMate3/Vorvertrag_Cancel.php)::
- Post::
- seat[1][rsrv_seq]: '545682', // 일련번호?
- seat[1][seat_id]: '69',      // 좌석 아이디.
- seat[1][hsvar]: '1820',      // 예약 시작 시간. tick
- seat[1][hevar]: '2000',      // 예약 끝 시간. tick
- seat[1][dayact]: '20150825', // 날짜.
- seat[1][type]: 'NO',
- chk[]: '1'
#### Coding::
- cancel 메소드 작성.
- /cancel 서비스 작성. req: UserId=aaaa

### v0.1.5
#### 예약확인 [url](http://connect.nowonlib.kr:8800/Web_LibMate3/Vorvertrag_List.php)::
- Post ::
- Userid: aaaa
- Userpw: bbbb
- x: 0
- y: 0
- 소스는 reserve.html 참조.
### Coding::
- nowonlib.js 에 예약 환인 메소드 구현. checkReserve
- ableReserveUser 구현 완성.
- 예약 확인 서비스 만들기. /check_reserve
- /reserve 응답 데이터 포멧 수정.
- /data 응답 데이터 포멧 수정.
- /index 데이터 포멧에 맞춰 다시 수정.

### v0.1.4
#### 좌석예약 [url](http://connect.nowonlib.kr:8800/Web_LibMate3/Vorvertrag_Sql.php)::
- Post::
- seat_id: 69 // 좌석 아이디.
- Hsvar: 19 // 시작 tick
- Hevar: 28 // 끝 tick
- StimeVar: 0900 // 예약 시작 시간.
- EtimeVar: 1040 // 예약 끝 시간.
- bars: 5 // 화면 위치 저장. (중요하지 않음.)
- dayAct: 0 // ???
- Userid: aaaa // 유저 아이디.
- Userpw: bbbb // 유저 패스워드.
### Coding::
- NowonLib 서버 자체에서 예약 지원.
- LibMate_Form 분석.
- request 모듈 설치.
- 예약 서비스 작성. /reserve
- 예약 메소드 작성. reserve.
- 예약 가능한 유저를 찾아내는 ableReserveUser 메소드 임시 작성.

### v0.1.3
- helpers.js 를 constants.js 로 변경.
- main.js View 에 데이터 적용.
- 각 좌석에 link 적용.
- 예약확인/취소 [url](http://connect.nowonlib.kr:8800/Web_LibMate3/LibMate_Target.php?dayAct=0)

### v0.1.2
- View 구현 시작 (index.ejs)
- helpers.js 구현.
- id: seat69, seat70 ...
- time id: seat69_s09(9시), seat70_s10 ...
- tick id: seat69_t19 ...

### v0.1.1
- 코드 정리.
- jsdom 설치.
- data.js 구현 시작. (서버)
- main.js 구현 시작. (클라이언트)
#### 노원 LibMate 분석.
- 좌석 [url](http://connect.nowonlib.kr:8800/Web_LibMate3/Vorvertrag_Position.php?id=69&s=1&t=19&dayAct=0)
- 원래주소 [url](http://connect.nowonlib.kr:8800/Web_LibMate3/LibMate_In.php?id=69&s=1&t=19&dayAct=0)
- 1시간에 6칸씩 나누어져 있다.
- id=69 :: 노트북 좌석 1 이다.
- s=1 ::  9시이다. (s=2 :: 10시)
- t=19 :: 9시 첫칸이다. (t=25 :: 10시 첫칸)
- ./images/range/bar_orange.gif :: 예약중인시간.
- ./images/range/bar_black.gif :: 운영외시간.
- ./images/range/bar_gray.gif :: 지난시간.
- ./images/range/bar_green.gif :: 예약가능시간.
