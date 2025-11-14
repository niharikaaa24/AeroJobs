
import React, { useState } from "react";
import { Button } from "./ui/button";
import { Search } from "lucide-react";
import { useDispatch } from "react-redux";
import { setSearchedQuery } from "@/redux/jobSlice";
import { useNavigate } from "react-router-dom";

function HeroSection() {
  const [query, setQuery] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const searchJobHandler = () => {
    dispatch(setSearchedQuery(query));
    navigate("/browse");
  };

  return (
    <div className="relative bg-black text-white py-16 px-5">
      <div className="text-center max-w-3xl mx-auto">
        {/* Badge */}
        <span className="inline-block px-5 py-2 rounded-full bg-purple-700 text-white font-semibold shadow-md">
          ✈️ No. 1 Aero Jobs Website
        </span>

        {/* Title */}
        <h1 className="text-6xl font-extrabold mt-6 leading-tight">
          Find your <span className="text-purple-500 drop-shadow-lg">Wings</span> <br /> 
          in the <span className="text-[#8A2BE2]">Airline</span> Industry
        </h1>

        {/* Subtitle */}
        <p className="mt-4 text-lg text-gray-400">
          Take Your Career to New Heights – Explore Exclusive Airline & Aviation Jobs Today!
        </p>

        {/* Search Box */}
        {/* <div className="flex w-full max-w-lg bg-[#181818] shadow-xl border border-gray-700 rounded-full mt-8 mx-auto overflow-hidden">
          <input
            type="text"
            placeholder="Find your dream job..."
            onChange={(e) => setQuery(e.target.value)}
            className="w-full px-5 py-3 text-white bg-transparent outline-none focus:ring-2 focus:ring-purple-500"
          />
          <Button
            onClick={searchJobHandler}
            className="bg-purple-600 hover:bg-purple-700 transition-all rounded-r-full px-6"
          >
            <Search className="h-6 w-6 text-white" />
          </Button>
        </div> */}

        {/* Glowing Effect */}
        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-purple-900 via-black to-purple-900 opacity-20 blur-3xl"></div>
      </div>
    </div>
  );
}

export default HeroSection

