import {useState, useEffect} from 'react'
import  { Link } from 'react-router-dom'
import {Buffer} from 'buffer';
const Login = ({setJwt,setUser,jwt}) => {

    const [userData, setUserData] = useState({})


    const handleChange = (e) => {
        setUserData({...userData, [e.target.name]: e.target.value})

    }

    const submit = (e) => {
        e.preventDefault();
        console.log(userData)
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 
                        'Accept': 'application/json'
          },
            body: JSON.stringify(userData),
            mode: "cors"
        };
        fetch('/users/login', requestOptions)
        .then(response => response.json())
        .then(data => {
            console.log(data)
            if(data.token) { // Redirect the user to main page after logging in. Also set the token to local storage if succesfull login.
                localStorage.setItem('jwt_token',data.token)
                localStorage.setItem('jwt_user', JSON.parse(Buffer.from(data.token.split(".")[1], "base64").toString()))
                setUser(JSON.parse(Buffer.from(data.token.split(".")[1], "base64").toString()))
                window.location.href='/'
            }
        })

    }

  return (
    // Login form with 3 inputs.
    <div className='App'>
         <h2>Login</h2> 
        <form onChange={handleChange} onSubmit={submit}>
            <input type="text" name="username"></input>
            <input type="password" name="password"></input>
            <input type="submit" value="SUBMIT"></input>

        </form>
    </div>
  )
}

export default Login
