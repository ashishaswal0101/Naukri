import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from '../pages/auth/Login'
import Signup from '../pages/auth/Singup'
import Layout from '../Layout/Layout'
import Home from '../pages/Home'
import LeadDirectory from '../pages/LeadDirectory'
import ActivityLog from '../pages/ActivityLog'

const AppRoutes = () => {
  return (
   
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
{}
        <Route path="/dashboard" element={<Layout/>} >
          {/* Nested routes for authenticated users can be added here */}
          <Route index element={<Home />} /> {/* Default dashboard home */}

          <Route path="leads" element={ <LeadDirectory /> || <div className="p-8 text-[#14325a] font-bold text-xl">Lead Directory Loading...</div>} />
          <Route path="activity" element={ <ActivityLog /> || <div className="p-8 text-[#14325a] font-bold text-xl">Activity Log Loading...</div>} />
          <Route path="profile" element={<div className="p-8 text-[#14325a] font-bold text-xl">User Profile Loading...</div>} />
        </Route>

        {/* Catch-all: Redirect any unknown URL to login */}
      </Routes>
   
  )
}

export default AppRoutes
