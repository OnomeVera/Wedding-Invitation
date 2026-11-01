import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { HomePage } from './pages/HomePage'
import { AdminPage } from './pages/AdminPage'
import { PersonalInvitation } from './components/invite/PersonalInvitation'
import './index.css'

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '0.85rem',
            border: '1px solid rgba(198,164,106,0.3)',
            background: '#fff',
            color: '#292820',
          },
        }}
      />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/invite/:token" element={<PersonalInvitation />} />
        <Route path="/admin/*" element={<AdminPage />} />
      </Routes>
    </BrowserRouter>
  )
}
