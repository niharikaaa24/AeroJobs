import React, { useState } from 'react'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle , DialogDescription} from './ui/dialog'
import { Label } from './ui/label'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { Loader2 } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'
import { USER_API_END_POINT } from '@/utils/constant'
import { setUser } from '@/redux/authSlice'
import { toast } from 'sonner'
import store from '@/redux/store'


const UpdateProfileDialog= ({open, setOpen}) =>{

    const [loading, setLoading]= useState(false);
         const { user } = useSelector(store => store.auth);
        
         const [input, setInput] = useState({
        fullname: user?.fullname,
        email: user?.email,
        phoneNumber: user?.phoneNumber,
        bio: user?.profile?.bio,
        skills: user?.profile?.skills?.map(skill => skill),
        file: null,
        currentResume: user?.profile?.resume // Store the current resume URL
    });
    const dispatch = useDispatch();

    const changeEventHandler = (e) => {
        setInput({ ...input, [e.target.name]: e.target.value });
    }

    const fileChangeHandler = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            console.log('Selected file:', {
                name: file.name,
                type: file.type,
                size: file.size
            });
            
            // Validate file type
            if (!file.type.includes('pdf') && !file.name.toLowerCase().endsWith('.pdf')) {
                toast.error('Please select a PDF file');
                return;
            }
            
            // Validate file size (max 10MB)
            if (file.size > 10 * 1024 * 1024) {
                toast.error('File size should be less than 10MB');
                return;
            }
            
            setInput({ ...input, file });
            toast.success('File selected successfully');
        }
    }

    const submitHandler = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("fullname", input.fullname);
        formData.append("email", input.email);
        formData.append("phoneNumber", input.phoneNumber);
        formData.append("bio", input.bio);
        formData.append("skills", input.skills);
        if (input.file) {
            console.log("Uploading new resume file:", input.file.name);
            formData.append("file", input.file);
        } else {
            console.log("No new resume file to upload, keeping existing:", input.currentResume);
        }
        try {
            setLoading(true);
            console.log("🔄 Sending API Request...");
            // IMPORTANT: do NOT set the Content-Type header manually when sending FormData.
            // Let the browser set the correct multipart boundary. Setting it manually can
            // break the request and cause the server (multer) to fail parsing the file.
            const res = await axios.post(`${USER_API_END_POINT}/profile/update`, formData, {
                withCredentials: true
            });
            console.log("Response:", res.data);
            if (res.data.success) {
                console.log("Profile update response:", res.data);
                console.log("Updated user data:", res.data.user);
                console.log("Resume URL:", res.data.user?.profile?.resume);
                
                dispatch(setUser(res.data.user));
                toast.success(res.data.message);
                setOpen(false);
            }
        } catch (error) {
            console.error("Error:", error.response?.data || error);
            toast.error(error.response?.data?.message || "Something went wrong");
        } 
        finally{
            console.log("Setting loading to false and closing dialog");
            setLoading(false);
           
        }
        
        
    }
    return (
        <div>
            <Dialog open={open}>
                <DialogContent className="sm:max-w-[425px]" onInteractOutside={()=>setOpen(false)} >
                    <DialogHeader>
                        <DialogTitle>Update Profile</DialogTitle>
                        <DialogDescription className="sr-only">.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={submitHandler}>
                        <div className='grid gap-4 py-4'>
                            <div className='grid grid-cols-4 items-center gap-4'>
                                <Label htmlFor="name" className="text-right">Name</Label>
                                <Input
                                    id="fullname"
                                    name="fullname"
                                    type="text"
                                    value={input.fullname}
                                    onChange={changeEventHandler}
                                    className="col-span-3"
                                />
                            </div>
                            <div className='grid grid-cols-4 items-center gap-4'>
                                <Label htmlFor="email" className="text-right">Email</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={input.email}
                                    onChange={changeEventHandler}
                                    className="col-span-3"
                                />
                            </div>
                            <div className='grid grid-cols-4 items-center gap-4'>
                                <Label htmlFor="number" className="text-right">Number</Label>
                                <Input
                                    id="phoneNumber"
                                    name="phoneNumber"
                                    value={input.phoneNumber}
                                    onChange={changeEventHandler}
                                    className="col-span-3"
                                />
                            </div>
                            <div className='grid grid-cols-4 items-center gap-4'>
                                <Label htmlFor="bio" className="text-right">Bio</Label>
                                <Input
                                    id="bio"
                                    name="bio"
                                    value={input.bio}
                                    onChange={changeEventHandler}
                                    className="col-span-3"
                                />
                            </div>
                            <div className='grid grid-cols-4 items-center gap-4'>
                                <Label htmlFor="skills" className="text-right">Skills</Label>
                                <Input
                                    id="skills"
                                    name="skills"
                                    value={input.skills}
                                    onChange={changeEventHandler}
                                    className="col-span-3"
                                />
                            </div>
                            <div className='grid grid-cols-4 items-center gap-4'>
                                <Label htmlFor="file" className="text-right">Resume</Label>
                                <div className="col-span-3 space-y-2">
                                    <Input
                                        id="file"
                                        name="file"
                                        type="file"
                                        accept="application/pdf"
                                        onChange={fileChangeHandler}
                                    />
                                    {input.currentResume && (
                                        <div className="flex items-center gap-2">
                                            <a 
                                                href={input.currentResume}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm text-blue-600 hover:underline inline-flex items-center"
                                                onClick={async (e) => {
                                                    e.preventDefault();
                                                    console.log('Attempting to open resume URL:', input.currentResume);
                                                    
                                                    try {
                                                        // Test if the URL is accessible
                                                        const response = await fetch(input.currentResume);
                                                        if (!response.ok) {
                                                            throw new Error('Failed to load resume');
                                                        }
                                                        
                                                        // If successful, open in new window
                                                        window.open(input.currentResume, '_blank', 'noopener,noreferrer');
                                                    } catch (error) {
                                                        console.error('Error accessing resume:', error);
                                                        toast.error('Failed to load resume. Please try uploading again.');
                                                    }
                                                }}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                                </svg>
                                                View Current Resume
                                            </a>
                                            <span className="text-sm text-gray-500">
                                                (PDF will open in a new tab)
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            {
                                loading ? <Button className="w-full my-4"> <Loader2 className='mr-2 h-4 w-4 animate-spin' /> Please wait </Button> : <Button type="submit" className="w-full my-4">Update</Button>
                            }
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}


export default UpdateProfileDialog