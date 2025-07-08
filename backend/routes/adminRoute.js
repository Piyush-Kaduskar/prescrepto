import express from 'express'
import {addDoctor, adminDashboard, allDoctors, appointmentCancel, appointmentsAdmin, loginAdmin} from '../controllers/adminController.js'
import upload from '../middlewares/multer.js'
import { authAdmin } from '../middlewares/authAdmin.js';
import { changeAvailability } from '../controllers/doctorController.js';

const adminRouter= express.Router();
adminRouter.post('/add-doctor',authAdmin,upload.single('image'),addDoctor);
adminRouter.post('/all-doctors',authAdmin,allDoctors);
adminRouter.post('/change-availability',authAdmin,changeAvailability);
adminRouter.post('/login',loginAdmin);
adminRouter.get('/appointments',authAdmin,appointmentsAdmin);
adminRouter.get('/dashboard',authAdmin,adminDashboard);
adminRouter.post('/cancel-appointment',authAdmin,appointmentCancel);

export default adminRouter;
