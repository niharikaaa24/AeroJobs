import express from "express";
const app= express();
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config({});
import connectDB from "./utils/db.js";
import userRoute from "./routes/user.js"
import companyRoute from "./routes/company.js"
import jobRoute from "./routes/job.js";
import applicationRoute from "./routes/application.js";

app.get("/home", (req,res)=>{
    return res.status(200).json({
        message: "I am coming from backend",
        success: true
    })
})
const corsOptions = {
    origin:'http://localhost:5173',
    credentials:true
}

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cors((corsOptions)));
app.use(cookieParser());

app.use("/api/v1/user", userRoute);
app.use("/api/v1/company", companyRoute);
app.use("/api/v1/job", jobRoute);
app.use("/api/v1/application", applicationRoute);

const PORT=  process.env.PORT ||3000 
app.listen(PORT, ()=>{
    connectDB();
    console.log(`Server connected at PORT:${PORT}`)
})