const { User } = require('../models/User');

let auth = (req, res, next) => {
    //인증처리하는곳

    //1. 클라이언트 쿠키에서 토큰을 가져온다.
    let token = req.cookies.x_auth;

    //2. 토큰을 복호화 한 후, 유저를 찾는다
    User.findByToken(token, (err, user) => {
        if (err) throw err;
        if (!user) return res.json({ isAuth: false, error: true })

        req.token = token;
        req.user = user;
        next();
        //next는 middleware에서 다음 영역으로 넘어가게 하기 위해
    })

    //3. 유저가 있을 시 인증 Okay,

    //4. 유저가 없다면 인증 No
}

module.exports = { auth };