import userModel from '../models/userModel.js'
import validator from 'validator'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import {v2 as cloudinary} from 'cloudinary'
import doctorModel from '../models/doctorModel.js'
import appointmentModel from '../models/appointmentModel.js'
import razorpay from 'razorpay'
export const registerUser=async(req,res)=>{
     try{
      const{name,email,password}=req.body;

      if(!name || !email || !password ){
          
         return res.json({
               success:false,
               message:'Missing Details'
          })
         
      }
      if(!validator.isEmail(email)){
         return res.json({
               success:false,
               message:'Enter a valid mail id'
          })
      }
      if(password.length<8){
         return res.json({
               success:false,
               message:'Enter a strong password'
          })
      }

      const hashedpassword=await bcrypt.hash(password,10);

      const userData={
        name,email,password:hashedpassword
      }

      const newUser=new userModel(userData);
      const user=  await newUser.save();

      const token=jwt.sign({id:user._id},process.env.JWT_SECRET)


     
           return res.json({
               success:true,
               token
          })
      


     }catch(error){
           console.log(error);
           return res.json({
               success:false,
               message:error.message
          })

     }
}

export const loginUser=async(req,res)=>{
     try{
      const{email,password}=req.body;

      const user=await userModel.findOne({email});


      if(!user){
               return res.json({
               success:false,
               message:'User doesnt exist'
          })
      }
      const isMatch=await bcrypt.compare(password,user.password);
      if(isMatch){
          const token=jwt.sign({id:user._id},process.env.JWT_SECRET)
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
//api to get user profile data
export const getProfile=async(req,res)=>{
     try{
      const userId=req.user.id;

      const userData=await userModel.findById(userId).select('-password');


              
               return res.json({
               success:true,
               userData})

     }catch(error){
           console.log(error);
           return res.json({
               success:false,
               message:error.message
          })

     }
}

//update user profile

export const updateProfile=async(req,res)=>{
     try{
      const userId=req.user.id;    
      const{name,phone,address,dob,gender}=req.body
      const imageFile=req.file
      
      if(!name || !phone || !dob || !gender){
          return res.json({
               success:false,
               message:'Data missing'
          })
      }

      await userModel.findByIdAndUpdate(userId,{name,phone,address:JSON.parse(address),dob,gender});
      if(imageFile){
          //upload image to cloudinary
          const imageUpload=await cloudinary.uploader.upload(imageFile.path,{resource_type:'image'})
          const imageURL=imageUpload.secure_url;
          await userModel.findByIdAndUpdate(userId,{image:imageURL});
         
     }

      
               return res.json({
               success:true,
                message:'User profile updated'})

     }catch(error){
           console.log(error);
           return res.json({
               success:false,
               message:error.message
          })

     }
}

//api to book appointment
export const bookAppointment=async(req,res)=>{
     try{
      const userId=req.user.id;
       const{docId,slotDate,slotTime}=req.body
      const docData=await doctorModel.findById(docId).select('-password');
      if(!docData.available){
          return res.json({
               success:false,
               message:'Doctor not available'
          })
      }
      let slots_booked=docData.slots_booked;

      if(slots_booked[slotDate]){
            if(slots_booked[slotDate].includes(slotTime)){
               return res.json({
               success:false,
               message:'Slot not available'
          })
            } else{
               slots_booked[slotDate].push(slotTime);
            }
      } else{
          slots_booked[slotDate]=[]
          slots_booked[slotDate].push(slotTime);
      }

      const userData=await userModel.findById(userId).select('-password');
      delete docData.slots_booked;

      const appointmentData = {
          userId,
          docId,
          userData,
          docData,
          amount:docData.fees,
          slotTime,
          slotDate,
          date:Date.now()
      }

      const newAppointment=new appointmentModel(appointmentData);
      newAppointment.save();

      await doctorModel.findByIdAndUpdate(docId,{slots_booked});

              
               return res.json({
               success:true,
               message:'Appointment booked'})

     }catch(error){
           console.log(error);
           return res.json({
               success:false,
               message:error.message
          })

     }
}


//api to get user appointment
export const listAppointment=async(req,res)=>{
     try{
      const userId=req.user.id;
      const appointments=await appointmentModel.find({userId});
               return res.json({
               success:true,
               appointments})

     }catch(error){
           console.log(error);
           return res.json({
               success:false,
               message:error.message
          })

     }
}

export const cancelAppointment=async(req,res)=>{
     try{
      const userId=req.user.id;
      const {appointmentId}=req.body
      const appointmentData=await appointmentModel.findById(appointmentId);
      if(appointmentData.userId!==userId){
            return res.json({
               success:false,
               message:'Unauthorized action'
          })

      }
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


const razorpayInstance=new razorpay({
     key_id:process.env.RAZORPAY_KEY_ID,
     key_secret:process.env.RAZORPAY_KEY_SECRET
})
//api to make payment pf appointment using razorpay
export const paymentRazorpay=async(req,res)=>{
     try{
      const userId=req.user.id;
      const {appointmentId}=req.body
      const appointmentData=await appointmentModel.findById(appointmentId);
      if(!appointmentData || appointmentData.cancelled){
          return res.json({
               success:false,
               message:'Appointment cancelled or not found'})
      }

      //create options for razorpay payment
      const options={
          amount:appointmentData.amount*100,
          currency:process.env.CURRENCY,
          receipt:appointmentId

      }
      //creation of an order
      const order=await razorpayInstance.orders.create(options);


               return res.json({
               success:true,
               order})

     }catch(error){
           console.log(error);
           return res.json({
               success:false,
               message:error.message
          })

     }
}
//api to verify payment
export const verifyRazorpay=async(req,res)=>{
     try{
      const {response}=req.body
      const orderInfo=await razorpayInstance.orders.fetch(response.razorpay_order_id);

      if(orderInfo.status==='paid'){
                await appointmentModel.findByIdAndUpdate(orderInfo.receipt,{payment:true}); 
                 return res.json({
               success:true,
               message:'Payment successful'})
      }
      else{
               return res.json({
               success:false,
               message:'Payment failed'})
      }
               

     }catch(error){
           console.log(error);
           return res.json({
               success:false,
               message:error.message
          })

     }
}