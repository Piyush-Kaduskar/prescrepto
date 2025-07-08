import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
export const AppContext=createContext();
import axios from 'axios'

const AppContextProvider=(props)=>{

    const currency='$';
    const backendurl=import.meta.env.VITE_BACKEND_URL
    const [doctors,setDoctors]=useState([]);
    const [userData,setUserData]=useState(false);
    const[token,setToken]=useState(localStorage.getItem('token')?localStorage.getItem('token'):'');
    const getDoctorsData=async()=>{
        try{
               
                    const{data}=await axios.get(backendurl+'/api/doctor/list')
                    if(data.success){
                        setDoctors(data.doctors);
                        //console.log(data.doctors);
                    } else{
                        toast.error(data.message);
                    }
               
            } catch(error){
                   console.log(error);
                   toast.error(error.message);
            }
    } 

    const loadUserProfileData=async()=>{
         try{
               
                    const{data}=await axios.get(backendurl+'/api/user/get-profile',{headers:{token}})
                    if(data.success){
                        setUserData(data.userData);
                        //console.log(data.doctors);
                    } else{
                        toast.error(data.message);
                    }
               
            } catch(error){
                   console.log(error);
                   toast.error(error.message);
            }
    }
   
    useEffect(()=>{
        getDoctorsData()
    },[doctors])
    useEffect(()=>{
          if(token){
            loadUserProfileData();
          }
          else{
            setUserData(false)
          }
    },[token])
    const value={
          doctors,getDoctorsData,currency,token,setToken,backendurl,userData,setUserData,loadUserProfileData
    }
    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}
export default AppContextProvider;