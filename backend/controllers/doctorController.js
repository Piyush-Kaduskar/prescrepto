import doctorModel from "../models/doctorModel.js";
import appointmentModel from '../models/appointmentModel.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

export const changeAvailability=async(req,res)=>{
     try{
      const{docId}=req.body
      const docData=await doctorModel.findById(docId);
      await doctorModel.findByIdAndUpdate(docId,{
        available: !docData.available
      })

      return res.json({
               success:true,
               message:'Availability changed'
          })

     }catch(error){
           console.log(error);
           return res.json({
               success:false,
               message:error.message
          })

     }
}

export const doctorList=async(req,res)=>{
     try{
      const doctors=await doctorModel.find({}).select(['-password','-email']);
      return res.json({
               success:true,
               doctors
          })

     }catch(error){
           console.log(error);
           return res.json({
               success:false,
               message:error.message
          })

     }
}
//api for admin login
export const loginDoctor=async(req,res)=>{
     try{
      const{email,password}=req.body;
      const doctor=await doctorModel.findOne({email});
     if(!doctor){
            return res.json({
               success:false,
               message:'Invalid credentials'
          })
     }
     const isMatch=await bcrypt.compare(password,doctor.password)
     if(isMatch){
          const token=jwt.sign({id:doctor._id},process.env.JWT_SECRET)
           return res.json({
               success:true,
               token
          })
     }
     else{
           return res.json({
               success:false,
               message:'Invalid credentials'
          })
     }

     }catch(error){
           console.log(error);
           return res.json({
               success:false,
               message:error.message
          })

     }
}

//api to get all appointments
export const appointmentsDoctor=async(req,res)=>{
     try{
          const docId=req.user.id;
      const appointments=await appointmentModel.find({docId});
      return res.json({
               success:true,
               appointments
          })

     }catch(error){
           console.log(error);
           return res.json({
               success:false,
               message:error.message
          })

     }
}
//api to mark appointment as completed
export const appointmentComplete=async(req,res)=>{
     try{
        const docId=req.user.id;
      const {appointmentId}=req.body
      const appointmentData=await appointmentModel.findById(appointmentId);
      if( appointmentData && appointmentData.docId==docId){
            
          await appointmentModel.findByIdAndUpdate(appointmentId,{isCompleted:true});
          return res.json({
               success:true,
               message:'Appointment completed'
          })

      }
      else{
          return res.json({
               success:false,
                message:'Mark failed'})
      }
               

     }catch(error){
           console.log(error);
           return res.json({
               success:false,
               message:error.message
          })

     }
}
//api to mark appointment as cancelled
export const appointmentCancel=async(req,res)=>{
     try{
        const docId=req.user.id;
      const {appointmentId}=req.body
      const appointmentData=await appointmentModel.findById(appointmentId);
      if( appointmentData && appointmentData.docId==docId){
            
          await appointmentModel.findByIdAndUpdate(appointmentId,{cancelled:true});
          return res.json({
               success:true,
               message:'Appointment cancelled'
          })

      }
      else{
          return res.json({
               success:false,
                message:'Cancellation failed'})
      }
               

     }catch(error){
           console.log(error);
           return res.json({
               success:false,
               message:error.message
          })

     }
}
//api to get dashboard data
export const doctorDashboard=async(req,res)=>{
     try{
            const docId=req.user.id;

      const appointments=await appointmentModel.find({docId});
      let earnings=0;
      appointments.map((item,index)=>{
             if(item.isCompleted || item.payment)
               {
                    earnings+=item.amount
               }
      })
      let patients=[]
       appointments.map((item,index)=>{
             if(!patients.includes(item.userId))
               {
                   patients.push(item.userId);
               }
      })

      const dashData={
          earnings,appointments:appointments.length,
          patients:patients.length,
          latestAppointments:appointments.reverse().slice(0,5)
      }
      return res.json({
               success:true,
               dashData
          })

     }catch(error){
           console.log(error);
           return res.json({
               success:false,
               message:error.message
          })

     }
}

//api to get doctor profile for doctor panel
export const getProfile=async(req,res)=>{
     try{
      const docId=req.user.id;

      const profileData=await doctorModel.findById(docId).select('-password');


              
               return res.json({
               success:true,
               profileData})

     }catch(error){
           console.log(error);
           return res.json({
               success:false,
               message:error.message
          })

     }
}
//api to update doctor profile for doctor panel
export const updateProfile=async(req,res)=>{
     try{
      const docId=req.user.id;    
      const{fees,address,available}=req.body.updateData
   
      
   

      await doctorModel.findByIdAndUpdate(docId,{fees,address,available});
     

      
               return res.json({
               success:true,
                message:'Doctor profile updated'})

     }catch(error){
           console.log(error);
           return res.json({
               success:false,
               message:error.message
          })

     }
}