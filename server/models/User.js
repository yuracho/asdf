// const mongoose = require('mongoose');
// const bcrypt = require('bcrypt');
// const saltRounds = 10
// // //salt가 몇글자인가? 10자인 salt를 이용하여 비밀번호를 암호화 한다
// const jwt = require('jsonwebtoken');

// const userSchema = mongoose.Schema({
//     name: {
//         type: String,
//         maxlength: 50
//     },
//     email: {
//         type: String,
//         trim: true,
//         //trim은 스페이스를 없애주는 역할
//         unique: 1
//         //같은 이메일을 생성하지 못하게
//     },
//     password: {
//         type: String,
//         minlength: 5
//     },
//     lastname: {
//         type: String,
//         maxlength: 50
//     },
//     role: {
//     //유저는 관리자유저 또는 일반유저 나뉘어서 role로 역할을 준다
//         type: Number,
//         default: 0
//     //ex) 1번 경우 관리자유저  2번 경우 일반유저로 나눌 수 있다
//     //값을 주지 않으면 임의로 0을 부여하겠다.
//     },
//     image: String,
//     //이미지는 중괄호 생략가능
//     token: {
//         type: String
//     //유효성검사 가능
//     },
//     tokenExp: {
//         type: Number
//     }
// })
//      //스키마생성


// userSchema.pre('save', function (next) {
//     var user = this;
//      //비밀번호를 암호화 시킨다.
//     if (user.isModified('password')) {
//         //비밀번호를 암호화 시킨다.
//         bcrypt.genSalt(saltRounds, function (err, salt) {
//             if (err) return next(err)
//             //에러가 났다면

//             //제대로 동작한다면
//             bcrypt.hash(user.password, salt, function (err, hash) {
//                 if (err) return next(err)
//                 user.password = hash
//                 next()
//             })
//         })
//     } else {
//         next()
//     }
// })


// userSchema.methods.comparePassword = function (plainPassword, cb) {

//     //plainPassword 1234567    암호회된 비밀번호 $2b$10$l492vQ0M4s9YUBfwYkkaZOgWHExahjWC
//     bcrypt.compare(plainPassword, this.password, function (err, isMatch) {
//         if (err) return cb(err);
//         cb(null, isMatch);
//     })
// }

// userSchema.methods.generateToken = function (cb) {
//     var user = this;
//     // console.log('user._id', user._id)

//     // jsonwebtoken을 이용해서 token을 생성하기 
//     var token = jwt.sign(user._id.toHexString(), 'secretToken')
//     // user._id + 'secretToken' = token 
//     // -> 
//     // 'secretToken' -> user._id

//     user.token = token
//     user.save(function (err, user) {
//         if (err) return cb(err)
//         cb(null, user)
//     })
// }


// userSchema.statics.findByToken = function(token, cb){
//     var user = this;

//     //토큰을 decode한다
//     jwt.verify(token, 'secretToken' , function(err, decode) {
//        //유저 아이디를 이용해서 유저를 찾은 후 클라이언트에서 가져온 token과 db에 보관된 토큰이 일치하는지 확인
       
//        user.findOne({"_id": decode, "token": token}, function(err, user){
//            if(err) return cb(err);
//            cb(null, user)
//        })
//     });
// }

// const User = mongoose.model('User', userSchema)
// // ('모델이름','스키마')
// // 스키마를 모델로 감싸준다.

// module.exports = { User }
// //해당 모듈을 다른 곳에서도 사용이 가능할 수 있게

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10
const jwt = require('jsonwebtoken');


const userSchema = mongoose.Schema({
    name: {
        type: String,
        maxlength: 50
    },
    email: {
        type: String,
        trim: true,
        unique: 1
    },
    password: {
        type: String,
        minlength: 5
    },
    lastname: {
        type: String,
        maxlength: 50
    },
    role: {
        type: Number,
        default: 0
    },
    image: String,
    token: {
        type: String
    },
    tokenExp: {
        type: Number
    }
})


userSchema.pre('save', function (next) {
    var user = this;
    if (user.isModified('password')) {
        //비밀번호를 암호화 시킨다.
        bcrypt.genSalt(saltRounds, function (err, salt) {
            if (err) return next(err)

            bcrypt.hash(user.password, salt, function (err, hash) {
                if (err) return next(err)
                user.password = hash
                next()
            })
        })
    } else {
        next()
    }
})


userSchema.methods.comparePassword = function (plainPassword, cb) {

    //plainPassword 1234567    암호회된 비밀번호 $2b$10$l492vQ0M4s9YUBfwYkkaZOgWHExahjWC
    bcrypt.compare(plainPassword, this.password, function (err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    })
}

userSchema.methods.generateToken = function (cb) {
    var user = this;
    // console.log('user._id', user._id)

    // jsonwebtoken을 이용해서 token을 생성하기 
    var token = jwt.sign(user._id.toHexString(), 'secretToken')
    // user._id + 'secretToken' = token 
    // -> 
    // 'secretToken' -> user._id

    user.token = token
    user.save(function (err, user) {
        if (err) return cb(err)
        cb(null, user)
    })
}

userSchema.statics.findByToken = function(token, cb) {
    var user = this;
    // user._id + ''  = token
    //토큰을 decode 한다. 
    jwt.verify(token, 'secretToken', function (err, decoded) {
        //유저 아이디를 이용해서 유저를 찾은 다음에 
        //클라이언트에서 가져온 token과 DB에 보관된 토큰이 일치하는지 확인
        user.findOne({ "_id": decoded, "token": token }, function (err, user) {
            if (err) return cb(err);
            cb(null, user)
        })
    })
}



const User = mongoose.model('User', userSchema)

module.exports = { User }