import axios from "axios";
import { createContext, useEffect, useState } from "react"
import { toast } from "react-toastify";

export const DoctorContext = createContext();

const DoctorContextProvider = (props) => {
    const [appointments,setAppointments]=useState([])
    const [dashData,setDashData]=useState([])
    const [profileData,setProfileData]=useState([])
    const [dtoken,setDToken]=useState(localStorage.getItem('dToken')?localStorage.getItem('dToken'):'');
    const backendurl=import.meta.env.VITE_BACKEND_URL
    const getAppointments=async()=>{
        try{
               
                    const{data}=await axios.get(backendurl+'/api/doctor/appointments',{headers:{dtoken}})
                    if(data.success){
                        setAppointments(data.appointments.reverse());
                        
                    } else{
                        toast.error(data.message);
                    }
               
            } catch(error){
                   toast.error(error.message);
            }
    }
    const completeAppointment=async(appointmentId)=>{
           try{
               
                    const{data}=await axios.post(backendurl+'/api/doctor/complete-appointment',{appointmentId},{headers:{dtoken}})
                    if(data.success){
                        getAppointments()
                        toast.success(data.message);
                    } else{
                        toast.error(data.message);
                    }
               
            } catch(error){
                   toast.error(error.message);
            }
    } 
      const cancelAppointment=async(appointmentId)=>{
           try{
               
                    const{data}=await axios.post(backendurl+'/api/doctor/cancel-appointment',{appointmentId},{headers:{dtoken}})
                    if(data.success){
                        getAppointments()
                        toast.success(data.message);
                    } else{
                        toast.error(data.message);
                    }
               
            } catch(error){
                   toast.error(error.message);
            }
    } 
     const getDashData=async()=>{
        try{
               
                    const{data}=await axios.get(backendurl+'/api/doctor/dashboard',{headers:{dtoken}})
                    if(data.success){
                        setDashData(data.dashData);
                    } else{
                        toast.error(data.message);
                    }
               
            } catch(error){
                   toast.error(error.message);
            }
    }
     const getProfileData=async()=>{
        try{
               
                    const{data}=await axios.get(backendurl+'/api/doctor/profile',{headers:{dtoken}})
                    if(data.success){
                        setProfileData(data.profileData);
                    } else{
                        toast.error(data.message);
                    }
               
            } catch(error){
                   toast.error(error.message);
            }
    }
  
    const value = {dtoken,setDToken,backendurl,appointments,setAppointments,getAppointments,completeAppointment,getDashData,dashData,profileData,setProfileData,getProfileData,setDashData,cancelAppointment}
    return (
        <DoctorContext.Provider value={value}>
            {props.children}
        </DoctorContext.Provider>
    )
}
export default DoctorContextProvider