//api for adding doctor
import validator from 'validator'
import bcrypt from 'bcrypt'
import {v2 as cloudinary} from 'cloudinary'
import doctorModel from '../models/doctorModel.js'
import appointmentModel from '../models/appointmentModel.js'
import jwt from 'jsonwebtoken'
import userModel from '../models/userModel.js'
export const addDoctor=async(req,res)=>{
     try{
      const{name,email,password,speciality,degree,experience, about, fees, address}=req.body;
      const imageFile=req.file;
      //console.log({name,email,password,speciality,degree,experience, about, fees, address},imageFile);
      // checking all data to add in doctor model
      if(!name || !email || !password || !speciality || !degree || !experience || !about ||!fees || !address){
          return res.json({
               success:false,
               message:'Missing details'
          })
      }
      //validating email format
      if(!validator.isEmail(email)){
          return res.json({
               success:false,
               message:'Please enter valid email'
          })
      }
     //validating strong password
      if(password.length<8){
          return res.json({
               success:false,
               message:'Please enter strong password'
          })
      }

      //hashing password
      const hashedPassword=await bcrypt.hash(password,10);

      //upload image to cloudinary
      const imageUpload= await cloudinary.uploader.upload(imageFile.path,{resource_type:"image"});
      const imageURL=imageUpload.secure_url;

      const doctorData={
         name,
         email,
         image:imageURL,
         password:hashedPassword,
         speciality,degree,
         experience,about,fees,
         address:JSON.parse(address),
         date:Date.now()

      }
      const newDoctor=new doctorModel(doctorData);
      await newDoctor.save();

      return res.json({
          success:true,
          message:'Doctor added'
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
export const loginAdmin=async(req,res)=>{
     try{
      const{email,password}=req.body;
      const imageFile=req.file;

      if(email ===process.env.ADMIN_EMAIL && password ===process.env.ADMIN_PASSWORD){
          
           const token=jwt.sign(email+password,process.env.JWT_SECRET);
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
//api to get list of all doctors for admin panel 
export const allDoctors=async(req,res)=>{
     try{
      const doctors=await doctorModel.find({}).select('-password');
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
//api to get all appointments
export const appointmentsAdmin=async(req,res)=>{
     try{
      const appointments=await appointmentModel.find({});
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
//api to cancel appointment
export const appointmentCancel=async(req,res)=>{
     try{

      const {appointmentId}=req.body
      const appointmentData=await appointmentModel.findById(appointmentId);

      await appointmentModel.findByIdAndUpdate(appointmentId,{cancelled:true});
      const{docId,slotDate,slotTime}=appointmentData;
      const docData=await doctorModel.findById(docId);
      let slots_booked=docData.slots_booked;
      slots_booked[slotDate]=slots_booked[slotDate].filter(e=>e!==slotTime);
      await doctorModel.findByIdAndUpdate(docId,{slots_booked});

               return res.json({
               success:true,
                message:'Appointment cancelled'})

     }catch(error){
           console.log(error);
           return res.json({
               success:false,
               message:error.message
          })

     }
}
//api to get dashboard data
export const adminDashboard=async(req,res)=>{
     try{
      const doctors=await doctorModel.find({})
      const users=await userModel.find({})
      const appointments=await appointmentModel.find({});
      const dashData={
          doctors:doctors.length,
          appointments:appointments.length,
          patients:users.length,
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