import {useState, useEffect} from 'react'
import {Buffer} from 'buffer';
const Register = ({setJwt,setUser,jwt}) => {

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
        fetch('/users/register', requestOptions)
        .then(response => response.json())
        .then(data => {
            console.log(data)
            if(data.token) {
                setJwt(data.token)
                setUser(JSON.parse(Buffer.from(data.token.split(".")[1], "base64").toString()))
            }
        })

    }

  return (
    <div className='App'>
         <h2>Register</h2>
        <form onChange={handleChange} onSubmit={submit}>
            <input type="text" name="username"></input>
            <input type="password" name="password"></input>
            <input type="submit"></input>

        </form>
    </div>
  )
}

export default Register
