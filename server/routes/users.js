var express = require('express');
var router = express.Router();
const bcrypt = require('bcryptjs');
const mongoose = require("mongoose");
const {body, validationResult} = require('express-validator')
const User = require('../models/Users');
const jwt = require("jsonwebtoken");
const validateToken = require('../auth/validateToken.js');
const multer = require('multer');
const { validate } = require('../models/Users');
const { ObjectId } = require('mongodb');
const storage = multer.memoryStorage();
const upload = multer({storage})

//Login user
router.post('/login',
upload.none(),
(req,res) => {
  const user = User.findOne({username: req.body.username}, (err, user) => {
    if(err) throw err;
    if(!user) {
      return res.status(403).json({message: "Login failed"});
    } else {
      bcrypt.compare(req.body.password, user.password, (err, isMatch) => {
        if(err) throw err;
        if(isMatch) {
          const jwtPayload = {
            id: user._id,
            username: user.username,
          }
          console.log(process.env.SECRET)
          jwt.sign(
            jwtPayload,
            process.env.SECRET,
            {
              expiresIn: 600
            },
            (err, token) => {
              res.json({success: true, token, username: user.username});
            }
          );
        }
        else {
          res.json({message: "Invalid credentials"})
        }
      })
    }

  })
}
)


// Create admin account. This requires that the users document on the testdb database is empty, so it can initialize the admin account.
// Admin username is "admin" and password is "admin1234567"
User.findOne({}, async (err,user) => {
  console.log(user)
  if(user==null){
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash("admin1234567", salt, (err,hash) => {
        if(err) throw err;
        User.create(
          {
            username: "admin",
            password: hash,
            _id: new ObjectId('admin1234567')
          },
          (err, ok) => {
            if(err) throw err;
            ok.save()
            console.log(ok._id)
          });
        })
      })
  }});


  // Get all of the users
router.get('/list', (req, res, next) => {
  User.find({}, (err,users) => {
    console.log(users)

  })
  res.json({status: "Users ok."})
})

// Register a new user. 
// Username needs to be over 3 characters long, and the password needs to be a strong password.
router.post("/register",upload.none(),
  body("username").isLength({min: 3}),
  body("password").isStrongPassword(),
  (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
      console.log(JSON.stringify(req.body))
      return res.json({errors: errors.array()})
    } else {
    User.findOne({username: req.body.username}, (err, user) => {
      if(err) throw err
      if(user) {
        return res.json({message: "Username already in use"})
      } else {
        console.log("Adding new user");
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(req.body.password, salt, (err,hash) => {
            if(err) throw err;
            User.create(
              {
                username: req.body.username,
                password: hash
              },
              (err, ok) => {
                if(err) throw err;
                return res.json({user: ok});
              });
            })
          })
        }
      })
    }
});
module.exports = router;
