import React, { useEffect, useState } from 'react'
import Navbar from '../shared/Navbar'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { RadioGroup } from '../ui/radio-group'
import { Button } from '../ui/button'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { USER_API_END_POINT } from '@/utils/constant'
import { toast } from 'sonner'
import { useDispatch, useSelector } from 'react-redux'
import { setLoading } from '@/redux/authSlice'
import { Loader2 } from 'lucide-react'

const Signup = () => {

    const [input, setInput] = useState({
        fullname: "",
        email: "",
        phoneNumber: "",
        password: "",
        role: "", // Will be "student" or "recruiter"
        file: ""
    });
    const {loading,user} = useSelector(store=>store.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Helper function to check if all necessary fields are filled
    const validateInputs = () => {
        const requiredFields = ['fullname', 'email', 'phoneNumber', 'password', 'role'];
        for (const field of requiredFields) {
            if (!input[field]) {
                toast.error(`Please fill out the ${field} field.`);
                return false;
            }
        }
        
        // Specific validation for 'student' role (must include a file)
        if (input.role === 'student' && !input.file) {
            toast.error("Student must upload a profile photo/resume file.");
            return false;
        }

        return true;
    }

    const changeEventHandler = (e) => {
        setInput({ ...input, [e.target.name]: e.target.value });
    }
    const changeFileHandler = (e) => {
        // Capture the file object itself
        setInput({ ...input, file: e.target.files?.[0] });
    }
    
    const submitHandler = async (e) => {
        e.preventDefault();
        
        // 1. Client-Side Validation Check
        if (!validateInputs()) {
            return;
        }

        const formData = new FormData();
        formData.append("fullname", input.fullname);
        formData.append("email", input.email);
        formData.append("phoneNumber", input.phoneNumber);
        formData.append("password", input.password);
        formData.append("role", input.role);
        
        // Only append the file if it exists (necessary for image/resume upload)
        if (input.file) {
            formData.append("file", input.file);
        }

        try {
            dispatch(setLoading(true));
            const res = await axios.post(`${USER_API_END_POINT}/register`, formData, {
                headers: { 'Content-Type': "multipart/form-data" },
                withCredentials: true,
            });
            if (res.data.success) {
                navigate("/login");
                toast.success(res.data.message);
            }
        } catch (error) {
            console.log(error);
            // Handle case where error.response might not exist
            const errorMessage = error.response?.data?.message || "An unknown error occurred during signup.";
            toast.error(errorMessage);
        } finally{
            dispatch(setLoading(false));
        }
    }

    useEffect(()=>{
        if(user){
            navigate("/");
        }
    },[user, navigate])
    
    return (
        <div>
            <Navbar />
            <div className='flex items-center justify-center max-w-7xl mx-auto'>
                <form onSubmit={submitHandler} className='w-full md:w-1/2 border border-gray-200 rounded-md p-6 my-10 shadow-lg'>
                    <h1 className='font-bold text-3xl mb-5 text-center'>Sign Up to <span className='text-purple-600'>AeroJobs</span></h1>
                    
                    {/* Input Fields */}
                    <div className='my-2'>
                        <Label>Full Name</Label>
                        <Input
                            type="text"
                            value={input.fullname}
                            name="fullname"
                            onChange={changeEventHandler}
                            placeholder="Enter your name"
                        />
                    </div>
                    <div className='my-2'>
                        <Label>Email</Label>
                        <Input
                            type="email"
                            value={input.email}
                            name="email"
                            onChange={changeEventHandler}
                            placeholder="Enter your mail"
                        />
                    </div>
                    <div className='my-2'>
                        <Label>Phone Number</Label>
                        <Input
                            type="text"
                            value={input.phoneNumber}
                            name="phoneNumber"
                            onChange={changeEventHandler}
                            placeholder="Enter your number"
                        />
                    </div>
                    <div className='my-2'>
                        <Label>Password</Label>
                        <Input
                            type="password"
                            value={input.password}
                            name="password"
                            onChange={changeEventHandler}
                            placeholder="Enter the passcode"
                        />
                    </div>
                    
                    {/* Role Selection & File Input */}
                    <div className='flex items-center justify-between mt-6'>
                        
                        <RadioGroup className="flex items-center gap-4">
                            <Label className='font-semibold'>Register As:</Label>
                            <div className="flex items-center space-x-2">
                                <Input
                                    type="radio"
                                    name="role"
                                    value="student"
                                    checked={input.role === 'student'}
                                    onChange={changeEventHandler}
                                    className="cursor-pointer h-4 w-4"
                                />
                                <Label htmlFor="r1">Student</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Input
                                    type="radio"
                                    name="role"
                                    value="recruiter"
                                    checked={input.role === 'recruiter'}
                                    onChange={changeEventHandler}
                                    className="cursor-pointer h-4 w-4"
                                />
                                <Label htmlFor="r2">Recruiter</Label>
                            </div>
                        </RadioGroup>
                    </div>

                    {/* Conditional File Upload for Students only */}
                    {input.role === 'student' && (
                        <div className='mt-4 flex items-center gap-4 border p-3 rounded-lg bg-gray-50'>
                            <Label className='whitespace-nowrap font-medium text-sm text-gray-700'>Profile Photo / Resume (PDF accepted)</Label>
                            <Input
                                accept="image/*, application/pdf" 
                                type="file"
                                onChange={changeFileHandler}
                                className="cursor-pointer bg-white"
                            />
                        </div>
                    )}
                    
                    {/* Submit Button */}
                    {
                        loading ? 
                        <Button className="w-full my-4" disabled> 
                            <Loader2 className='mr-2 h-4 w-4 animate-spin' /> Please wait 
                        </Button> 
                        : 
                        <Button type="submit" className="w-full my-4 bg-purple-600 hover:bg-purple-700">Signup</Button>
                    }
                    
                    <span className='text-sm text-center block mt-2'>Already have an account? <Link to="/login" className='text-blue-600 font-medium hover:underline'>Login</Link></span>
                </form>
            </div>
        </div>
    )
}

export default Signup;