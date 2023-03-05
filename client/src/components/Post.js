import {useState, useEffect} from 'react';
import React from 'react'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import SendIcon from '@mui/icons-material/Send';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Comment from './Comment';
import RestoreFromTrashIcon from '@mui/icons-material/RestoreFromTrash';
 function Post({data, user,jwt,setJwt, posts, setPosts, postindex}) {
  
  const [text, setText] = useState('');
  const [date, setDate] = useState(data.edited);
  const [userIndex, setUserIndex] = useState(data.likes.users.indexOf(user.id)) // get current users index
  const [open, setOpen] = useState(false); // Handles opening comments and closing them for each post.
  const [vote, setVote] = useState(data.likes.votes.reduce((partialSum, a) => partialSum + a, 0)); // Calculate the sum of the votes
  let adminID = "61646d696e31323334353637";
  const [selected, setSelected] = useState(data.likes.votes[userIndex]); // Set the states as current users selected likes

  const handleSelection = (event, newSelected) => {
    console.log(event)
    console.log(newSelected)
    if(jwt) {
    let voteSent;
    //Checking if the user decides to retract his/her vote back, and if so then reducing the vote from the database/react.
    if(newSelected==null) {
      voteSent = 0;
    } else {
      voteSent = newSelected;
    }

    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 
                  'Accept': 'application/json',
                  'Authorization': 'Bearer '+jwt
    },
      body: JSON.stringify({
          _id: data._id,
          vote: voteSent,
          user: user.id
      })
  };
    fetch('/api/codevote/', requestOptions)
        .then(response => response.json())
        .then(json => {
          if(json.Error) {
            localStorage.removeItem('jwt_token') // Remove tokens if they are expired
            setJwt("");
            setSelected(0);
            setVote(vote-newSelected)
            }
            else {
            setVote(json.likes.votes.reduce((partialSum, a) => partialSum + a, 0)) // Calculate the sum of the votes of a post
            setSelected(newSelected)
          }
          })
        }
  }


  const onComment = (e) => {
      const requestOptions = {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 
                      'Accept': 'application/json',
                      'Authorization': 'Bearer '+jwt
        },
          body: JSON.stringify({
              _id: data._id,
              comment: text,
              user: user.username,
              userid: user.id
          })
      };
      fetch('/api/codecomment/', requestOptions)
      .then(response => response.json())
      .then(json => {
        console.log(json);
        if(json.Error) {
          localStorage.removeItem('jwt_token') // Logout if the token is expired
          setJwt("");
        } else {
          let date = new Date();
          const nextPosts = posts.map((post) => { // Map through posts and add comment to one currently selected
            if(post._id == data._id) {
              console.log(post.comments)
              return{
                ...post,
                comments: [...post.comments, { // Update posts state so the comment gets immediately added to them
                  user: user.username,
                  text: text,
                  likes: {
                    users: [],
                    votes: []
                  },
                  edited: date.toLocaleString()
                }]
              }
            } else {
              return post
            }
          })
          console.log(nextPosts)
          setPosts(nextPosts)
        }
      })
  }

  const editPost = (e) => { // Edit the code snippet of target
    e.preventDefault();
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 
                        'Accept': 'application/json',
                        'Authorization': 'Bearer '+jwt
          },
            body: JSON.stringify({
                content: text,
                _id: data._id
            })
        };
        fetch('/api/editpost/', requestOptions)
        .then(response => response.json())
        .then(json =>  {
          if(json.Error) {
            localStorage.removeItem('jwt_token') // Logout if token has expired
            setJwt("");
          } else {
            setDate(json.edited) // set the state of the text as well
          }
        })
    }

    const deletePost = (postindex) => { // Handles deleting the post (admin only)
      const requestOptions = {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 
                      'Accept': 'application/json',
                      'Authorization': 'Bearer '+jwt
        },
          body: JSON.stringify({
              _id: data._id,
              index: postindex
          })
      };
      fetch('/api/deletepost/', requestOptions) // Fetch the delete post request.
      .then(response => response.json())
      .then(json =>  { 
        console.log(json)
      })
      
      fetch('/api/posts/') // We fetch the posts data again after deletion so we can update the posts state in real tim.
      .then(response => response.json())
      .then(json => {
        setPosts(json)
      })
    }


  return (
    <div>
        <p>Username: {data.name}</p>
        {(data.userid == user.id || user.id==adminID) ? // Change the view depending if the user is admin or not. If the user is either owner of the post or admin, then they can edit those posts.
        <TextField
        id="outlined-multiline-flexible"
        sx={{
          position: "inherit",
          width: "100%"
        }}
        multiline
        maxRows={8}
        defaultValue={data.content}
        onChange={(e => setText(e.target.value))}
        onKeyDown={(e) => {
          if(e.key === 'Enter') {
            editPost(e)
          }
        }}
      ></TextField>
      :
       <p>{data.content}</p>
      }

      <ToggleButtonGroup
        value={selected}
        exclusive
        onChange={handleSelection}
        aria-label="text alignment"
        >
        <ToggleButton 
        value = {1}
        aria-label="left aligned"
        sx={{
          backgroundColor: "#5c6bc0",
          "&.MuiToggleButton-root.Mui-selected": {
           backgroundColor: "#1b5e20"
          }
          }}><ArrowUpwardIcon/>
          </ToggleButton>
          
          <ToggleButton
          value = {-1}
          aria-label="right aligned"
          sx={{
            backgroundColor: "#5c6bc0",
            "&.MuiToggleButton-root.Mui-selected": {
              backgroundColor: "#b71c1c"
             }
             }}>
          <ArrowDownwardIcon/></ToggleButton>
        </ToggleButtonGroup>

        <p>{vote}</p>
        <p>{date}</p>
        <Button variant="contained" 
        sx={{
          backgroundColor: "inherit+1",
          width: "100%",
          position: "inherit" }}
          onClick={() => {
            setOpen(!open)
            console.log(open)
          }}
          >Show comments:</Button>
        {open ? // Handles opening the comments and closing them.
        data.comments.map((p,index) => 
        <Comment key={"comment_"+index} data={data} user={user} jwt={jwt} setJwt={setJwt} posts={posts} setPosts={setPosts} p={p} index={index} postindex={postindex}></Comment>
        )
          : null
      }
      {(user.id==adminID) ? <Button variant="contained"  //Admins can see delete button
        sx={{
          backgroundColor: "red",
          mt: "5%",
          width: "50%",
          position: "inherit" }}
          onClick={() => {
            deletePost(postindex)
          }}
          ><RestoreFromTrashIcon/></Button> : ''}

        <p>Leave a comment:</p>
        <TextField
          id="outlined-multiline-flexible"
          sx={{
            position: "inherit",
            width: "100%"
          }}
          multiline
          maxRows={8}
          onChange={(e => setText(e.target.value))}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton edge="end" color="inherit"
                onClick={onComment}
                >
                  <SendIcon></SendIcon>
                </IconButton>
              </InputAdornment>)}}
        ></TextField>
    </div>
  )
}

export default Post
