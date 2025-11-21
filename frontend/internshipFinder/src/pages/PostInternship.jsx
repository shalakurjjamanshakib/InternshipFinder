import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from "../api";

const PostInternship = () => {
    const getInitial = (name) => {
      if (!name) return '?';
      return name.trim()[0].toUpperCase();
    };
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    location: "",
    category: "",
    mode: "",
    duration: "",
    minSalary: "",
    maxSalary: "",
    description: "",
    requirements: "",
    applyBy: "",
  });
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const editId = params.get('id');
  const isEdit = Boolean(editId);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    (async () => {
      try {
        setSubmitting(true);
        const token = api.getToken();
        if (!token) throw new Error('You must be logged in as an employer to post');
        const toSend = { ...formData };
        toSend.requirements = (toSend.requirements || '').split(/[,\n]+/).map(s => s.trim()).filter(Boolean);
        if (isEdit) {
          await api.put(`/internships/${editId}`, toSend, token);
        } else {
          await api.post('/internships', toSend, token);
        }
        setSubmitting(false);
        navigate('/employer-dashboard');
      } catch (err) {
        setSubmitting(false);
        const msg = err && err.message ? err.message : JSON.stringify(err);
        alert('Failed to post internship: ' + msg);
      }
    })();
  };

  useEffect(() => {
    (async () => {
      try {
        const token = api.getToken();
        if (!token) {
          setLoading(false);
          return;
        }
        const u = await api.get('/users/me', token);
        setUser(u);
        if (u.company) setFormData(fd => ({ ...fd, company: u.company }));
        if (isEdit) {
          try {
            const internship = await api.get(`/internships/${editId}`);
            if (internship) {
              setFormData({
                title: internship.title || '',
                company: internship.company || '',
                location: internship.location || '',
                category: internship.category || '',
                mode: internship.mode || '',
                duration: internship.duration || '',
                minSalary: internship.minSalary || '',
                maxSalary: internship.maxSalary || '',
                description: internship.description || '',
                    requirements: (internship.requirements || []).join(', '),
                    applyBy: internship.applyBy ? new Date(internship.applyBy).toISOString().slice(0,10) : '',
              });
            }
          } catch (e) {
            console.warn('Failed to load internship for editing', e);
          }
        }
      } catch (err) {
        console.error('Failed to load user', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-64 bg-white shadow-sm p-6">
        <h2 className="text-xl font-bold text-blue-600 mb-8">FindInternship</h2>
        <nav className="space-y-3 text-gray-700">
          <Link to="/employer-dashboard" className="block hover:text-blue-600">Dashboard</Link>
          <Link to="/post-internship" className="block text-blue-600 font-semibold">Post Internship</Link>
          <Link to="/manage-internships" className="block hover:text-blue-600">Manage Internships</Link>
          <Link to="/employer-profile" className="block hover:text-blue-600">Company Profile</Link>
        </nav>
      </aside>


      <main className="flex-1 p-10">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-2xl font-bold">Welcome back!</h1>
          
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="font-semibold">{user ? user.name : 'Guest'}</p>
              <p className="text-sm text-gray-500">{user ? user.role : 'Employer'}</p>
            </div>
            {/* Profile picture (logo or initial) */}
            {user && user.avatar ? (
              <img
                src={user.avatar}
                alt="profile"
                className="w-10 h-10 rounded-full object-cover border-2 border-blue-500"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg border-2 border-blue-500">
                {getInitial(user && user.company ? user.company : user && user.name ? user.name : 'E')}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow p-8 max-w-3xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">{isEdit ? 'Edit Internship' : 'Post a New Internship'}</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
   
            <div>
              <label className="block font-medium mb-1">Internship Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Frontend Developer Intern"
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="block font-medium mb-1">Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Dhaka"
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block font-medium mb-1">Company *</label>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                placeholder="Company name"
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block font-medium mb-1">Category *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">Select category</option>
                  <option>Software</option>
                  <option>Design</option>
                  <option>Backend Development</option>
                  <option>Frontend Development</option>
                  <option>Full Stack Development</option>
                  <option>Data Science</option>
                  <option>Mobile Development</option>
                  <option>DevOps</option> 
                  <option>Machine Learning</option>
                  <option>Artificial Intelligence</option>
                  <option>Cybersecurity</option>
                  <option>Cloud Computing</option>

                </select>
              </div>

              <div>
                <label className="block font-medium mb-1">Mode *</label>
                <select
                  name="mode"
                  value={formData.mode}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">Select mode</option>
                  <option>Remote</option>
                  <option>On-site</option>
                  <option>Hybrid</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label className="block font-medium mb-1">Duration</label>
                <input
                  type="text"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  placeholder="3 Months"
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-medium mb-1">Min Salary</label>
                <input
                  type="number"
                  name="minSalary"
                  value={formData.minSalary}
                  onChange={handleChange}
                  placeholder="10000 TK"
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-medium mb-1">Max Salary</label>
                <input
                  type="number"
                  name="maxSalary"
                  value={formData.maxSalary}
                  onChange={handleChange}
                  placeholder="20000 TK"
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block font-medium mb-1">Internship Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Write internship responsibilities, daily tasks, etc."
                rows={5}
                required
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              ></textarea>
            </div>

            <div>
              <label className="block font-medium mb-1">Requirements *</label>
              <textarea
                name="requirements"
                value={formData.requirements}
                onChange={handleChange}
                placeholder="List skills, education, and qualifications required."
                rows={4}
                required
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              ></textarea>
            </div>

            <div>
              <label className="block font-medium mb-1">Application Deadline</label>
              <input
                type="date"
                name="applyBy"
                value={formData.applyBy}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>


            <div className="text-right">
              <button
                type="submit"
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition"
              >
                {isEdit ? 'Update Internship' : 'Post Internship'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default PostInternship;
