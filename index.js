// express 가져옴
const express = require('express');
// mongoose 가져옴
const mongoose = require('mongoose');
// const bodyParser = require('body-parser'); //express 최신버전엔 내장돼있음

// express를 실행해서 웹 서버 객체인 app을 생성->라우터를 만들고 서버를 띄울 때 계속 쓰는 '서버 본체'
const app = express();

// express에게 "EJS"를 뷰 엔진으로 쓴다고 알려줌
app.set('view engine', 'ejs');
// JSON 데이터로 요청이 들어오면 자동으로 해석해서 req.body에 담아주는 설정
app.use(express.json()); // 구버전 : app.use(bodyParser.json());
// JSON 데이터 말고 그냥 form 데이터 보낼 때 받는 설정
app.use(express.urlencoded({ extended: true }));


// MongoDB 연결
mongoose.connect('mongodb://localhost:27017/kny', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoDB 연결 성공!'))
  .catch((err) => console.error('MongoDB 연결 실패:', err));
  
// 몽고db에 저장되는 공지사항 데이터의 구조를 미리 지정
// 몽고 db는 oracle과는 다르게 기본적으로 비정형 데이터를 저장하기 때문에
// 정해진 필드를 가진 공지사항 게시판을 만들 때 스키마로 데이터 구조를 미리 정의해두고
// model을 만들어서 그 구조를 따라서 몽고 db에서 저장하거나 불러오는 작업을 함
const noticeSchema = new mongoose.Schema({
  TITLE: String, // 제목
  CONTENT: String, // 내용
  USER: String, // 작성자
  CREATED_AT: String // 작성날짜
});

// Notice라는 이름의 모델을 만듬(해당 모델은 noticeSchema 구조를 따름)
// mongoose는 자동으로 모델의 이름을 lowercase + 복수형으로 바꿔서 몽고 디비에 저장
// (Notice->notices / User->users)
// 그래서 mongoose.model()의 세번째 인자에 실제 컬렉션의 명칭을 기재해줘야함
// 그렇지 않으면 우리는 NOTICE로 컬렉션을 이미 만들어뒀는데 NOTICES 컬렉션이 새로 생성돼버림
const Notice = mongoose.model('Notice', noticeSchema, 'NOTICE');

// CRUD url

// [C] 입력 폼 띄우기
app.get('/write', function(req, res){
  res.render('write');
});

// [C] 저장
app.post('/write', async function(req, res){
  try {
    const { title, content } = req.body;

    const newNotice = new Notice({
      TITLE: title,
      CONTENT: content,
      USER: '관리자',
      CREATED_AT: new Date().toISOString().split('T')[0] // YYYY-MM-DD
    });

    await newNotice.save();
    res.redirect('/'); // 저장 후 리스트 페이지로 이동
  } catch (err) {
    console.error('저장 실패:', err);
    res.status(500).send('공지사항 저장 중 오류 발생');
  }
});

// [R] 전체 리스트 가지고 오기
app.get('/', async function(req, res){
  try {
    const notices = await Notice.find().sort({ createdAt: -1 }); // 최신순
    res.render('list', { notices }); // notices를 list.ejs로 넘김
  } catch (err) {
    res.status(500).send('공지사항을 불러오는 중 에러 발생');
  }
});

// [R] 상세 페이지 조회하기
app.get('/detail/:id', async function(req, res){
  try {
    const id = req.params.id;

    const detailNotice = await Notice.findOne({ _id: id });

    if (!detailNotice) {
      return res.status(404).send('해당 공지사항을 찾을 수 없습니다.');
    }

    res.render('detail', { detailNotice });
  } catch (err) {
    console.error('[DB 또는 렌더링 에러]', err);
    res.status(500).send('상세페이지 가져오던 중 에러 발생');
  }
});

// [U] 수정 폼 띄우기
app.get('/update/:id', async function(req, res){
  const id = req.params.id;
  const detailNotice = await Notice.findOne({ _id: id });

  if (!detailNotice) {
    return res.status(404).send('해당 공지사항을 찾을 수 없습니다.');
  }

  res.render('update', { detailNotice });
})

// [U] 수정
app.post('/update/:id', async function(req, res){
  const id = req.params.id;
  const { title, content } = req.body;

  if (!id) return res.status(400).send('게시글 id 누락');

  try {
    const result = await Notice.updateOne(
      { _id: id },
      {
        $set: {
          TITLE: title,
          CONTENT: content
        }
      }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).send('업데이트할 문서 찾기 실패');
    }

    res.redirect(`/detail/${id}`);
  } catch (err) {
    console.error('업데이트 실패:', err);
    res.status(500).send('서버 오류');
  }
})

// [D] 삭제
app.get('/delete/:id', async function(req, res){
  const id = req.params.id;
  try {
    await Notice.deleteOne({ _id: id });
    res.redirect('/'); // 삭제 후 목록 페이지로 이동
  } catch (err) {
    console.error('삭제 오류:', err);
    res.status(500).send('삭제 실패');
  }
});



// 고정 폴더인 public 등록(js 파일들 저장할 거임)
app.use(express.static('public'));

// 서버 시작
app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});

