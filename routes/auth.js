require('dotenv').config();
var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var User = require('../models/user');
var bcrypt = require('bcrypt');

var expressJWT = require('express-jwt');
var jwt = require('jsonwebtoken');

//don't use promises like then and such with mongoose, use callbacks in your routes
//you can use arrow functions and declarative

router.post('/login', (req,res,next)=>{
  let hashedPass = ''
  let passwordMatch = false

  console.log(req.body.password)

  User.findOne({email:req.body.email}, function(error, user){
    hashedPass = user.password
    //Compare hashedPass to submitted password
    passwordMatch = bcrypt.compareSync(req.body.password, hashedPass)
    if (passwordMatch){
      //Passwords match...
      var token = jwt.sign(user.toObject(), process.env.JWT_SECRET, {
        expiresIn: 60 * 60 *24 //expires in 24hr
      })
      res.json({user, token})
    } else {
      console.log('Passwords don"t match')
      res.status(401).json({
        error: true,
        message: "email or password is incorrect"
      })
    }
  })
})

router.post('/signup', (req,res,next)=>{
  User.findOne({email: req.body.email}, function(err, user){
    if(user){
      res.redirect('/auth/login')
    } else {
      User.create({
        name:req.body.name,
        email:req.body.email,
        password:req.body.password
      }, (err,user)=>{
        if(err){
          console.log(err);
          res.send(err)
        } else {
          var token = jwt.sign(user.toObject(),process.env.JWT_SECRET,{
            expiresIn: 60*60*24
          })
          console.log(token)
          res.json({user,token})
        }
      })
    }
  })
})

router.post('/me/from/token', (req,res,next)=>{
  //check for presence of a token
  var token = req.body.token
  if(!token){
    res.status(401).json({message:'Must pass the token'})
  } else {
    jwt.verify(token,process.env.JWT_SECRET, (err, user)=>{
      if(err){
        res.status(401).send(err)
      } else {
        User.findById({
          '_id': user._id
        }, function(err,user){
          if(err) {
            res.status(401).send(err)
          } else {
            res.json({user,token})
          }
        })
      }
    })
  }
})

module.exports = router;
