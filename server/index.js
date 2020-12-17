const express = require('express')
//express 모델을 가지고 온다, 익스프레스를 다운로드 했으므로 모듈을 가져올 수 있다.
const app = express()
//function을 이용해서 새로운 express app을 만든다
const port = 5000
//백 서버 port
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const { auth } = require('./middleware/auth');

const { User } = require('./models/User');

//application
//bodyparser가 client에서 오는 정보를 서버에서 분석하여 가져올 수 있게
app.use(bodyParser.urlencoded({ extended: true }));

//application/json
//json타입을 분석하여 가져올 수 있게
app.use(bodyParser.json());
app.use(cookieParser());

const mongoose = require('mongoose')
mongoose.connect('mongodb+srv://yuracho:<password>@boilerplate.pqoyn.mongodb.net/<dbname>?retryWrites=true&w=majority',{
  
useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false  
}).then(() => console.log('connected to database successfully'))
.catch(err => console.log(err))

app.get('/', (req, res) => {
  res.send('hello world')
    //root 디렉토리에 hello world가 출력되게 해준다
})

app.get('/api/hello', (req, res) => {
  res.send('HELLO')
})

app.post('/api/users/register', (req, res) => {
  //회원가입시 필요한 정보들을 client에서 가져오면 그것들을 데이터베이스에 넣어준다.
  
  const user = new User(req.body)
  //인스턴스 생성, bodyparser를 이용해서 request, body로 client에서 보내는 정보를 받아준다
  user.save((err, userInfo) => {
    if(err) return res.json({ success: false, err})
    return res.status(200).json({
      success: true
      //status(200)은 성공했다는 의미
    })
  })
})

app.post('/api/users/login', (req, res) => {

   //1. 요청된 이메일을 데이터베이스에서 있는지 찾는다
  User.findOne({ email: req.body.email }, (err, user) => {
    if(!user){
      return res.json({
        loginSucces: false,
        message:"해당되는 유저가 없습니다."
      })
    }
  //2. 유저가 있다면, 요청한 이메일이 데이터베이스에 있다면 맞는 비밀번호인지 확인한다
    user.comparePassword(req.body.password, (err, isMatch ) => {
      if(!isMatch)
      return res.json({ loginSucces: false, message:"비밀번호가 틀렸습니다."})
      
  //3. 비밀번호가 맞다면 token을 생성한다
      user.generateToken((err, user) => {
          if(err) return res.status(400).send(err);
          
  // 토큰을 저장한다 어디에? 쿠키, 로컬스토리지 등, 여러곳에 가능하고 장단점이 다르다.
          res.cookie("x_auth", user.token)
          .status(200)
          .json({ loginSucces: true, userId: user._id})
      })
    })
  })
})

//role 1 admin, role 2 특정부서어드민
//role 0 일반유저 role 0이 아니면 관리자
app.get('/api/users/auth', auth, (req, res) => {
  res.status(200).json({
    _id: req.user._id,
    isAdmin: req.user.role === 0 ? false : true,
    isAuth: true,
    email: req.user.email,
    name: req.user.name,
    lastname: req.user.lastname,
    role: req.user.role,
    image: req.user.image
  })
})

app.get('/api/users/logout', auth, (req, res) => {
  User.findOneAndUpdate({ _id: req.user._id },
    { token: "" }
    , (err, user) => {
      if (err) return res.json({ success: false, err });
      return res.status(200).send({
        success: true
      })
    })
})
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
  //port 5000번에서 실행이 되게 해준다
  //app이 5000번에 listen하면 console이 print된다.