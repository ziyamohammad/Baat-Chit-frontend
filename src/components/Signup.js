import axios from 'axios'
import React, { useState } from 'react'
import { useNavigate } from 'react-router'
import { toast } from 'react-toastify'



function Signup() {
    const[name,setname]=useState("")
    const[email,setemail]=useState("")
    const[password,setpassword]=useState("")
    const[image,setimage]=useState()
    const[number,setnumber]=useState("")
    const navigate=useNavigate();

    const handlesubmit = async(e)=>{
      e.preventDefault()
      const formData = new FormData()
      formData.append("fullname",name)
      formData.append("email",email)
      formData.append("password",password)
      formData.append("image",image)
      formData.append("phone",number)
       for (let pair of formData.entries()) {
      console.log(`${pair[0]}:`, pair[1]);
    }

      try {
        const response = await axios.post(`https://baat-chit-backend1.onrender.com/api/v1/user/register`,formData,{withCredentials:true})
        console.log(response)
        toast.success("User Registered Successfully")
        navigate("/")
      } catch (error) {
        console.log("error in registering")
        toast.error("something went wrong")
      }
    }
  return (
    <div className ="signup">
      <div className="signupform">
        <h4 className="signuphead">Welcome to Baat-Chit</h4>
        <form onSubmit={handlesubmit}>
            <div className="name">
             <label for ="name" className="namelabel">Name:</label>
             <input type ="text" className="nameinput" value={name} onChange={(e)=>{setname(e.target.value)}}/>
            </div>
            <div className="email">
                <label for ="email" className="emaillabel">Email:</label>
                <input type ="text" className="emailinput" value={email} onChange={(e)=>{setemail(e.target.value)}}/>
            </div>
            <div className="phonenumber">
                <label for ="number" className="numberlabel">Phone Number:</label>
                <input type ="tel" className="numberinput" value={number} onChange={(e)=>{setnumber(e.target.value)}}/>
            </div>
            <div className="password">
                 <label for ="password" className="passwordlabel">Password:</label>
                 <input type ="password" className="passwordinput" value={password} onChange={(e)=>{setpassword(e.target.value)}}/>
            </div>
            <div className="image">
                  <label for ="image" className="imagelabel">Profile Image:</label>
                  <input type ="file" className="imageinput"  accept="image/*" onChange={(e)=>{setimage(e.target.files[0])}}/>
            </div>
            <button className ="formsubmit" type='submit'>Register</button>
        </form>
      </div>
    </div>
  )
}

export default Signup
