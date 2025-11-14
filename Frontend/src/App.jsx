import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Footer from "./Components/Footer"
import Navbar from "./Components/Navbar"
import Home from "./Pages/Home"
import Login from "./Pages/Login"
import Register from "./Pages/Register"
import Profile from "./Pages/Profile"
import Turnos from "./Pages/Turnos"
import ResetPassword from "./Pages/ResetPassword"
import VerifyAccount from "./Pages/VerifyAccount"
import GoogleAuthSuccess from "./Pages/GoogleAuthSuccess"
import CompleteProfile from "./Pages/CompleteProfile"
import TermsAndConditions from "./Pages/TermsAndConditions"
import Admin from "./Pages/Admin"
import "./App.css"
import ConfirmProvider from "./Context/ConfirmContext"
import AuthProvider from "./Context/AuthProvider"
import TurnosProvider from "./Context/TurnosProvider"

function App() {
  return (
    <ConfirmProvider>
      <AuthProvider>
        <TurnosProvider>
          <Router>
            <div className="app-container">
              <Navbar />
              <main className="main-content">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/verify-account" element={<VerifyAccount />} />
                  <Route path="/auth/google/success" element={<GoogleAuthSuccess />} />
                  <Route path="/complete-profile" element={<CompleteProfile />} />
                  <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/turnos" element={<Turnos />} />
                  <Route path="/admin" element={<Admin />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </Router>
        </TurnosProvider>
      </AuthProvider>
    </ConfirmProvider>
  )
}

export default App
