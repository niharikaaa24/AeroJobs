

import React from 'react'
import "./App.css"
import Navbar from './components/shared/Navbar'
import Login from './components/auth/Login'
import Signup from './components/auth/Signup'
import Home from './components/Home'
import Browse from './components/Browse'
import Jobs from './components/Jobs'

import { Route, Routes } from 'react-router-dom'
import Profile from './components/Profile'
import JobDescription from './components/JobDescription'
import Companies from './components/admin/Companies'
import CompaniesCreate from './components/admin/CompaniesCreate'
import CompaniesSetup from './components/admin/CompaniesSetup'
import AdminJobs from './components/admin/AdminJobs'
import PostJob from './components/admin/PostJob'
import Applicants from './components/admin/Applicants'
import Chatbot from './components/shared/Chatbot'

function App() {
  return (
    <>
      <Routes>
      <Route path="/" element={<Home/>}/>
      <Route path="/jobs" element={<Jobs/>}/>
      <Route path="/browse" element={<Browse/>}/>
            <Route path="/login" element={<Login/>}/>
            <Route path="/signup" element={<Signup/>}/>
            <Route path="/profile" element={<Profile/>}/>
            <Route path="/description/:id" element={<JobDescription/>}/>
            <Route path="/admin/companies" element={<Companies/>} ></Route>
            <Route path="/admin/companies/create" element={<CompaniesCreate/>} ></Route>
            <Route path="/admin/companies/:id" element={<CompaniesSetup/>} ></Route>
            <Route path="/admin/jobs" element={<AdminJobs/>} ></Route>
            <Route path="/admin/jobs/create" element={<PostJob/>}></Route>
            <Route path="/admin/jobs/:id/applicants" element={<Applicants/>}></Route>
        </Routes>
      <Chatbot />
    </>
  )
}

export default App





 