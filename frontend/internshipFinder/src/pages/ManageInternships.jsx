import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';

const ManageInternships = () => {
  const [internships, setInternships] = useState([]);
  const [counts, setCounts] = useState({});
  const [currentUser, setCurrentUser] = useState(api.getUser());
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);
  const navigate = useNavigate();
    useEffect(() => {
      const handler = (e) => {
        if (showUserMenu && userMenuRef.current && !userMenuRef.current.contains(e.target)) setShowUserMenu(false);
      };
      document.addEventListener('mousedown', handler);
      return () => document.removeEventListener('mousedown', handler);
    }, [showUserMenu]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const token = api.getToken();
        if (!token) {
          const list = await api.get('/internships');
          setInternships(list || []);
          setCounts({});
          return;
        }

        const [list, apps] = await Promise.all([
          api.get('/internships/my/list', token),
          api.get('/applications/received', token).catch(() => []),
        ]);

        const map = {};
        (apps || []).forEach(a => {
          const id = a.internship && (a.internship._id || a.internship) || null;
          if (!id) return;
          map[id] = (map[id] || 0) + 1;
        });

        setInternships(list || []);
        setCounts(map);
      } catch (err) {
        console.error('Failed to load internships', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleClose = (id) => {
    setInternships((prev) => prev.map(item => item._id === id ? { ...item, status: 'Closed' } : item));
  };

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

  const handleDelete = async (id) => {
    if (!confirm('Delete this internship?')) return;
    try {
      const token = api.getToken();
      if (!token) throw new Error('Not authenticated');
      await api.del(`/internships/${id}`, token);
      setInternships(prev => prev.filter(i => i._id !== id));
    } catch (err) {
      const msg = (err && (err.message || err.error || err.msg)) ? (err.message || err.error || err.msg) : JSON.stringify(err);
      alert('Failed to delete: ' + msg);
    }
  };

  

  if (loading) return (
    <div className="flex min-h-screen bg-gray-50 text-gray-800">
      <aside className="w-64 bg-white border-r border-gray-200 p-6 flex flex-col justify-between">
        <div>
          <h1 className="text-2xl font-bold text-blue-600 mb-8">FindInternship</h1>
          <nav className="space-y-3">
            <Link to="/employer-dashboard" className="block w-full text-left p-2 rounded-lg hover:bg-gray-100">Dashboard</Link>
            <Link to="/post-internship" className="block w-full text-left p-2 rounded-lg hover:bg-gray-100">Post Internship</Link>
            <Link to="/manage-internships" className="block w-full text-left p-2 rounded-lg bg-blue-50 text-blue-700 font-medium">Manage Internship</Link>
            <Link to="/employer-profile" className="block w-full text-left p-2 rounded-lg hover:bg-gray-100">Company Profile</Link>
          </nav>
        </div>

        <div className="flex items-center gap-3 mt-8 relative">
          <div className="w-10 h-10 bg-blue-200 rounded-full" />
          <div>
            <p className="font-semibold">Fahim</p>
            <p className="text-sm text-gray-500">Employer</p>
          </div>
        </div>
      </aside>

      <main className="flex-1 p-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold">Manage Internships</h2>
          <p className="text-gray-500">Please wait — loading internships…</p>
        </div>

        <div className="bg-white p-8 rounded-xl shadow">
          <div className="h-48 flex items-center justify-center">
            <div className="animate-pulse px-8 py-4 bg-gray-100 rounded">Loading…</div>
          </div>
        </div>
      </main>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-800">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 p-6 flex flex-col justify-between">
        <div>
          <h1 className="text-2xl font-bold text-blue-600 mb-8">FindInternship</h1>
          <nav className="space-y-3">
            <Link to="/employer-dashboard" className="block w-full text-left p-2 rounded-lg hover:bg-gray-100">Dashboard</Link>
            <Link to="/post-internship" className="block w-full text-left p-2 rounded-lg hover:bg-gray-100">Post Internship</Link>
            <Link to="/manage-internships" className="block w-full text-left p-2 rounded-lg bg-blue-50 text-blue-700 font-medium">Manage Internship</Link>
            <Link to="/employer-profile" className="block w-full text-left p-2 rounded-lg hover:bg-gray-100">Company Profile</Link>
          </nav>
        </div>

        <div className="flex items-center gap-3 mt-8 relative" ref={userMenuRef}>
          {currentUser && currentUser.avatar ? (
            <img src={currentUser.avatar} alt="profile" className="w-10 h-10 rounded-full object-cover" />
          ) : (
            <div className="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center text-white font-bold">{(currentUser && currentUser.name) ? currentUser.name.charAt(0).toUpperCase() : 'E'}</div>
          )}
          <div>
            <button onClick={() => setShowUserMenu(s => !s)} className="text-left">
              <p className="font-semibold">{(currentUser && currentUser.name) ? currentUser.name.split(' ')[0] : 'Employer'}</p>
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

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold">Welcome back!</h2>
          <p className="text-gray-500">
            Manage your internship postings and track applications easily.
          </p>
        </div>

        <div className="bg-white p-8 rounded-xl shadow">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xl font-semibold">Manage Internships</h3>
              <p className="text-gray-500 text-sm">Showing {internships.length} internships</p>
            </div>
            <Link to="/post-internship" className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700">
              + Add New Internship
            </Link>
          </div>

          <table className="w-full border-collapse">
            <thead>
                <tr className="border-b bg-gray-50 text-left text-gray-600 text-sm">
                <th className="p-3">Internship Title</th>
                <th className="p-3">Company</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-center">Applicants</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>

            <tbody>
              {internships.map((intern) => (
                <tr
                  key={intern._id}
                  className="border-b hover:bg-gray-50 transition-colors"
                >
                  <td className="p-3 font-medium">{intern.title}</td>
                  <td className="p-3 text-gray-600">{intern.company || (intern.postedBy && intern.postedBy.name)}</td>
                  <td className="p-3">
                    {(() => {
                      const st = deriveStatus(intern);
                      return (
                        <span className={`px-3 py-1 text-sm rounded-full font-medium ${st === 'Open' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {st}
                        </span>
                      );
                    })()}
                  </td>
                  <td className="p-3 text-center">
                    <Link to={`/manage-internships/${intern._id}/applications`} className="text-blue-600 hover:underline">
                      {counts[intern._id] || 0}
                    </Link>
                  </td>
                  <td className="p-3 space-x-3">
                    <Link to={`/post-internship?id=${intern._id}`} className="text-blue-600 hover:underline text-sm">Edit</Link>
                    {/* Close button removed as requested */}
                    <button
                      onClick={() => handleDelete(intern._id)}
                      className="text-red-600 hover:underline text-sm"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default ManageInternships;
