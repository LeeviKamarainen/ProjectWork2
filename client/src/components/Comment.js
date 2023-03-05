import React from 'react'
import {useState, useEffect} from 'react';
import Box from '@mui/material/Box';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import TextField from '@mui/material/TextField'
import RestoreFromTrashIcon from '@mui/icons-material/RestoreFromTrash';
import Button from '@mui/material/Button';
function Comment({data, user,jwt,setJwt, posts, setPosts, p, index,postindex, setOpen}) {
    const [commentvote, setCommentvote] = useState(data.comments[index].likes.votes.reduce((partialSum, a) => partialSum + a, 0)); 
    const [commentSelected, setCommentselected] = useState(data.comments[index].likes.votes[data.comments[index].likes.users.indexOf(user.id)]); // Set the states of upvotes for specific users. If they have selected a vote, it will be shown as it selected.
    const [date, setDate] = useState(data.comments[index].edited);
    let adminID = "61646d696e31323334353637"; // Id of the admin account used to check for admin actions. 
    const [text, setText] = useState('');
  

    const voteComment = (e, newSelected, index) => {
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
                user: user.id,
                index: index
            })
        };
          fetch('/api/commentvote/', requestOptions)
              .then(response => response.json())
              .then(json => {
                if(json.Error) {
                  localStorage.removeItem('jwt_token') // Remove token if token has expired
                  setJwt("");
                  setCommentselected(0);
                  setCommentvote(commentvote-newSelected)
                  }
                  else {
                  setCommentvote(json.comments[index].likes.votes.reduce((partialSum, a) => partialSum + a, 0))//Sum up the total votes of a comment and show it.
                  setCommentselected(newSelected)
                }
                })
              }
        }


        // Edit the current comment.
        const editComment = (e) => {
          e.preventDefault();
              const requestOptions = {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json', 
                              'Accept': 'application/json',
                              'Authorization': 'Bearer '+jwt
                },
                  body: JSON.stringify({
                      content: text,
                      _id: data._id,
                      index: index
                  })
              };
              fetch('/api/editcomment/', requestOptions)
              .then(response => response.json())
              .then(json =>  {
                if(json.Error) {
                  localStorage.removeItem('jwt_token')
                  setJwt("");
                } else {
                  setDate(json.comments[index].edited)
                  console.log(json)
                }
              })
          }

          const deleteComment = () => { // Delete current comment
              const requestOptions = {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json', 
                              'Accept': 'application/json',
                              'Authorization': 'Bearer '+jwt
                },
                  body: JSON.stringify({
                      _id: data._id,
                      index: index 
                  })
              };
              fetch('/api/deletecomment/', requestOptions)
              .then(response => response.json())
              .then(json =>  { 
              })
              
              fetch('/api/posts/') // Fetch the posts so we can refresh the posts state in real time after deletion
              .then(response => response.json())
              .then(json => {
                console.log(json)
                setPosts(json)
                setOpen(false) //Close the comment window when the comment is deleted.
              })
            }


  return (
    
    <Box key={'comment_'+index}
    sx={{
      width: "100%",
      height: '100%',
      backgroundColor: 'primary.light',
      '&:hover': {
        backgroundColor: 'primary.dark',
        opacity: [0.9, 0.8, 0.7],
      },
    }}
    >

    <p> User: {p.user} </p>
    {(data.comments[index].userid  == user.id  || user.id==adminID) ? <TextField // Users can edit own posts and admin can edit all posts
        id="outlined-multiline-flexible"
        sx={{
          position: "inherit",
          width: "100%"
        }}
        multiline
        maxRows={8}
        defaultValue={p.text}
        onChange={(e => setText(e.target.value))}
        onKeyDown={(e) => {
          if(e.key === 'Enter') {
            editComment(e)
          }
        }}
      ></TextField> : <p>{p.text}</p>}
   
    
        
    <ToggleButtonGroup
    value={commentSelected}
    key={'group_'+index}
    id = {'group_'+index}
    exclusive
    size="medium"
    onChange={(event, value) => voteComment(event, value, index)}
    aria-label="text alignment"
    >
    <ToggleButton 
    value = {1}
    aria-label="left aligned"
    key={'upvote_'+index}
    sx={{
      width: 20,
      height:20,
      backgroundColor: "#5c6bc0",
      "&.MuiToggleButton-root.Mui-selected": {
       backgroundColor: "#1b5e20"
      }
      }}><ArrowUpwardIcon
      key={'icon_'+index}/>
      </ToggleButton>
      
      <ToggleButton
      value = {-1}
      aria-label="right aligned"
      key={'downvote_'+index}
      sx={{
        width: 20,
        height:20,
        ml: "30%",
        backgroundColor: "#5c6bc0",
        "&.MuiToggleButton-root.Mui-selected": {
          backgroundColor: "#b71c1c"
         }
         }}>
      <ArrowDownwardIcon
      key={'icon_'+index}
      /></ToggleButton>
    </ToggleButtonGroup>
    <p  key={'commentvote_'+index}> VOTES: {commentvote} </p>
    <p>{date}</p>
    {(user.id==adminID) ? <Button variant="contained" // Show delete button for admins
        sx={{
          backgroundColor: "red",
          width: "100%",
          position: "inherit" }}
          onClick={() => {
            deleteComment(index)
          }}
          ><RestoreFromTrashIcon/></Button> : ''}
  


    </Box>
    
  )
}

export default Comment
