import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './Context/AuthContext'
import './App.css'




import Login from './Pages/Auth/Signin'
import Signup from './Pages/Auth/Signup'
import Forgot from './Pages/Auth/Forgot'
import Reset from './Pages/Auth/Reset'

import ProtectedRoute from './Context/ProtectedRoute'
import Explore from './Pages/Explore/Explore'
import Contests from './Pages/Contests/Contests'
import Discuss from './Pages/Discuss/Discuss'
import Interview from './Pages/Interview/Interview'
import Store from './Pages/Store/Store'
import Home from './Pages/Home/Home'
import MachineTest from './Pages/Interview/MachineTest/MachineTest'
import Profile from './Pages/Profile/Profile'

import AdminLogin from './Components/Admin/AdminLogin'
import AdminDashboard from './Components/Admin/AdminDashboard'
import ProblemList from './Components/Admin/ProblemList'
import ProblemForm from './Components/Admin/ProblemForm'
import RegisterAdmin from './Components/Admin/RegisterAdmin'
import { AdminProvider } from './Components/Admin/AdminContext'
import { useAdmin } from './Components/Admin/AdminContext'

import ProblemsSolve from './Pages/Problems/ProblemsSolve'
import SetterRegister from './Components/Admin/Setterregister'
import SetterRequests from './Components/Admin/Setterrequests'
import ProblemDetail from './Pages/Problems/Problemdetail'

// ── Guard: sirf logged-in admin access kar sake ──────────────────────────────
const AdminOnlyRoute = ({ children }) => {
  const { admin } = useAdmin();
  if (!admin) return <Navigate to="/admin/login" replace />;
  if (admin.role !== 'admin') return <Navigate to="/admin/dashboard" replace />;
  return children;
};

// ── Guard: koi bhi logged-in admin ya setter access kar sake ─────────────────
const AdminProtectedRoute = ({ children }) => {
  const { admin } = useAdmin();
  if (!admin) return <Navigate to="/admin/login" replace />;
  return children;
};

const App = () => {
  return (
    <AuthProvider>
      <AdminProvider>
        <BrowserRouter>
          <Routes>

            {/* ── User Protected Routes ── */}
            <Route element={<ProtectedRoute />}>
              <Route path="/explore" element={<Explore />} />
              <Route path="/problems" element={<ProblemsSolve />} />
              <Route path="/contests" element={<Contests />} />
              <Route path="/discuss" element={<Discuss />} />
              <Route path="/interview-preparation" element={<Interview />} />
              <Route path="/store" element={<Store />} />
            </Route>

            {/* ── Public Routes ── */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot" element={<Forgot />} />
            <Route path="/reset/:token" element={<Reset />} />
            <Route path="/profile/:username" element={<Profile />} />

            {/* Interview sub-routes */}
            <Route path="/interview-preparation/live-sessions" element={<div>Live Sessions Page</div>} />
            <Route path="/interview-preparation/hr-prep" element={<div>HR Prep Page</div>} />
            <Route path="/interview-preparation/technical" element={<div>Technical Interview Page</div>} />
            <Route path="/interview-preparation/machine-test" element={<MachineTest />} />
            <Route path="/interview-preparation/schedule-mock" element={<div>Schedule Mock Interview Page</div>} />
            <Route path="/interview-preparation/schedule-live" element={<div>Schedule Live Session Page</div>} />

            {/* ── Admin Public Routes ── */}
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* Problem setter registration — public form */}
            <Route path="/setter/register" element={<SetterRegister/>} />

            {/* ── Admin + Setter Protected Routes ── */}
            <Route path="/admin/dashboard" element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />
            <Route path="/admin/problems" element={<AdminProtectedRoute><ProblemList /></AdminProtectedRoute>} />
            <Route path="/admin/problems/new" element={<AdminProtectedRoute><ProblemForm /></AdminProtectedRoute>} />
            <Route path="/admin/problems/edit/:id" element={<AdminProtectedRoute><ProblemForm /></AdminProtectedRoute>} />

            {/* ── Admin Only Routes ── */}
            <Route path="/admin/register" element={<AdminOnlyRoute><RegisterAdmin/></AdminOnlyRoute>} />
            <Route path="/admin/setter-requests" element={<AdminOnlyRoute><SetterRequests/></AdminOnlyRoute>} />

            <Route path="/problems/:slug" element={<ProblemDetail/>} />

          </Routes>
        </BrowserRouter>
      </AdminProvider>
    </AuthProvider>
  );
};

export default App;