import './App.css';
import {useState, useEffect} from 'react';
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom'
import Posts from './components/Posts';
import Appbar from './components/Appbar';
import Login from './components/Login';
import Register from './components/Register';
import {Buffer} from 'buffer';
function App() {

  // Control the states of jwt and user.
  const [jwt, setJwt] = useState("")
  const [user, setUser] = useState({})


  useEffect(() => {
    // Get the jwttoken from local storage if it exists,
    let jwtToken = localStorage.getItem('jwt_token');
    if(jwtToken) {
      setJwt(localStorage.getItem('jwt_token') || "default");
      setUser(JSON.parse(Buffer.from(localStorage.getItem('jwt_token').split(".")[1], "base64").toString()))
    }
  }, [])

  return (
    //Router handles the paths
    <Router>
    <div className="App">
      <Appbar user={user} jwt={jwt} setJwt={setJwt} setUser={setUser}></Appbar>
      <Routes>
        <Route path="/" element={<Posts user={user} jwt={jwt} setJwt={setJwt}/>}></Route>
        <Route path="/users/login" element={<Login setJwt={setJwt} setUser={setUser} jwt={jwt}/>}></Route>
        <Route path="/users/register" element={<Register setJwt={setJwt} setUser={setUser} jwt={jwt}/>}></Route>
      </Routes>
    </div>
    </Router>
  );
}

export default App;
