import axios from "axios";
import { createContext, useState } from "react"
import { toast } from "react-toastify";

export const AdminContext = createContext();

const AdminContextProvider = (props) => {
    const [atoken,setAToken]=useState(localStorage.getItem('aToken')?localStorage.getItem('aToken'):'');
    const backendurl=import.meta.env.VITE_BACKEND_URL
    const [doctors,setDoctors]=useState([]);
    const [appointments,setAppointments]=useState([]);
    const[dashData,setDashData]=useState(false);
    const getAllDoctors=async()=>{
        try{
               
                    const{data}=await axios.post(backendurl+'/api/admin/all-doctors',{},{headers:{atoken}})
                    if(data.success){
                        setDoctors(data.doctors);
                        //console.log(data.doctors);
                    } else{
                        toast.error(data.message);
                    }
               
            } catch(error){
                   toast.error(error.message);
            }
    } 
    const changeAvailability=async(docId)=>{
            try{
               
                    const{data}=await axios.post(backendurl+'/api/admin/change-availability',{docId},{headers:{atoken}})
                    if(data.success){                        
                        toast.success(data.message);
                        getAllDoctors();
                    } else{
                        toast.error(data.message);
                    }
               
            } catch(error){
                   toast.error(error.message);
            }
    }
    const cancelAppointment=async(appointmentId)=>{
            try{
               
                    const{data}=await axios.post(backendurl+'/api/admin/cancel-appointment',{appointmentId},{headers:{atoken}})
                    if(data.success){       
                                              toast.success(data.message);                  
                        getAllAppointments();
                    } else{
                        toast.error(data.message);
                    }
               
            } catch(error){
                   toast.error(error.message);
            }
    }
    const getAllAppointments=async()=>{
         try{
               
                    const{data}=await axios.get(backendurl+'/api/admin/appointments',{headers:{atoken}})
                    if(data.success){     
                    
                        setAppointments(data.appointments)
                    } else{
                        toast.error(data.message);
                    }
               
            } catch(error){
                   toast.error(error.message);
            }
    }
     const getDashData=async()=>{
         try{
               
                    const{data}=await axios.get(backendurl+'/api/admin/dashboard',{headers:{atoken}})
                    if(data.success){     
                    
                        setDashData(data.dashData);
                    } else{
                        toast.error(data.message);
                    }
               
            } catch(error){
                   toast.error(error.message);
            }
    }
    const value = {
        atoken,setAToken,backendurl,doctors,getAllDoctors,changeAvailability,cancelAppointment,appointments,setAppointments,getAllAppointments,dashData,setDashData,getDashData
    }
    return (
        <AdminContext.Provider value={value}>
            {props.children}
        </AdminContext.Provider>
    )
}
export default AdminContextProvider