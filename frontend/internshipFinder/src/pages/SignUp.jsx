import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";

const SignUp = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
    profilePic: null,
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "profilePic") {
      setFormData({ ...formData, profilePic: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleRoleSelect = (role) => {
    setFormData({ ...formData, role });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    (async () => {
      try {
        const payload = { ...formData };
        delete payload.profilePic; 
        const res = await api.post('/auth/register', payload);
        api.setAuth(res.token, res.user);
        navigate('/');
      } catch (err) {
        const msg = err && err.message ? err.message : JSON.stringify(err);
        alert('Registration failed: ' + msg);
      }
    })();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-2 text-center">Create Account</h2>
        <p className="text-center text-gray-500 mb-6">
          Join thousands of student finding their dream internships
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Enter your full name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Create a strong password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2 text-gray-400"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Profile Picture (Optional)
            </label>

            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 flex items-center justify-center bg-gray-100 rounded-full overflow-hidden">
                {formData.profilePic ? (
                  <img
                    src={URL.createObjectURL(formData.profilePic)}
                    alt="profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <svg
                    className="w-8 h-8 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                )}
              </div>

              <label className="flex-1">
                <div className="flex items-center justify-center w-full px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                  <span className="text-gray-600 text-sm font-medium">
                    Upload Photo
                  </span>
                </div>
                <input
                  type="file"
                  name="profilePic"
                  accept="image/png, image/jpeg"
                  onChange={handleChange}
                  className="hidden"
                />
              </label>
            </div>

            <p className="text-xs text-gray-500">JPG, PNG up to 5MB</p>
          </div>

          <div className="flex space-x-4 mt-2">
            <button
              type="button"
              onClick={() => handleRoleSelect("student")}
              className={`flex-1 py-2 rounded-lg border ${
                formData.role === "student"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300"
              }`}
            >
              Student
            </button>
            <button
              type="button"
              onClick={() => handleRoleSelect("employer")}
              className={`flex-1 py-2 rounded-lg border ${
                formData.role === "employer"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300"
              }`}
            >
              Employer
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition mt-4"
          >
            Sign Up
          </button>
        </form>

        <p className="mt-4 text-center text-gray-500">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
