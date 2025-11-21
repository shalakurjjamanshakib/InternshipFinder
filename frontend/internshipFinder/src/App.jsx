import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";

import EmployerDashboard from "./pages/EmployerDashboard";
import ManageInternships from "./pages/ManageInternships";
import ManageInternshipApplications from "./pages/ManageInternshipApplications";
import InternshipDetails from "./pages/InternshipDetails";
import FindInternship from "./pages/FindInternship";
import PostInternship from "./pages/PostInternship";
import StudentProfile from "./pages/StudentProfile";
import EmployerProfile from "./pages/EmployerProfile";
import ProtectedRoute from "./components/ProtectedRoute";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
  <Route path="/employer-dashboard" element={<ProtectedRoute allowedRoles={["employer"]}><EmployerDashboard/></ProtectedRoute>} />
  <Route path="/manage-internships" element={<ProtectedRoute allowedRoles={["employer"]}><ManageInternships/></ProtectedRoute>} />
  <Route path="/manage-internships/:id/applications" element={<ProtectedRoute allowedRoles={["employer"]}><ManageInternshipApplications/></ProtectedRoute>} />
         <Route path="/find-internship" element={<FindInternship />} />
         <Route path="/post-internship" element={<ProtectedRoute allowedRoles={["employer"]}><PostInternship/></ProtectedRoute>} />
          <Route path="/student-profile" element={<ProtectedRoute allowedRoles={["student"]}><StudentProfile/></ProtectedRoute>} />
          <Route path="/employer-profile" element={<ProtectedRoute allowedRoles={["employer"]}><EmployerProfile/></ProtectedRoute>} />
        {/* <Route path="/internships" element={<BrowseInternships />} /> */}
  <Route path="/internships/:id" element={<InternshipDetails />} />

        
        {/* <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={["student", "employer", "admin"]}>
              <ProfilePage />
            </ProtectedRoute>
          }
        />


        <Route
          path="/employer/dashboard"
          element={
            <ProtectedRoute allowedRoles={["employer"]}>
              <EmployerDashboard />
            </ProtectedRoute>
          }
        />


        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          } */}
        
      </Routes>
    </Router>
  );
};

export default App;
