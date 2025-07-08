import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './config/mongodb.js';
import connectCloudinary from './config/cloudinary.js';
import adminRouter from './routes/adminRoute.js';
import doctorRouter from './routes/doctorRoute.js';
import userRouter from './routes/userRoute.js';

//app config
const app=express();
const port= process.env.PORT || 4000;
connectDB();
connectCloudinary();

//allow multiple origins
const allowedOrigins = ['http://localhost:5174','http://localhost:5173','https://prescripto-frontend-u86w.onrender.com'.'https://prescripto-admin-3ryg.onrender.com']


//middleware
app.use(express.json())
app.use(cors({origin: allowedOrigins,credentials:true}));


//api endpoint
app.use('/api/admin/',adminRouter)
app.use('/api/doctor/',doctorRouter)
app.use('/api/user/',userRouter)

app.get('/',(req,res)=>{
  res.send("API IS WORKING FINE");
})

app.listen(port,()=>{console.log(`Server started at http://localhost:${port}`)});

