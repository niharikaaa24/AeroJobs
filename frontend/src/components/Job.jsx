// import React from 'react'
// import { Button } from './ui/button'
// import { Avatar ,AvatarImage} from '@radix-ui/react-avatar'
// import { Badge } from './ui/badge'
// import { Bookmark } from 'lucide-react'
// import { useNavigate } from 'react-router-dom'

// function Job({job}) {
// const navigate= useNavigate();
// // const jobId= "bfewg291";


// const daysAgoFunction = (mongodbTime) => {
//     const createdAt = new Date(mongodbTime);
//     const currentTime = new Date();
//     const timeDifference = currentTime - createdAt;
//     return Math.floor(timeDifference/(1000*24*60*60));
// }

//   return (
//     <div className='p-5 rounded-md shadow-xl bg-white border border-gray-100'>
//     <div className='flex items-center justify-between'>
//     <p className='text-sm text-gray-500'>{daysAgoFunction(job?.createdAt) === 0 ? "Today" : `${daysAgoFunction(job?.createdAt)} days ago`}</p>
//         <Button variant="outline" className="rounded-full" size="icon"><Bookmark /></Button>
//     </div>
//     <div className='flex items-center gap-2 my-2'>
//         <Button className="p-6" variant="outline" size="icon">
//         <Avatar>
//   <AvatarImage  style={{ width: '50px', height: '50px',objectFit: 'cover' }}
//     src={job?.company?.logo}
//   > </AvatarImage>
// </Avatar>
//         </Button>
//         </div>
//         <div>
//             <h1 className='font-medium text-lg'>{job?.company?.name}</h1>
//             <p className='text-sm text-gray-500'>India</p>
//         </div>
//     <div>
//         <h1 className='font-bold text-lg my-2'>{job?.title}</h1>
//         <p className='text-sm text-gray-600'>{job?.description} </p>
//     </div>
//     <div className='flex items-center gap-2 mt-4'>
//         <Badge className={'text-blue-700 font-bold'} variant="ghost">{job?.position} Positions</Badge>
//         <Badge className={'text-[#F83002] font-bold'} variant="ghost">{job?.jobType}Type</Badge>
//         <Badge className={'text-[#7209b7] font-bold'} variant="ghost">{job?.salary}LPA</Badge>
//     </div>
//     <div className='flex items-center gap-4 mt-4'>
//         <Button onClick={()=> navigate(`/description/${job?._id}`)} variant="outline">Details</Button>
//         <Button className="bg-[#7209b7]">Save For Later</Button>
//     </div>
// </div>
//   )
// }

// export default Job

import React from 'react'
import { Button } from './ui/button'
import { Avatar } from '@radix-ui/react-avatar'
import { Badge } from './ui/badge'
import { Bookmark } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

function Job({ job }) {
  const navigate = useNavigate();

  const daysAgoFunction = (mongodbTime) => {
    const createdAt = new Date(mongodbTime);
    const currentTime = new Date();
    const timeDifference = currentTime - createdAt;
    return Math.floor(timeDifference / (1000 * 60 * 60 * 24)); // Corrected time difference calculation
  };

  return (
    <div className="p-5 rounded-md shadow-xl bg-white border border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {daysAgoFunction(job?.createdAt) === 0 ? "Today" : `${daysAgoFunction(job?.createdAt)} days ago`}
        </p>
        <Button variant="outline" className="rounded-full" size="icon" onClick={() => console.log('Saved!')}>
          <Bookmark />
        </Button>
      </div>

      {/* Company Logo & Info */}
      <div className="flex items-center gap-2 my-2">
        <Avatar className="w-12 h-12 overflow-hidden rounded-full border">
          <img src={job?.company?.logo} alt="Company Logo" className="w-full h-full object-cover" />
        </Avatar>
        <div>
          <h1 className="font-medium text-lg">{job?.company?.name}</h1>
          <p className="text-sm text-gray-500">India</p>
        </div>
      </div>

      {/* Job Details */}
      <div>
        <h1 className="font-bold text-lg my-2">{job?.title}</h1>
        <p className="text-sm text-gray-600">{job?.description}</p>
      </div>

      {/* Job Badges */}
      <div className="flex items-center gap-2 mt-4">
        <Badge className="text-blue-700 font-bold" variant="ghost">{job?.position} Positions</Badge>
        <Badge className="text-[#F83002] font-bold" variant="ghost">{job?.jobType} Type</Badge>
        <Badge className="text-[#7209b7] font-bold" variant="ghost">{job?.salary} LPA</Badge>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-4 mt-4">
        <Button onClick={() => navigate(`/description/${job?._id}`)} variant="outline">Details</Button>
        <Button className="bg-[#7209b7]">Save For Later</Button>
      </div>
    </div>
  );
}

export default Job;
