import React from "react";
// Assuming these are standard relative paths within your project structure
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "./ui/carousel";
import { Button } from "./ui/button";
// These should resolve as external dependencies in the build environment
import { useDispatch } from "react-redux"; 
import { useNavigate } from "react-router-dom";
// Correcting alias/relative path if needed, assuming '@/' points to the src directory
import { setSearchedQuery } from "@/redux/jobSlice"; 

const categories = [
  "Pilot", "Cabin Crew", "Navigation Engineer", "Air Hostess",
  "Flight Instructor", "Air Traffic Controller", "Airport Manager",
  "Aircraft Maintenance Technician"
];

const CategoryCarousel = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const searchJobHandler = (query) => {
    dispatch(setSearchedQuery(query));
    navigate("/browse");
  };

  return (
 <div className="w-full max-w-2xl mx-auto my-20">
<h2 className="text-center text-3xl font-bold text-white mb-8">
  <span className=" text-purple-500">Job Categories</span>
</h2>
<Carousel className="bg-black border border-gray-700 rounded-xl p-6 shadow-lg">
    <CarouselContent>
{categories.map((cat, index) => (
<CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3 text-center">
<Button 
onClick={() => searchJobHandler(cat)} 
variant="default" // Using default variant
className="rounded-full bg-purple-600 text-white border-purple-600 transition-all px-6 py-2 shadow-md"
>
{cat}
 </Button>
</CarouselItem>
))}
 </CarouselContent>
 <CarouselPrevious className="text-purple-400 hover:text-purple-600" />
 <CarouselNext className="text-purple-400 hover:text-purple-600" />
 </Carousel>
</div>
 );
};

export default CategoryCarousel;