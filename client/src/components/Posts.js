import React from 'react'
import Button from '@mui/material/Button';
import {useState, useEffect} from 'react';
import Post from './Post';
import Box from '@mui/material/Box';
import { Pagination } from '@mui/material';
import TextField from '@mui/material/TextField'
const Posts = ({user,jwt,setJwt}) => {
    const [posts, setPosts] = useState([]); // handles the fetched posts.
    const [text, setText] = useState('');
    const [page, setPage] = useState(1); // Handles the pagination used (which page are we currently on.)

    useEffect(() => { // Fetch the post data from the database
        fetch('/api/posts/')
        .then(response => response.json())
        .then(json => setPosts(json))

    }, [])


    const onSubmit = (e) => { // Add new post.
        e.preventDefault();
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 
                        'Accept': 'application/json',
                        'Authorization': 'Bearer '+jwt
          },
            body: JSON.stringify({
                name: user.username,
                content: text,
                userid: user.id
            })
        };
        fetch('/api/codepost/', requestOptions)
        .then(response => response.json())
        .then(json =>  {
          if(json.Error) {
            localStorage.removeItem('jwt_token') // If the token has expired, then remove the jwt token from the storage and reset its state.
            setJwt("");
          } else {
           setPosts([...posts, json]) //Set the posts state as the data fetched
          }
        })
        }


  return (
    <div>
    {posts.slice((page-1)*10,(page-1)*10+10).map((p,postindex) => ( // Slicing is used to get only 10 posts per page shown.
        <Box
        sx={{
          width: 300,
          height: '100%',
          backgroundColor: 'primary.dark',
          mx: "42%",
          '&:hover': {
            backgroundColor: 'primary.main',
            opacity: [0.9, 0.8, 0.7],
          },
        }} key={p._id}
        ><Post key={p._id} data={p} user={user} jwt={jwt} setJwt={setJwt} posts={posts} setPosts={setPosts} postindex={postindex}/></Box> // Add new post components
    ))}
    <Pagination count={10}
    sx={{
    mx: "40%",
    width:"100%"
    }}
    onChange={(e,value) => {
      console.log(value)
      setPage(value)
    }}

    />
    <Box
    sx={{
          width: 300,
          height: 300,
          backgroundColor: 'pink',
          position: "relative",
          mx: "42%",
          '&:hover': {
            backgroundColor: 'pink',
            opacity: [0.9, 0.8, 0.7],
          }
        }}>

        <TextField
          id="outlined-multiline-flexible"
          sx={{
            position: "inherit",
            width: "100%"
          }}
          multiline
          maxRows={8}
          onChange={(e => setText(e.target.value))}
        ></TextField>
        {user?.id?.length>0 ?
        <Button variant="contained" sx={{
            backgroundColor: "#ad8291",
            width: "100%",
            position: "inherit"

        }}
        onClick={onSubmit}
        >Submit</Button>
        :
        <Button variant="contained" sx={{
          backgroundColor: "#ad8291",
          width: "100%",
          position: "inherit" }}>Please log in.</Button>
      }
    </Box>
    
    </div>
  )
}

export default Posts
