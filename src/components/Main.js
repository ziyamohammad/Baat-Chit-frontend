import axios from 'axios';
import { CircleUser, LogOut, MessageCircleMore, UserPlus } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import {useNavigate } from 'react-router'
import {toast} from "react-toastify"



function Main({loginuser}) {
  const[menu,setmenu]=useState("messages");
  const[users,setusers]=useState([]);
  const navigate = useNavigate();


  useEffect(()=>{
    const handleusers = async()=>{
     try {
       const response = await axios.post("http://localhost:3000/api/v1/user/fetchuser")
       console.log(response.data.data)
       const allusers=response.data.data
       setusers(allusers)
     } catch (error) {
       console.log("error");
     }
    }
    handleusers();
  },[])

 const handlelogout = async () => {
  try {
   await axios.post("http://localhost:3002/api/v1/user/logout", {}, {
  withCredentials: true
});
    localStorage.removeItem("loginuser");
    toast.success("User Logged Out successfully");
    navigate("/");
  } catch (error) {
    console.error("Logout error:", error);
    console.error("Logout response error:", error.response?.data);
    toast.error("Logout failed");
  }
};

  return (
    <div className = "main">
      <div className="sidebar">
         <div className="upper">
           <MessageCircleMore fill="#ACABAB" size="30px" onClick={()=>{setmenu("messages")}}/>
           <UserPlus fill="#ACABAB" size="30px" onClick={()=>{setmenu("allusers")}}/>
         </div>
         <div className="lower">
            <CircleUser fill="#ACABAB" size="30px" onClick={()=>{setmenu("profile")}}/>
            <LogOut fill="#ACABAB" size="30px" onClick={handlelogout}/>
         </div>
      </div>
      <div className="messagebar">
        {menu==="messages" && (
          <h2 className="messagehead">Messages</h2>
         
        )}
        {menu==="allusers" && (
          <>
           <h2 className="messagehead">All Users</h2>
            {users.map((items)=>{
            return (
              <div className="allusers">
                <div className="coverimage">
                  <img src ={items.image} alt="/" height="100%" width="100%"/>
                </div>
                <div className="messagename">
                   <span className = "username">{items.fullname}</span>
                   <span className="recentchats">hello how are you</span>
                </div>
               
              </div>
            )
          })}
          </>
        )}
        {menu==="profile" && (
          <div className="userprofile">
            <div className="userimage">
              <img src={loginuser.image} alt="/" height="100%" width="100%" />
            </div>
            <span className="username">{(loginuser.fullname).toUpperCase()}</span>
            <div className="parentemail">
            <span className="useremailhead">E-mail</span>
            <span className="useremail">{loginuser.email}</span>
            </div>
            <div className="parentphone">
               <span className="useremailhead">Phone Number</span>
            <span className="userphone">{loginuser.phone}</span>
            </div>
          </div>
        )}
       

      </div>
      <div className="message">

      </div>
    </div>
  )
}

export default Main
