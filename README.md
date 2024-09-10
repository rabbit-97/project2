# CH 3 아이템 시뮬레이터 과제

==============================

1. **암호화 방식**

   - 비밀번호를 DB에 저장할 때 Hash를 이용했는데, Hash는 단방향 암호화와 양방향 암호화 중 어떤 암호화 방식에 해당할까요?
   - 비밀번호를 그냥 저장하지 않고 Hash 한 값을 저장 했을 때의 좋은 점은 무엇인가요?

   * Hash는 단방향 암호화 방식, 원본 데이터를 특정 함수를 통해 변환하여 고정 길이의 값으로 만들지만 반대로는 불가능 - 양방향 암호화의 차이점

   * Hash를 그럼 왜 사용하는지?

   - 데이터베이스가 해킹 되어도 해시값만 노출이 되어 실제 비밀번호를 알아내기 어렵다.
   - 해시 함수의 특성상 같은 입력값에 대해 항상 같은 해시값이 나오므로 공격자가 미리 계산해 놓은 해시값과 비교하는 방식으로는 쉽게 비밀번호를 찾아 낼 수 없다.
   - 저장된 해시 값과 실제 데이터의 해시 값을 비교하여 데이터가 변조 되었는지 확인 할 수 있다.
   - 사용자가 입력한 비밀번호를 해시하여 저장된 해시 값과 비교하기 때문에, 전체 데이터베이스를 검색 할 필요 없이 빠르게 인증 가능하다.

   * Hash의 단점은?

   - 두 개의 다른 입력 값이 같은 해시 값을 생성하는 경우가 있다. 이를 해시 충돌이라고 하며, 이로 인해 보안 문제가 발생할 수 있다.
   - 해시 함수의 결정성으로 인해 레인보우 테이블이라는 사전 계산된 해시 테이블을 사용하여 암호를 추측하는 공격이 가능하다.

2. **인증 방식**

   - JWT(Json Web Token)을 이용해 인증 기능을 했는데, 만약 Access Token이 노출되었을 경우 발생할 수 있는 문제점은 무엇일까요?
   - 해당 문제점을 보완하기 위한 방법으로는 어떤 것이 있을까요?

   * 문제점

   - 공격자가 탈취한 Access Token을 이용해서 해당 사용자의 권한으로 시스템에 접근하고 임의의 작업을 수행 할 수 있다. 한번 토큰이 탈취 당하면 만료될 때 까지 대처가 불가능.

   * 해결책

   - 따라서 Access Token의 유효기간을 짧게 설정해서 노출이 되더라도 악용될 수 있는 시간을 최소화 한다.
     유효기간이 지날때바다 재 발급 받는 방식은 두가지 방법이 있는데
   - Sliding Session : 특정한 서비스를 계속 사용하고 있는 특정 유저에 대해 만료시간을 연장시켜주는 방법.
   - Refresh Token : 가장 많이 사용하는 방법으로 JWT를 처음 발급할 때 Access token과 함께 Refresh Token이라는 토큰을 발급하여 짧은 만료시간을 해결하는 방법

3. **인증과 인가**

   - 인증과 인가가 무엇인지 각각 설명해 주세요.
   - 위 API 구현 명세에서 인증을 필요로 하는 API와 그렇지 않은 API의 차이가 뭐라고 생각하시나요?
   - 아이템 생성, 수정 API는 인증을 필요로 하지 않는다고 했지만 사실은 어느 API보다도 인증이 필요한 API입니다. 왜 그럴까요?

   * 인증가 인가

   - 인증 : 사용자가 주장하는 신원이 실제 사용자의 신원과 일치하는지 확인하는 과정. - 은행 계좌에 로그인할 때 아이디와 비밀번호를 입력해 본인임을 **확인**
   - 인가 : 인증된 사용자가 특정 자원이나 기능에 접근할 수 있는 권한이 있는지 확인하는 과정 - 로그인 후 자신 명의의 계좌만 조회하고 다른 사람의 계좌는 조회 할 수 없는 **권한**을 부여하는 과정

   * 인증을 필요로 하는 API와 그렇지 않은 API의 차이

   - 개인정보나 결제 등 다른 사람이 확인 하면 안되는 중요한 정보에는 인증이 필요한 API가 필요하고 그 외에 페이지 조회나 공지사항 확인 등 모두가 확인 할 수 있는 정보에는 인증을 필요로 하지 않는 API가 필요하다.

   * 아이템 생성, 수정 API는 인증을 필요로 하지 않는다고 했지만 사실은 어느 API보다도 인증이 필요한 API입니다. 왜 그럴까요?

   - 아이템의 정보는 누구에게나 공개가 되어 있지만, 이 아이템의 소유권이 생긴 경우에는 인증이 필요한 API가 필요하다.
   - 아이템의 능력치가 정해져 있는 경우 인증이 필요하지 않을 때는 임의로 능력치를 수정하여 아이템의 가치를 잃기 때문, 또한 한 서버 내의 아이템은 상황에따라 한 유저의 재산이 되는 경우가 있어 앞의 경우와 같은 이유로 가치를 잃는다. 이는 은행에 로그인을 해야 잔액 확인이 가능한 인증이 필요한 API와 같은 이유이다.

