const express = require("express");
const app = express();
const port = 5000;

//DB
const connect = require('./config/db');
connect();


//Register
const {User} = require("./models/User");
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.post('/api/users/register', async (req, res) => {
    try {
        await User.create(req.body);
        res.status(200).json({success: true});
    }
    catch(e) {
        console.log(e);
        res.json({success: false, e});
    }
//   const user = new User(req.body);
//   user.save((err) => {
//     if(err) {
//         console.log(err);
//         return res.json({success: false, err});
//     }
//     return res.status(200).json({success: true});
//   })
})





//Login
const cookieParser = require('cookie-parser')
app.use(cookieParser())
app.post('/api/users/login', (req, res) => {
    User.findOne({ email: req.body.email }, (err, user) => {
        if(!user) {
            return res.json({
                loginSuccess: false, 
                message: "요청된 이메일에 해당하는 유저가 없습니다."
            })
        }
        user.comparePassword(req.body.password, (err, isMatch) => {
            if(!isMatch)
                return res.json({ loginSuccess: false, message: "비밀번호가 틀렸습니다"})
            user.generateToken((err, user) => {
                if(err) return res.status(400).send(err);
                res.cookie("x_auth", user.token)
                    .status(200)
                    .json({ loginSuccess: true, userId: user._id })
            })
        })
    }) 
})


//인증
const { auth } = require("./auth")
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

//Logout
app.get('/api/users/logout',(req, res) => {
    User.findOne({_id: req.user_id}, (err, user) => {
        if(err)return res.json({success: false, err});
        
        return res.clearCookie("x_auth").status(200).send({success: true});
    })
})


app.listen(port , () => {
  console.log(`Listening on port ${port}`);
})