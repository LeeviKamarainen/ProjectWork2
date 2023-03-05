import React from 'react'
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import {BrowserRouter as Router, Link} from 'react-router-dom'
const Appbar = ({user,jwt, setJwt,setUser}) => {
  return (
    // This is the appbar on top of the page. If user has logged in, it will show the username on the top left, and change the login button to logout.
    <AppBar position="static">
        <Toolbar>
        <Button color="inherit" component={Link} to="/">Home</Button>
        <p>{jwt ? `Welcome ${user.username}` : '' }</p> 
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Code Snippets Page.
          </Typography>
        <Button color="inherit" component={Link} to="/users/register">Register</Button>
        {!user?.id?.length>0 ?
        <Button color="inherit" component={Link} to="/users/login">Login</Button>
        :
        <Button color="inherit" onClick={() => {
          // If the user clicks the logout button, then user will be redirected to index page, and the JWT/User states will get refreshed and the jwt token from the local storage gets removed.
            setJwt("");
            setUser({});
            localStorage.removeItem('jwt_token');
            window.location.href='/'
        }}>Logout</Button>
        }
        </Toolbar>
    </AppBar>
  );
}

export default Appbar
