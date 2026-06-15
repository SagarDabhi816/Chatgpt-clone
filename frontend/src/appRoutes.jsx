import { BrowserRouter , Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'


const AppRoutes = () => {
  return (
   <BrowserRouter>
        <Routes>
            <Route path='/' element={<div>Home</div>} />
            <Route path='/register' element={<Register />} />
            <Route path='/login' element={<Login />} />
        </Routes>
   </BrowserRouter>
  )
}

export default AppRoutes