import { Route, BrowserRouter, Routes } from 'react-router-dom'
import LandingPage from './components/landingPage/LandingPage'
import Dashboard from './components/dashboard/Dashboard'
import './App.css'
import { useState } from 'react'

function App() {
  const [audioFile, setAudioFile] = useState<File | null>(null);

  return (
    <BrowserRouter>
      <div style={{ position: 'absolute', top: '2rem', right: '2rem' }}>
        <button className="btn btn-primary">
          <span className="text-lg">About Us</span>
          <i className='material-symbols-outlined'>help</i>
        </button>
      </div>

      <Routes>
        <Route path='/' element={<LandingPage onAudioFileUpload={setAudioFile} />}></Route>
        <Route path='/dashboard' element={<Dashboard file={audioFile} />}></Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
