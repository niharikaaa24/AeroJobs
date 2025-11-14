import React, { useState } from 'react'
import Navbar from './shared/Navbar'
import { Avatar, AvatarImage } from './ui/avatar'
import { Button } from './ui/button'
import { Contact, Mail, Pen } from 'lucide-react'
import { Badge } from './ui/badge'
import { Label } from './ui/label'
import AppliedJobTable from './AppliedJobTable'
import UpdateProfileDialog from './UpdateProfileDialog'
import { useSelector } from 'react-redux'
import axios from 'axios'
import { toast } from 'sonner'
import useGetAppliedJobs from '@/hooks/useGetAppliedJobs'

function Profile() {

        useGetAppliedJobs();
        const [open, setOpen]= useState(false);
        const [atsLoading, setAtsLoading] = useState(false);
        const {user} = useSelector(store => store.auth);

        const resumeUrl = user?.profile?.resume;
        const resumeDisplayName = user?.profile?.resumeOriginalName || "View Resume PDF";

    return (
        <div>
            <Navbar />
            <div className='max-w-4xl mx-auto bg-white border border-gray-200 rounded-2xl my-5 p-8'>
                <div className='flex justify-between'>
                    <div className='flex items-center gap-4'>
                        <Avatar className="h-24 w-24">
                            <AvatarImage src={user?.profile?.profilePhoto} alt="profile" />
                        </Avatar>
                        <div>
                            <h1 className='font-medium text-xl'> {user?.fullname} </h1>
                            <p>Hi, It is {user?.fullname} and aviation industry excites me.</p>
                        </div>
                    </div>
                    <Button onClick={()=>setOpen(true)} className="text-right" variant="outline"><Pen /></Button>
                </div>

                <div className='my-5'>
                    <div className='flex items-center gap-3 my-2'>
                        <Mail />
                        <span> {user?.email}</span>
                    </div>
                    <div className='flex items-center gap-3 my-2'>
                        <Contact />
                        <span> {user?.phoneNumber}</span>
                    </div>
                </div>

                <div className='my-5'>
                    <h1> Skills </h1>
                    <div className='flex items-center gap-1'>
                        {
                            user?.profile?.skills && user.profile.skills.length !== 0 ?
                                user.profile.skills.map((item, index) => <Badge key={index}>{item}</Badge>) :
                                <Badge variant="outline" className="text-gray-500">No Skills Listed</Badge>
                        }
                    </div>
                </div>

                <div className='grid w-full max-w-sm items-center gap-1.5'>
                    <Label className="text-md font-bold"> Resume </Label>
                    {
                        resumeUrl ? (
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-4">
                                    <a
                                        href={resumeUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                        </svg>
                                        {resumeDisplayName || 'View Resume'}
                                    </a>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            window.open(resumeUrl, '_blank');
                                        }}
                                    >
                                        Open in New Tab
                                    </Button>
                                </div>

                                <div className="flex items-center gap-2 mt-2">
                                    <span className="text-sm text-gray-500">Can't open the PDF? Try:</span>
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(resumeUrl);
                                            toast.success('Resume URL copied to clipboard');
                                        }}
                                        className="text-sm text-blue-500 hover:underline"
                                    >
                                        Copy Direct Link
                                    </button>
                                </div>

                                <div className="flex items-center gap-2 mt-2">
                                    <Button variant="ghost" size="sm" onClick={async ()=>{
                                            setAtsLoading(true);
                                            try{
                                                toast('Computing ATS score...')
                                                const res = await axios.get('/api/v1/user/ats-score-ai', { withCredentials: true })
                                                if(res?.data?.success){
                                                    const parsed = res.data.parsed;
                                                    if(parsed && parsed.score !== undefined){
                                                        toast.success(`ATS Score: ${parsed.score}`)
                                                    } else {
                                                        toast.success('ATS computed — check console for details')
                                                        console.log('ATS raw reply:', res.data.reply);
                                                    }
                                                } else {
                                                    const msg = res?.data?.message || 'Failed to compute ATS';
                                                    toast.error(msg)
                                                }
                                            }catch(err){
                                                console.error('ATS AI error', err);
                                                const msg = err?.response?.data?.message || err?.message || 'Network or server error while computing ATS';
                                                toast.error(msg)
                                            } finally{
                                                setAtsLoading(false);
                                            }
                                        }} disabled={atsLoading}>{atsLoading ? 'Computing...' : 'Get ATS (AI)'}</Button>
                                </div>
                            </div>
                        ) : (
                            <span className="text-gray-500">Resume not uploaded</span>
                        )
                    }
                </div>
            </div>

            <div>
                <div className='max-w-4xl mx-auto bg-white rounded-2xl'>
                    <h1 className='font-bold text-lg my-5'>Applied Jobs</h1>
                    <AppliedJobTable/>
                </div>
            </div>
            <UpdateProfileDialog open={open} setOpen={setOpen} />
        </div>
    )
}

export default Profile;