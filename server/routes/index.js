var express = require('express');
var router = express.Router();
const mongoose = require("mongoose");
const Books = require("../models/Books");
const Posts = require("../models/Posts");
const Users = require('../models/Users');
const { ObjectId } = require('mongodb');
//For authentication:
const jwt = require('jsonwebtoken');
const validateToken = require('../auth/validateToken.js');
const bcrypt = require('bcryptjs');
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});



// Get all of the posts from the database
router.get('/api/posts/', function(req,res,next) {

  Posts.find({}, function(err, posts) {
    if(err) {
      console.log(err);
      throw err
    } else {
      res.json(posts)
    }
  })


})

// Post a new codesnippet
router.post('/api/codepost/', validateToken, function(req, res, next) {
  let date = new Date();
  console.log(date.toLocaleString())
  // Likes, and comments will be initialized as empty
    Posts.create(
      {
        name: req.body.name,
        content: req.body.content,
        edited: date.toLocaleString(),
        userid: req.body.userid,
        likes: {
          users: [],
          votes: []
        },
        comments: []
      },
      (err, ok) => {
        if(err) throw err;
        return res.json(ok)
      })
  });

  // Post a new comment for specific code snippet
  router.post('/api/codecomment/', validateToken, function(req, res, next) {
    console.log(req.body)
    let date = new Date();
    Posts.findOne({_id: req.body._id}, (err, post) => {
      if(err) {
        console.log(err);
        throw err
      };
      if(post){
        console.log(post.comments)
        let comment = {
          text: req.body.comment,
          user: req.body.user,
          userid: req.body.userid,
          edited: date.toLocaleString(),
          likes: {
            users:[],
            votes:[]
          }
        }
        console.log(post.comments)
        console.log(comment)
        post.comments.push(comment);
        post.save()
        return res.json(post)
      } 
    });
  })

  // Upvote or downvote a code snippet.
  router.post('/api/codevote/', validateToken, function(req, res, next) {
    console.log(req.body)
    Posts.findOne({_id: req.body._id}, (err, post) => {
      if(err) {
        console.log(err);
        throw err
      };
      if(post){
        let foundUserIndex = post.likes.users.indexOf(req.body.user) // Find if the user has already voted
        if(foundUserIndex >= 0) { // User already voted -> change the previous vote
          post.likes.votes[foundUserIndex] = req.body.vote;
          post.save()
          return res.json(post)
        } else { // Add new vote
        post.likes.votes.push(req.body.vote);
        post.likes.users.push(req.body.user)
        post.save()
        return res.json(post)
        }
      } 
    });
  })

  // Upvote or downvote comment
  router.post('/api/commentvote/', validateToken, function(req, res, next) {
    console.log(req.body)
    Posts.findOne({_id: req.body._id}, (err, post) => {
      if(err) {
        console.log(err);
        throw err
      };
      if(post){
        let commentIndex = req.body.index;
        let foundUserIndex = post.comments[commentIndex].likes.users.indexOf(req.body.user)// Find if the user has already voted
        console.log(foundUserIndex)
        if(foundUserIndex >= 0) { //User already voted
          post.comments[commentIndex].likes.votes[foundUserIndex] = req.body.vote;
          post.save()
          return res.json(post)
        } else { // Add new vote
        post.comments[commentIndex].likes.votes.push(req.body.vote);
        post.comments[commentIndex].likes.users.push(req.body.user)
        post.save()
        return res.json(post)
        }
      } 
    });
  })



  // Edit a post which exists already.
  router.post('/api/editpost/', validateToken, function(req, res, next) {
    console.log(req.body)
    let date = new Date();
    Posts.findOne({_id: req.body._id}, (err, post) => {
      if(err) {
        console.log(err);
        throw err
      };
      if(post){
        post.content = req.body.content;
        post.edited = date.toLocaleString()
        post.save()
        return res.json(post)
      } 
    });
  })
    
  // Edit a comment which exists already.
  router.post('/api/editcomment/', validateToken, function(req, res, next) {
    console.log(req.body)
    let date = new Date();
    Posts.findOne({_id: req.body._id}, (err, post) => {
      if(err) {
        console.log(err);
        throw err
      };
      if(post){
        let commentIndex = req.body.index;
        post.comments[commentIndex].text = req.body.content;
        post.comments[commentIndex].edited = date.toLocaleString()
        post.save()
        return res.json(post)
      } 
    });
  })

  // Delete a comment from a code snippet post.
  router.post('/api/deletecomment/', validateToken, function(req, res, next) {
    console.log(req.body)
    Posts.findOne({_id: req.body._id}, (err, post) => {
      if(err) {
        console.log(err);
        throw err
      };
      if(post){
        let commentIndex = req.body.index;
        post.comments.splice(commentIndex,1) // Remove the comment on the given index
        post.save()

      } 
    });
  })

  // Delete a post from the database.
  router.post('/api/deletepost/', validateToken, function(req, res, next) {
    console.log(req.body)
    Posts.findOneAndRemove({_id: req.body._id}, function(err,data) {
      if(err) throw err;
      res.json({delete:"success"})
    })
  })


module.exports = router;
