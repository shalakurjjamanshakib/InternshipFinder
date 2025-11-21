
  const deriveStatus = (intern) => {
    try {
      const now = Date.now();
      if (intern.status && String(intern.status).toLowerCase() === 'closed') return 'Closed';
      if (intern.applyBy) {
        const d = new Date(intern.applyBy);
        if (!isNaN(d.getTime()) && d.getTime() < now) return 'Closed';
      }
      return 'Open';
    } catch (e) {
      return (intern.status || 'Open');
    }
  };
import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from 'react-router-dom';
import api from "../api";

const EmployerDashboard = () => {
  const [recentInternships, setRecentInternships] = useState([]);
  const [applications, setApplications] = useState([]);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
      (async () => {
      try {
      const token = api.getToken();
    console.debug('[EmployerDashboard] token present=', !!token);
      if (!token) return;
        const list = await api.get('/internships/my/list', token);
  console.debug('[EmployerDashboard] internships fetched:', list);
        setRecentInternships(list || []);
        try {
          const apps = await api.get('/applications/received', token);
          console.debug('[EmployerDashboard] applications fetched:', apps);
          setApplications(apps || []);
        } catch (e) {
          console.warn('failed to load received applications', e);
        }
      } catch (err) {
        console.error('Failed to load internships', err);
      }
    })();
  }, []);


  useEffect(() => {
    const handler = (e) => {
      if (showUserMenu && userMenuRef.current && !userMenuRef.current.contains(e.target)) setShowUserMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showUserMenu]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this internship?')) return;
    try {
      const token = api.getToken();
      await api.del(`/internships/${id}`, token);
      setRecentInternships(prev => prev.filter(i => i._id !== id));
    } catch (err) {
      alert('Failed to delete');
    }
  };


  const recent4Internships = (recentInternships || [])
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 4);

  const recent4Applications = (applications || [])
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 4);

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-800">

      <aside className="w-64 bg-white border-r border-gray-200 p-6 flex flex-col justify-between">
        <div>
          <h1 className="text-2xl font-bold text-blue-600 mb-8">FindInternship</h1>
          <nav className="space-y-3">
            <Link to="/employer-dashboard" className="block w-full text-left p-2 rounded-lg bg-blue-50 text-blue-700 font-medium">Dashboard</Link>
            <Link to="/post-internship" className="block w-full text-left p-2 rounded-lg hover:bg-gray-100">Post Internship</Link>
            <Link to="/manage-internships" className="block w-full text-left p-2 rounded-lg hover:bg-gray-100">Manage Internships</Link>
            <Link to="/employer-profile" className="block w-full text-left p-2 rounded-lg hover:bg-gray-100">Company Profile</Link>
          </nav>
        </div>

        <div className="flex items-center gap-3 mt-8 relative" ref={userMenuRef}>
          <div className="w-10 h-10 bg-blue-200 rounded-full" />
          <div>
            <button onClick={() => setShowUserMenu(s => !s)} className="text-left">
              <p className="font-semibold">{(api.getUser() && api.getUser().name) ? api.getUser().name.split(' ')[0] : 'Employer'}</p>
              <p className="text-sm text-gray-500">Employer ▾</p>
            </button>
            {showUserMenu && (
              <div className="absolute left-0 bottom-full mb-2 w-44 bg-white border rounded shadow-md z-50">
                <button onClick={() => { api.clearAuth(); setShowUserMenu(false); navigate('/'); }} className="w-full text-left px-3 py-2 hover:bg-gray-100">Logout</button>
              </div>
            )}
          </div>
        </div>
      </aside>

      <main className="flex-1 p-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold">Welcome back!</h2>
          <p className="text-gray-500">Here’s what’s happening with your internships today.</p>
        </div>

        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-blue-600 text-white p-6 rounded-xl shadow">
            <h3 className="text-lg font-semibold">Active Internships</h3>
            <p className="text-4xl font-bold mt-2">{(recentInternships || []).filter(i => deriveStatus(i) === 'Open').length}</p>
          </div>

          <div className="bg-green-600 text-white p-6 rounded-xl shadow">
            <h3 className="text-lg font-semibold">Total Applicants</h3>
            <p className="text-4xl font-bold mt-2">{(applications || []).length}</p>
          </div>

          <div className="bg-purple-600 text-white p-6 rounded-xl shadow">
            <h3 className="text-lg font-semibold">Hired Interns</h3>
            <p className="text-4xl font-bold mt-2">{(applications || []).filter(a => a.status === 'accepted').length}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Recent Internship Posts</h3>
              <Link to="/manage-internships" className="text-blue-600 hover:underline text-sm">Manage</Link>
            </div>

            <div className="space-y-4">
              {recent4Internships
                .filter(i => deriveStatus(i) === 'Open')
                .map((internship) => (
                  <div key={internship._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div>
                      <p className="font-semibold">{internship.title}</p>
                      <p className="text-sm text-gray-500">
                        {internship.location} • {new Date(internship.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 rounded-full text-xs bg-green-100 text-green-700">Open</span>
                      <button onClick={() => handleDelete(internship._id)} className="text-red-600 text-sm">Delete</button>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Recent Applications</h3>
              <button className="text-blue-600 hover:underline text-sm">View all</button>
            </div>

              <div className="space-y-4">
                {recent4Applications.length === 0 && <p className="text-sm text-gray-500">No recent applications</p>}
                {recent4Applications.map((app) => (
                  <div key={app._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="font-semibold">{app.applicant?.name || 'Unknown'}</p>
                        <p className="text-sm text-gray-500">{app.internship?.title || ''} — {app.internship?.company || ''}</p>
                        <p className="text-sm text-gray-400">{new Date(app.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {(() => {
                        const s = (app.status || '').toLowerCase();
                        if (s === 'accepted') return <span className="px-3 py-1 rounded-full text-xs bg-green-100 text-green-700">Accepted</span>;
                        if (s === 'rejected') return <span className="px-3 py-1 rounded-full text-xs bg-red-100 text-red-700">Rejected</span>;
                        if (s === 'under_review' || s === 'review') return <span className="px-3 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">Under Review</span>;
                        return <span className="px-3 py-1 rounded-full text-xs bg-gray-100 text-gray-700">{app.status || 'Applied'}</span>;
                      })()}
                    </div>
                  </div>
                ))}
              </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EmployerDashboard;
