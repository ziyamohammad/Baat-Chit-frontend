
import './App.css';
import Navbar from './components/Navbar';
import { BrowserRouter as Router,Routes ,Route } from 'react-router'
import Signup from './components/Signup';
import Login from './components/Login';
import Main from './components/Main';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from "react-toastify";
import { useEffect, useState } from 'react';


function App() {
  const [loginuser, setUser] = useState(() => {
  // Try to load from localStorage first
 
 
  const storedUser = localStorage.getItem("loginuser");
  return storedUser ? JSON.parse(storedUser) : null;
});
 useEffect(() => {
    if (loginuser) {
      localStorage.setItem("loginuser", JSON.stringify(loginuser));
    }
  }, [loginuser]);

 const handlelogin = (userData) => {
    setUser(userData);
  };

  useEffect(()=>{
    console.log(loginuser)
  })

  return (
    <div className="App">
     <Navbar/>
     <Router>
      <Routes>
        <Route path="/" element={<Login handlelogin={handlelogin} />} />
        <Route path="/signup" element={<Signup/>}/>
        <Route path ="/main"  element={<Main loginuser={loginuser}/>}/>
      </Routes>
     </Router>
      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
}

export default App;
