import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import api from "../api";

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';
const UPLOADS_BASE = API_BASE.replace(/\/api$/, '');

const StudentProfile = () => {
    const getInitial = (name) => {
      if (!name) return '?';
      return name.trim()[0].toUpperCase();
    };
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);
  const [resume, setResume] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (showUserMenu && userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showUserMenu]);

  useEffect(() => {
    (async () => {
      try {
        const token = api.getToken();
        if (!token) {
          setLoading(false);
          return;
        }
        const u = await api.get('/users/me', token);
        setProfile(u || {});
        const apps = await api.get('/applications/my', token);
        setApplications(apps || []);
      } catch (err) {
        console.error('Failed to load profile or applications', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const save = async () => {
    try {
      const token = api.getToken();
      if (!token) throw new Error('Not authenticated');
      const toSend = { ...profile };
      if (typeof toSend.skills === 'string') {
        toSend.skills = toSend.skills.split(/[\n,]+/).map(s => s.trim()).filter(Boolean);
      }
      const updated = await api.put('/users/me', toSend, token);
      setProfile(updated);
      api.setAuth(token, { id: updated._id || updated.id, name: updated.name, email: updated.email, role: updated.role, avatar: updated.avatar });
      setEditing(false);
      alert('Profile updated');
    } catch (err) {
      console.error(err);
      alert('Failed to update profile');
    }
  };

  const handleResumeUpload = (e) => {
    (async () => {
      const file = e.target.files[0];
      if (!file || file.type !== 'application/pdf') {
        alert('Please upload a PDF file only.');
        return;
      }
      const token = api.getToken();
      if (!token) { alert('Not authenticated'); return; }
      try {
        const fd = new FormData();
        fd.append('resume', file);
        const res = await fetch(`${API_BASE}/users/me/resume`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: fd,
        });
        if (!res.ok) {
          let errMsg = 'Upload failed';
          try { const err = await res.json(); errMsg = err.message || errMsg; } catch {}
          alert(errMsg);
          return;
        }
        const data = await res.json();
        setProfile(prev => ({ ...prev, resume: data.resume }));
        setResume(file);
        alert('Resume uploaded');
      } catch (err) {
        console.error(err);
        alert('Failed to upload resume');
      }
    })();
  };

  if (loading) return <div className="p-6">Loading profile...</div>;

  if (!profile) return <div className="p-6">You must be logged in to view this page.</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-64 bg-white border-r border-gray-200 p-6 flex flex-col justify-between">
        <div>
          <h1 className="text-2xl font-bold text-blue-600 mb-8">FindInternship</h1>
          <nav className="space-y-3">
            <button onClick={() => setActiveTab('profile')} className={`w-full text-left p-2 rounded-lg ${activeTab === 'profile' ? 'bg-blue-50 text-blue-700 font-medium' : ''}`}>Profile</button>
            <button onClick={() => setActiveTab('applications')} className={`w-full text-left p-2 rounded-lg ${activeTab === 'applications' ? 'bg-blue-50 text-blue-700 font-medium hover:bg-gray-100' : 'hover:bg-gray-100'}`}>My Applications</button>
            <button onClick={() => setActiveTab('browse')} className={`w-full text-left p-2 rounded-lg ${activeTab === 'browse' ? 'bg-blue-50 text-blue-700 font-medium hover:bg-gray-100' : 'hover:bg-gray-100'}`}>Browse Internships</button>
          </nav>
        </div>

        <div className="flex items-center gap-3 mt-8 relative">
          {/* Profile picture (avatar or initial) */}
          {profile && profile.avatar ? (
            <img
              src={profile.avatar}
              alt="profile"
              className="w-10 h-10 rounded-full object-cover border-2 border-blue-500"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center text-white font-bold">
              {getInitial(profile.name)}
            </div>
          )}
          <div className="relative" ref={userMenuRef}>
            <button onClick={() => setShowUserMenu(s => !s)} className="flex flex-col text-left">
              <span className="font-semibold text-sm">{(profile.name || '').split(' ')[0]}</span>
              <span className="text-xs text-gray-500">Student ▾</span>
            </button>

            {showUserMenu && (
              <div className="absolute left-0 bottom-full mb-2 w-44 bg-white border rounded shadow-md z-50">
                <button onClick={() => { api.clearAuth(); setShowUserMenu(false); navigate('/'); }} className="w-full text-left px-3 py-2 hover:bg-gray-100">Logout</button>
              </div>
            )}
          </div>
        </div>
      </aside>

      <main className="flex-1 p-10">
        {activeTab === 'profile' && (
          <div className="bg-white rounded-xl shadow p-8 mb-8">
            <div className="flex items-center gap-6">
              {/* Profile picture (avatar or initial) */}
              {profile && profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt="profile"
                  className="w-24 h-24 rounded-full object-cover border-4 border-blue-500"
                />
              ) : (
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-blue-800 text-2xl font-bold">
                  {getInitial(profile.name)}
                </div>
              )}
              <div>
                <h2 className="text-2xl font-bold">{profile.name}</h2>
                <p className="text-gray-600">{profile.degree}</p>
                <p className="text-gray-500">{profile.university}</p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <p className="text-gray-500 text-sm">Email</p>
                <p className="font-medium">{profile.email}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Phone</p>
                {editing ? (
                  <input value={profile.phone || ''} onChange={e => setProfile({ ...profile, phone: e.target.value })} className="w-full p-2 border rounded" />
                ) : (
                  <p className="font-medium">{profile.phone}</p>
                )}
              </div>
              <div>
                <p className="text-gray-500 text-sm">Location</p>
                {editing ? (
                  <input value={profile.location || ''} onChange={e => setProfile({ ...profile, location: e.target.value })} className="w-full p-2 border rounded" />
                ) : (
                  <p className="font-medium">{profile.location}</p>
                )}
              </div>
              <div>
                <p className="text-gray-500 text-sm">University</p>
                {editing ? (
                  <input value={profile.university || ''} onChange={e => setProfile({ ...profile, university: e.target.value })} className="w-full p-2 border rounded" />
                ) : (
                  <p className="font-medium">{profile.university}</p>
                )}
              </div>
              <div>
                <p className="text-gray-500 text-sm">Degree</p>
                {editing ? (
                  <input value={profile.degree || ''} onChange={e => setProfile({ ...profile, degree: e.target.value })} className="w-full p-2 border rounded" />
                ) : (
                  <p className="font-medium">{profile.degree}</p>
                )}
              </div>
            </div>

            <div className="mt-6">
              <h3 className="font-semibold text-lg mb-2">About</h3>
              {editing ? (
                <textarea value={profile.about || ''} onChange={e => setProfile({ ...profile, about: e.target.value })} className="w-full p-3 border rounded-lg" rows={4} />
              ) : (
                <p className="text-gray-700 leading-relaxed">{profile.about}</p>
              )}
            </div>

            <div className="mt-6">
              <h3 className="font-semibold text-lg mb-2">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {editing ? (
                  <textarea value={Array.isArray(profile.skills) ? profile.skills.join(', ') : (profile.skills || '')} onChange={e => setProfile({ ...profile, skills: e.target.value })} className="w-full p-3 border rounded-lg" rows={2} />
                ) : (
                  (profile.skills || []).map((skill, idx) => (
                    <span key={idx} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">{skill}</span>
                  ))
                )}
              </div>
            </div>

            <div className="mt-8">
              {!editing ? (
                <button onClick={() => setEditing(true)} className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 mr-3">Edit Profile</button>
              ) : (
                <>
                  <button onClick={save} className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 mr-3">Save</button>
                  <button onClick={() => setEditing(false)} className="bg-gray-200 px-5 py-2 rounded-lg">Cancel</button>
                </>
              )}

              <label htmlFor="resume-upload" className="bg-gray-200 text-gray-700 px-5 py-2 rounded-lg hover:bg-gray-300 cursor-pointer">
                {profile.resume ? "Re-upload Resume" : "Upload Resume"}
              </label>
              <input id="resume-upload" type="file" accept="application/pdf" className="hidden" onChange={handleResumeUpload} />

              {profile.resume && (
                <div className="mt-4 p-4 bg-gray-50 border rounded-lg flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-800">Resume</p>
                    <p className="text-sm text-gray-500">Uploaded</p>
                  </div>
                  <a href={`${UPLOADS_BASE}${profile.resume}`} target="_blank" rel="noopener noreferrer" className="bg-blue-600 text-white px-4 py-1 rounded-md hover:bg-blue-700 text-sm">View Resume</a>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'applications' && (
          <div className="bg-white rounded-xl shadow p-8 mb-8">
            <h3 className="font-semibold text-lg mb-2">My Applications</h3>
            <div className="space-y-3">
              {applications.length === 0 && <p className="text-sm text-gray-500">You haven't applied to any internships yet.</p>}
              {applications.map((app) => (
                <div key={app._id} className="p-4 border rounded-lg bg-gray-50 flex justify-between items-center">
                  <div>
                    <p className="font-medium">{app.internship?.title || 'Unknown'}</p>
                    <p className="text-sm text-gray-500">{app.internship?.company || ''}</p>
                    <p className="text-sm text-gray-400">{app.internship?.location || ''}</p>
                    {app.message && (
                      <p className="text-sm text-red-600 mt-2">Reason: {app.message}</p>
                    )}
                  </div>
                  <div className="text-sm">
                    {(() => {
                      const s = (app.status || '').toLowerCase();
                      if (s === 'accepted') return <span className="px-3 py-1 rounded-full bg-green-100 text-green-700">Accepted</span>;
                      if (s === 'rejected') return <span className="px-3 py-1 rounded-full bg-red-100 text-red-700">Rejected</span>;
                      if (s === 'under_review' || s === 'review') return <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-800">Under Review</span>;
                      return <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700">{app.status || 'Applied'}</span>;
                    })()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'browse' && (
          <div className="bg-white rounded-xl shadow p-8 mb-8">
            <h3 className="font-semibold text-lg mb-2">Browse Internships</h3>
            <p className="text-sm text-gray-600">Click the button below to browse internships.</p>
            <div className="mt-4">
              <a href="/find-internship" className="bg-blue-600 text-white px-4 py-2 rounded">Go to Browse</a>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default StudentProfile;
