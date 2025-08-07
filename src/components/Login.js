import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import {toast} from "react-toastify"

function Login({handlelogin}) {
    const navigate=useNavigate();
      const[email,setemail]=useState("")
        const[password,setpassword]=useState("")
       

        const handlesubmit = async(e)=>{
             e.preventDefault();
          try {
               const response = await axios.post("http://localhost:3002/api/v1/user/login",
                {
                  email:email,
                  password:password
                },{
                  withCredentials:true
                }
               )
                
                console.log(response.data)
                toast.success("User loggedin Successfully")
                navigate("/main")
                handlelogin(response.data.data)
              
               
          } catch (error) {
            console.log("error in logging in user")
            toast.error("Please Signup first")
            navigate("/signup")
           
          }
        }
  return (
     <div className ="login">
      <div className="signupform">
        <h4 className="signuphead">Welcome to Baat-Chit</h4>
        <form onSubmit={handlesubmit}>
              <div className="email">
                <label for ="email" className="emaillabel">Email:</label>
                <input type ="text" className="emailinput" value={email} onChange={(e)=>{setemail(e.target.value)}}/>
            </div>
            <div className="password">
                 <label for ="password" className="passwordlabel">Password:</label>
                 <input type ="password" className="passwordinput" value={password} onChange={(e)=>{setpassword(e.target.value)}}/>
            </div>
             <button className ="formsubmit" type='submit'>Login</button>
             <span className ="newuser">New user ? Please <Link to ="/signup">SignUp</Link></span>
        </form>
       </div>
     </div>
  )
}

export default Login
