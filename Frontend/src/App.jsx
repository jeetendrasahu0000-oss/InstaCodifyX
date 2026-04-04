import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./Context/AuthContext";
import "./App.css";

import Login from "./Pages/Auth/Signin";
import Signup from "./Pages/Auth/Signup";
import Forgot from "./Pages/Auth/Forgot";
import Reset from "./Pages/Auth/Reset";

import ProtectedRoute from "./Context/ProtectedRoute";
import Explore from "./Pages/Explore/Explore";
import Contests from "./Pages/Contests/Contests";
import Discuss from "./Pages/Discuss/Discuss";
import Interview from "./Pages/Interview/Interview";
import Store from "./Pages/Store/Store";
import Home from "./Pages/Home/Home";
import MachineTest from "./Pages/Interview/MachineTest/MachineTest";
import Profile from "./Pages/Profile/Profile";

// ── Admin imports — all from Components/Admin/ (existing folder) ──────────────
import AdminLogin from "./Components/Admin/AdminLogin";
import AdminDashboard from "./Components/Admin/AdminDashboard";
import ProblemList from "./Components/Admin/ProblemList";
import ProblemForm from "./Components/Admin/ProblemForm";
import RegisterAdmin from "./Components/Admin/RegisterAdmin";
import SetterRequests from "./Components/Admin/SetterRequests";
import SetterRegister from "./Components/Admin/Setterregister";
import { AdminProvider, useAdmin } from "./Components/Admin/AdminContext";

import ProblemsSolve from "./Pages/Problems/ProblemsSolve";
import ProblemDetail from "./Pages/Problems/Problemdetail";
import HrPreparation from "./Pages/Interview/HRinterview/HrPreparation";
import StartInterview from "./Pages/Interview/HRinterview/StartInterview";
import ScheduleInterview from "./Pages/Interview/HRinterview/ScheduleInterview";
import HrAdmin from "./Components/HrAdmin/HrAdmin";
import Upgrade from "./Pages/Profile/Upgrade";
import CreatePlan from "./Components/Admin/CreatePlan";
import PaymentHistory from "./Components/Admin/PaymentHistory";
import ManageSetter from "./Components/Admin/ManageSetter";
import CreateMachineTest from "./Components/Admin/Createmachinetest";


// ── Guards ────────────────────────────────────────────────────────────────────

// Any logged-in admin or setter
const AdminProtectedRoute = ({ children }) => {
  const { admin } = useAdmin();
  if (!admin) return <Navigate to="/admin/login" replace />;
  return children;
};

// Only full admins (not setters)
const AdminOnlyRoute = ({ children }) => {
  const { admin } = useAdmin();
  if (!admin) return <Navigate to="/admin/login" replace />;
  if (admin.role !== "admin") return <Navigate to="/admin" replace />;
  return children;
};

// ── App ───────────────────────────────────────────────────────────────────────
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
              <Route path="/upgrade" element={<Upgrade />} />
            </Route>

            {/* ── Public Routes ── */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot" element={<Forgot />} />
            <Route path="/reset/:token" element={<Reset />} />
            <Route path="/profile/:username" element={<Profile />} />
            <Route path="/problems/:slug" element={<ProblemDetail />} />


            {/* Interview sub-routes */}
            <Route
              path="/interview-preparation/live-sessions"
              element={<div>Live Sessions</div>}
            />
            <Route
              path="/interview-preparation/hr-prep"
              element={<HrPreparation />}
            />
            <Route
              path="/interview-preparation/technical"
              element={<div>Technical Interview</div>}
            />
            <Route
              path="/interview-preparation/machine-test"
              element={<MachineTest />}
            />
            <Route
              path="/interview-preparation/hr-prep"
              element={<div>Schedule Mock</div>}
            />
            <Route
              path="/interview-preparation/schedule-live"
              element={<div>Schedule Live</div>}
            />

            {/* ── Admin Public ── */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/setter/register" element={<SetterRegister />} />

            <Route
              path="/admin"
              element={
                <AdminProtectedRoute>
                  <AdminDashboard />
                </AdminProtectedRoute>
              }
            >
              {/* /admin → DashboardHome (AdminDashboard handles isHome check internally) */}
              <Route index element={null} />

              {/* Problems — setter + admin both */}
              <Route path="problems" element={<ProblemList />} />
              <Route path="problems/new" element={<ProblemForm />} />
              <Route path="problems/edit/:id" element={<ProblemForm />} />

              {/* Admin-only */}
              <Route
                path="users"
                element={
                  <AdminOnlyRoute>
                   <ManageSetter/>
                  </AdminOnlyRoute>
                }
              />
              <Route
                path="setter-requests"
                element={
                  <AdminOnlyRoute>
                    <SetterRequests />
                  </AdminOnlyRoute>
                }
              />
              <Route
                path="register"
                element={
                  <AdminOnlyRoute>
                    <RegisterAdmin />
                  </AdminOnlyRoute>
                }
              />

              <Route
                path="machine"
                element={<CreateMachineTest/>}
              />
              <Route
                path="hr-interview"
                element={
                  <div
                    style={{
                      padding: "2rem",
                      color: "#64748b",
                      fontFamily: "Inter,sans-serif",
                    }}
                  >
                    <HrAdmin />
                  </div>
                }
              />

              <Route path="create-plane" element={<CreatePlan />} />
              <Route path="payment-history" element={<PaymentHistory />} />
            </Route>


            {/* Old URL redirect → new */}
            <Route path="/admin/dashboard" element={<Navigate to="/admin" replace />} />

            <Route path="/interview/start" element={<StartInterview />} />
            <Route path="/interview/schedule" element={<ScheduleInterview />} />


          </Routes>
        </BrowserRouter>
      </AdminProvider>
    </AuthProvider>
  );
};

export default App;
