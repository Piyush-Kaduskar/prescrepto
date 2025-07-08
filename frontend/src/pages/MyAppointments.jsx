import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import { toast } from 'react-toastify';
import axios from 'axios';
import {useNavigate} from 'react-router-dom';


const MyAppointments = () => {
  const {backendurl,token}=useContext(AppContext);
  const navigate=useNavigate();
  const [appointments,setAppointments]=useState([])
  const months=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
  const slotDateFormat=(slotDate)=>{
    const dateArray=slotDate.split('_');
    return dateArray[0]+" "+months[Number(dateArray[1])-1]+" "+dateArray[2];
  }
  const getUserAppointments=async()=>{
            try{
               
                    const{data}=await axios.get(backendurl+'/api/user/appointments',{headers:{token}})
                    if(data.success){
                        setAppointments(data.appointments.reverse());
                     
                    } else{
                        toast.error(data.message);
                    }
               
            } catch(error){
                   console.log(error);
                   toast.error(error.message);
            }
  }
 const cancelAppointment=async(appointmentId)=>{
             try{
               
                    const{data}=await axios.post(backendurl+'/api/user/cancel-appointment',{appointmentId},{headers:{token}})
                    if(data.success){
                        toast.success(data.message);
                        getUserAppointments();
                     
                    } else{
                        toast.error(data.message);
                    }
               
            } catch(error){
                   console.log(error);
                   toast.error(error.message);
            }
 }
 const initPay=(order)=>{
    const options={
      key:import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount:order.amount,
      currency:order.currency,
      name:'Appointmnet payment',
      description:'Appointmnet payment',
      order_id:order.id,
      receipt:order.receipt,
      handler:async(response)=>{
           try{
               
                    const{data}=await axios.post(backendurl+'/api/user/verify-razorpay',{response},{headers:{token}})
                    if(data.success){
                      
                        toast.success(data.message);
                        getUserAppointments();
                        navigate('/my-appointments')
                     
                    } else{
                        toast.error(data.message);
                    }
               
            } catch(error){
                   console.log(error);
                   toast.error(error.message);
            }
      }
    
    
    }
    try{
    const rzp=new window.Razorpay(options);
    rzp.open()
    }catch(error){
      console.error('Razorpay error:', error);
    }
 }
const appointmentRazorpay=async(appointmentId)=>{
             try{
               
                    const{data}=await axios.post(backendurl+'/api/user/payment-razorpay',{appointmentId},{headers:{token}})
                    if(data.success){
                      console.log(data.order);
                        initPay(data.order);
                        
                     
                    } else{
                        toast.error(data.message);
                    }
               
            } catch(error){
                   console.log(error);
                   toast.error(error.message);
            }
 }
  useEffect(()=>{
    getUserAppointments();
  },[token])
  return  appointments &&  (
   
   <div>
      <p className='pb-3 mt-12 border-b border-gray-200 font-medium text-zinc-700'>My Appointments</p>
      <div >
      {appointments.slice(0,3).map((item,index)=>(
          <div className='grid grid-cols-[1fr_2fr] gap-4 sm:flex sm:gap-6 py-2 border-b border-gray-200' key={index}>
            <div><img className='w-32 bg-indigo-50' src={item.docData.image} alt="" /></div>
            <div className='flex-1 text-sm text-zinc-600'>
              <p className='text-neutral-800 font-semi-bold'>{item.docData.name}</p>
              <p>{item.docData.speciality}</p>
              <p className='text-zinc-700 font-medium mt-1'>Address</p>
              <p className='text-xs '>{item.docData.address.line1}</p>
              <p className='text-xs'>{item.docData.address.line2}</p>
              <p className='text-xs mt-1'><span className='text-sm text-neutral-700 font-medium' >Date and Time</span> {slotDateFormat(item.slotDate)} | {item.slotTime}</p>
            </div>
            <div></div>
            <div className='flex flex-col gap-2 justify-center'>
              {!item.cancelled && item.payment && !item.isCompleted && <button className='sm:min-w-48 py-2 border rounded text-stone-500 bg-indigo-50'>Paid</button>}
             {!item.cancelled && !item.payment && !item.isCompleted &&  <button onClick={()=>appointmentRazorpay(item._id)} className='text-sm text-stone-500 text-center sm:min-w-48 py-2 border rounded hover:bg-primary hover:text-white transition-all duration-300'>Pay Online</button>} 
              {!item.cancelled && !item.isCompleted &&  <button onClick={()=>cancelAppointment(item._id)} className='text-sm text-stone-500 text-center sm:min-w-48 py-2 border rounded hover:bg-red-600 hover:text-white transition-all duration-300'>Cancel Appointment</button>} 
             {item.cancelled && !item.isCompleted &&  <button className='sm:min-w-48 py-2 border border-red-500 rounded text-red-500'>Appointment cancelled</button>}
             {item.isCompleted &&  <button className='sm:min-w-48 py-2 border border-green-500 rounded text-green-500'>Completed</button>}
            </div>
          </div>
          


        ))}
      </div>
    </div>
  )
}

export default MyAppointments