4. **Http Status Code**

   - 과제를 진행하면서 사용한 Http Status Code를 모두 나열하고, 각각이 의미하는 것과 어떤 상황에 사용했는지 작성해 주세요.
     200 - 정상 작동
     201 - 생성됨 - 요청이 처리되어 새로운 리소스가 생성됨
     202 - 허용됨 - 요청은 접수되었지만 처리는 안됨
     400 - 잘못된 요청 - 요청의 구문이 잘못됨
     401 - 권한 없음 - 지정한 리소스에 대한 액세스 권한이 없음
     403 - 금지됨 - 지정한 리소스에 대한 엑세스가 금지됨
     404 - 찾을 수 없음 - 지정한 리소스를 찾을 수 없음
     500 - 서버오류 - 서버에 에러가 발생함
     501 - 구현되지 않음 - 요청한 url의 메소드에 대해 서버가 구현하고 있지 않다.
     502 - 불량 게이트웨이 - 게이트웨이 또는 프록시 역할을 하는 서버가 그 뒷단의 서버로부터 잘못된 응답을 받았다.

     과제와 상관없는 메모지만 자주 찾아보기에 기록
     프리즈마 제약 조건
     p2002 - 고유 제약 조건 실패 - unique나 id로 중복이 되면 안되는 값을 요청할 때 생기는 오류
     p2025 - 필요하지만 찾을 수 없는 하나 이상의 레코드에 의존하기 때문에 작업이 실패

5. **게임 경제**

   - 현재는 간편한 구현을 위해 캐릭터 테이블에 money라는 게임 머니 컬럼만 추가하였습니다.
     - 이렇게 되었을 때 어떠한 단점이 있을 수 있을까요?
     - 이렇게 하지 않고 다르게 구현할 수 있는 방법은 어떤 것이 있을까요?
   - 아이템 구입 시에 가격을 클라이언트에서 입력하게 하면 어떠한 문제점이 있을 수 있을까요?

   * money만 사용했들때 단점

   - 확장성이 부족하다. 게임이 진행 될 수록, 플레이 하는 유저가 많아질 수록 생기는 화폐는 많아지는데 사용처는 한정되어 인플레이션이 올 수 있다. 이렇게 시간이 지나갈 수록 재화의 목적이 처음 설계와 다르게 가치가 매우 줄어들어 재미(성장요소 등)을 반감시킬 수 있다. 업데이트를 꾸준히 하여 재화를 사용하는 방법도 있지만 전에 사용하던 아이템의 가치가 하락 할 수 있다.그러면 이를 해결하기 위해서 거래를 제한한다거나 상위 재화를 도입할텐데 이때 문제가 생긴다. 거래를 제한하면 마찬가지로 게임의 재미를 낮출 수도 있고(단순함, 서버를 이용하여 얻는 이득 등) 상위 재화를 도입할 때는 money라는 칼럼만 사용했기 때문에 코드의 구조를 새로 구성해야한다.

   * 다르게 구현하는 방법

   - 별도의 경제 시스템 테이블을 만들어 관리 하거나 NoSQL(여러 유형의 데이터베이스를 사용, 기존의 관계형 데이터베이스와는 다른 방식으로 데이터를 저장하고 관리하는 데이터베이스)를 사용한다. 이 데이터베이스에 게임 내 모든 재화(머니, 아이템, 경험치 등등)를 별도로 관리하여 캐릭터가 소유할 수 있도록 한다.

   * 아이템 구입시 가격을 클라이언트에서 입력하게 하면 어떠한 문제점이 있을 수 있을까요?

   - 클라이언트에서 임의로 가격을 조정해 아이템을 구입하게 되면 서버내 아이템의 가치가 없어질 뿐만 아니라 경제체제가 무너지게 된다. 화페의 존재 이유가 없으며 이는 게임이 유지되는데 큰 문제점이 있다.

6. 어려웠던 점
   - 사실 베이직 반 첫번째 수업을 진행하면서 너무 잘 가르쳐주셔서 api구현까지는 문제가 없었으나 두번째 수업이 진행될때 까지 미들웨어 구현에서 많이 힘들었습니다. api를 구현하면서 대부분이 강의를 따라가면 구현은 어렵지 않았으나 강의 자료를 찾아봐도 안되는게 미들웨어였습니다. 베이직 반 두번째 수업과 유정 튜터님의 집중 케어로 대부분이 해결 되었지만 오류가 많이 나오는게 오타나 문법 위주라서 기본기는 확실히 캠프 첫주차때보단 많이 늘었지만 이번 과제도 도움을 너무 많이 받기도 했고 아직 많이 부족함을 느꼈습니다. 도움을 받은 만큼 다음 프로젝트 시작 전까지는 배운 내용 최대한 숙지하겠습니다.
