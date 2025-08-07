import axios from 'axios';
import { CircleUser, LogOut, MessageCircleMore, UserPlus } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import {useNavigate } from 'react-router'
import {toast} from "react-toastify"
import io from "socket.io-client"



function Main({loginuser}) {
  const[menu,setmenu]=useState("messages");
  const[users,setusers]=useState([]);
  const navigate = useNavigate();
  const[online,setonline]=useState([])


  useEffect(()=>{
    const handleusers = async()=>{
     try {
       const response = await axios.post("https://baat-chit-backend1.onrender.com/fetchuser",{withCredentials:true})
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
   await axios.post("https://baat-chit-backend1.onrender.com/api/v1/user/logout", {}, {
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

//socket
useEffect(()=>{
  const socketConnection = io("https://baat-chit-backend1.onrender.com",
    {
      auth:{
        id : loginuser._id,
      }
    }
  )
  
  // socketConnection.on("message-user",(data)=>{
  //   console.log("message from",data)
  // })
  socketConnection.on("onlineuser",(onlineuser)=>{
     setonline(onlineuser)
  })

  return ()=>(
    socketConnection.disconnect()
  )
},[loginuser._id])

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
              const isOnline = online.includes(items._id);
            return (
              <div className="allusers">
                <div className="coverimage">
                  <img src ={items.image} alt="/" height="100%" width="100%"/>
                   {isOnline && (
          <span
            style={{
              position: "absolute",
              bottom: "11px",
              left: "10px",
              width: "14px",
              height: "14px",
              backgroundColor: "green",
              borderRadius: "50%",
              border: "2px solid white"
            }}
          />
        )}
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
             <h2 className="messagehead">Profile</h2>
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
