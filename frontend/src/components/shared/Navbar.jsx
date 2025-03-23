


import React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { Avatar, AvatarImage } from "../ui/avatar";
import { LogOut, User2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { USER_API_END_POINT } from "@/utils/constant";
import { setUser } from "@/redux/authSlice";
import { toast } from "sonner";

function Navbar() {
  const { user } = useSelector((store) => store.auth);
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
  };

  return (
    <div className="bg-black text-white shadow-md">
      <div className="flex items-center justify-between mx-auto max-w-7xl h-16 px-6">
        {/* Logo */}
        <div>
          <h1 className="text-3xl font-extrabold">
            Aero<span className="text-purple-500">Jobs</span>
          </h1>
        </div>

        {/* Navigation Links */}
        <div className="flex items-center gap-10">
          <ul className="flex font-medium items-center gap-6 text-gray-300 hover:text-white transition-all">
            {user && user.role === "recruiter" ? (
              <>
                <li>
                  <Link to="/admin/companies" className="hover:text-purple-400">Companies</Link>
                </li>
                <li>
                  <Link to="/admin/jobs" className="hover:text-purple-400">Jobs</Link>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link to="/" className="hover:text-purple-400">Home</Link>
                </li>
                <li>
                  <Link to="/jobs" className="hover:text-purple-400">Jobs</Link>
                </li>
                <li>
                  <Link to="/browse" className="hover:text-purple-400">Browse</Link>
                </li>
              </>
            )}
          </ul>

          {/* Authentication */}
          {!user ? (
            <div className="flex items-center gap-3">
              <Button variant="outline" className="border border-purple-600 text-purple-500 hover:bg-purple-600 hover:text-white">
                <Link to="/login">Login</Link>
              </Button>
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Link to="/signup">Sign Up</Link>
              </Button>
            </div>
          ) : (
            <Popover>
              <PopoverTrigger asChild>
                <Avatar className="cursor-pointer border-2 border-purple-500">
                  <AvatarImage src={user?.profile?.profilePhoto} alt="Profile" className="w-12 h-12 rounded-full" />
                </Avatar>
              </PopoverTrigger>
              <PopoverContent className="w-72 bg-gray-900 text-white border border-gray-700 rounded-lg shadow-lg p-4">
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src={user?.profile?.profilePhoto} alt="Profile" className="w-12 h-12 rounded-full border border-purple-500" />
                  </Avatar>
                  <div>
                    <h4 className="font-bold">AeroJobs</h4>
                    <p className="text-sm text-gray-400">Aviation Jobs Hub</p>
                  </div>
                </div>
                <div className="flex flex-col mt-4 text-gray-300">
                  {user && user.role === "student" && (
                    <div className="flex items-center gap-2 cursor-pointer hover:text-purple-400 transition-all">
                      <User2 />
                      <Button variant="link">
                        <Link to="/profile"  className="text-white border-2 border-purple-500 px-2 py-1 rounded-md hover:bg-purple-500 transition-all">View Profile</Link>
                      </Button>
                    </div>
                  )}
                  <div className="flex items-center gap-2 cursor-pointer hover:text-red-500 transition-all">
                    <LogOut />
                    <Button onClick={logoutHandler} variant="link" className="text-white border-2 border-purple-500 px-2 py-1 rounded-md hover:bg-purple-500 transition-all">
                      Logout
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>
      </div>
    </div>
  );
}

export default Navbar;
