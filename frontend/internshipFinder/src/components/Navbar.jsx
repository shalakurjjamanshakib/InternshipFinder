import React from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";

const Navbar = () => {
  const navigate = useNavigate();
  const user = api.getUser();

  const handleLogout = () => {
    api.clearAuth();
    navigate('/');
  };

  return (
    <nav className="flex justify-between items-center py-4 px-8 bg-white shadow-sm">
      <Link to="/" className="text-2xl font-bold text-gray-800">
        Internship<span className="text-blue-600">Finder</span>
      </Link>
      <div className="flex items-center space-x-6">
        {/* when not logged in show both entry links, otherwise show role-appropriate profile/navigation */}
        {!user && (
          <>
            <Link to="/find-internship" className="text-gray-700 hover:text-blue-600">
              For Student
            </Link>
            <Link to="/employer-dashboard" className="text-gray-700 hover:text-blue-600">
              For Employers
            </Link>
          </>
        )}
        {user && user.role === 'student' && (
          <>
            <Link to="/find-internship" className="text-gray-700 hover:text-blue-600">Find Internships</Link>
            <Link to="/student-profile" className="text-gray-700 hover:text-blue-600">Profile</Link>
          </>
        )}
        {user && user.role === 'employer' && (
          <>
            <Link to="/employer-dashboard" className="text-gray-700 hover:text-blue-600">Dashboard</Link>
            <Link to="/post-internship" className="text-gray-700 hover:text-blue-600">Post Internship</Link>
          </>
        )}
        {user ? (
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="font-semibold">{user.name}</div>
              <div className="text-sm text-gray-500">{user.role}</div>
            </div>
            <button onClick={handleLogout} className="text-sm text-gray-700 hover:text-blue-600">Logout</button>
          </div>
        ) : (
          <>
            <Link
              to="/login"
              className="text-gray-700 hover:text-blue-600 transition"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
