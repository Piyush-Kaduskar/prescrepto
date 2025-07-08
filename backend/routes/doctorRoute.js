import express from 'express'
import {  appointmentCancel, appointmentComplete, appointmentsDoctor, doctorDashboard, doctorList, getProfile, loginDoctor, updateProfile } from '../controllers/doctorController.js';
import { authDoctor } from '../middlewares/authDoctor.js';

const doctorRouter= express.Router();
doctorRouter.get('/list',doctorList);
doctorRouter.get('/appointments',authDoctor,appointmentsDoctor);
doctorRouter.get('/profile',authDoctor,getProfile);
doctorRouter.post('/update-profile',authDoctor,updateProfile);
doctorRouter.post('/complete-appointment',authDoctor,appointmentComplete);
doctorRouter.post('/cancel-appointment',authDoctor,appointmentCancel);
doctorRouter.get('/dashboard',authDoctor,doctorDashboard);
doctorRouter.post('/login',loginDoctor);

export default doctorRouter;