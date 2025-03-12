import React from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Button } from '../ui/button'
import { Avatar, AvatarImage } from '../ui/avatar'
import { LogOut, User2 } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'
import { USER_API_END_POINT } from '@/utils/constant'
import { setUser } from '@/redux/authSlice'
import { toast } from 'sonner'


function Navbar() {

    // const user= true;
    const {user}= useSelector(store=>store.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const logoutHandler = async () => {
        try {
            const res = await axios.get(`${USER_API_END_POINT}/logout`, { withCredentials: true });
            if (res.data.success) {
                dispatch(setUser(null));
                navigate("/");
                toast.success(res.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response.data.message);
        }
    }

  return (

    <div className='bg-white'>
        <div className='flex items-center justify-between mx-auto max-w-7xl h-16'>
        <div>
        <h1 className='text-2xl font-bold'> Aero<span className='text-[#F83002]'>Jobs</span> </h1> 
        </div>
        <div className='flex items-center gap-12'>
            <ul className='flex font-medium item-center gap-5'>
                {
                    user && user.role === "recruiter"? (
                        <>
                                        <li> <Link to="/admin/companies" >Companies</Link></li>
                                        <li> <Link to="/admin/jobs">Jobs</Link></li>
                        </>
                    ):(
                        <>
                        <li> <Link to="/">Home</Link></li>
                        <li> <Link to="/jobs" >Jobs</Link></li>
                        <li> <Link to="/browse">Browse</Link></li>
                        </>
                    )
                }

            </ul>
           {

            !user ? (
                <div className='flex item-center gap-2'>
                    <Button variant="outline"> <Link to="/login"> Login</Link> </Button>
                    <Button className=" bg-[#6A38C2] hover:bg-[#5b30a6]" ><Link to="/signup" >SignUp</Link> </Button>
                </div>
            ):    <Popover>
            <PopoverTrigger asChild>
           <Avatar className='cursor-pointer'>
  <AvatarImage src="https://github.com/shadcn.png" alt='@shadcn' className="w-16 h-16 rounded-full"/>
</Avatar>
            </PopoverTrigger>
                <PopoverContent className='w-80'>
                    <div className='flex gap-4 space-y-2'>
                <Avatar className='cursor-pointer'>
  <AvatarImage src="https://github.com/shadcn.png" alt='@shadcn' className="w-16 h-16 rounded-full"/>
</Avatar>
<div>
    <h4 className='font-medium'> AeroJobs </h4>
    <p className='text-sm textmuted-foreground'> Lorem ipsum dolor sit amet consectetur adipisicing elit.  </p>
</div>
</div>
<div className='flex flex-col my-2 text-gray-600'>
    {
        user && user.role ==="student" &&
         (
            <div className='flex w-fit items-cemter gap-2 cursor-pointer'>
            <User2/>
        <Button variant="link"> <Link to="/profile"> View Profile </Link> </Button>
        </div>
        )
    }
   
    <div className="flex w-fit items-cemter gap-2 cursor-pointer">
        <LogOut/>
    <Button onClick={logoutHandler} variant="link"> Logout </Button>
    </div>
    </div>
                </PopoverContent>
            </Popover>
           }
        </div>
        </div>
    </div>
  )
}
export default Navbar