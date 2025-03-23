import { RadioGroupItem } from './ui/radio-group'
import { RadioGroup } from './ui/radio-group'
import { Label } from './ui/label'
import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { setSearchedQuery } from '@/redux/jobSlice'

const filterdata=[
    {
        filterType: "Location",
        array: ["Delhi", "Banglore", "Pune", "Hyderabad"]
    },
    {
        filterType: "Industry",
        array: ["Pilot", "Cabin-Crew", "Navigation Engineer", "Air-Hostess"]
    }
]
function FilterCard() {

    const [selectedValue, setSelectedValue]= useState("");
const changeHandler= (value)=>{
setSelectedValue(value);
}
const dispatch= useDispatch();

useEffect(()=>{
   dispatch(setSearchedQuery(selectedValue))
},[selectedValue]);

  return (
    <div className='w-full p-3 rounded-md bg-white'>
        <h1 className='text-lg font-bold'>Filter Jobs</h1>
        <hr className='mt-3' />
        <RadioGroup value={selectedValue} onValueChange={changeHandler}>
            {
                filterdata.map((data,index)=>(
                    <div>
                        <h1 className='font-bold text-lg'>{data.filterType}</h1>
                        {
                            data.array.map((item,idx)=>{
                                const itemId= `r${index}-${idx}`
                                return (
                                    <div className='flex item-cemter space-x-3 my-2'>
                                        <RadioGroupItem value={item} id={itemId} />
                                        <Label htmlFor={itemId}> {item} </Label>
                                    </div>
                                )
                            })
                        }
                    </div>
                ))
            }
        </RadioGroup>
    </div>
  )
}

export default FilterCard