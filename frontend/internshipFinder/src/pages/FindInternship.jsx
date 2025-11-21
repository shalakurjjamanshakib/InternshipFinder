import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from 'react-router-dom';
import api from "../api";

const FindInternship = () => {

    const getInitial = (name) => {
      if (!name) return '?';
      return name.trim()[0].toUpperCase();
    };
  const [searchTerm, setSearchTerm] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState([]);
  const [mode, setMode] = useState([]);
  const [hideClosed, setHideClosed] = useState(true);
  const [internships, setInternships] = useState([]);
  const [applied, setApplied] = useState(new Set());
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [profileForm, setProfileForm] = useState({ phone: '', university: '', degree: '', skills: '' });
  const [pendingApplyId, setPendingApplyId] = useState(null);
  const [currentUser, setCurrentUser] = useState(api.getUser());
  const [selectedJob, setSelectedJob] = useState(null);
  const [showJobModal, setShowJobModal] = useState(false);

  const handleCheckboxChange = (value, setter, state) => {
    if (state.includes(value)) setter(state.filter((item) => item !== value));
    else setter([...state, value]);
  };

  useEffect(() => {
    (async () => {
      try {
        const token = api.getToken();
        const data = await api.get('/internships', token);
        const list = (data || []).slice();
        const sorted = list.sort((a, b) => {
          const aClosed = (a.applyBy && new Date() > new Date(a.applyBy)) || (a.status && a.status.toLowerCase() !== 'open');
          const bClosed = (b.applyBy && new Date() > new Date(b.applyBy)) || (b.status && b.status.toLowerCase() !== 'open');
          if (aClosed !== bClosed) return aClosed ? 1 : -1; 
          return new Date(b.createdAt) - new Date(a.createdAt); 
        });
        setInternships(sorted);

        let user = api.getUser();
        if (!user && token) {
          try {
            const me = await api.get('/users/me', token);
            const stored = { id: me._id || me.id, name: me.name, email: me.email, role: (me.role || '').toLowerCase(), avatar: me.avatar };
            api.setAuth(token, stored);
            user = stored;
            setCurrentUser(stored);
          } catch (e) {
            console.warn('failed to fetch current user', e);
          }
        }

        if (user && (user.role || '').toLowerCase() === 'student') {
          try {
            const apps = await api.get('/applications/my', token);
            const appliedIds = new Set((apps || []).map(a => a.internship ? a.internship._id : a.internship));
            setApplied(appliedIds);
          } catch (e) {
            console.warn('failed to load applications', e);
          }
        }
      } catch (err) {
        console.error('Failed to fetch internships', err);
      }
    })();
  }, []);

  const handleApply = async (id) => {
    try {
      const token = api.getToken();
      if (!token) {
        alert('Please login as a student to apply');
        return;
      }
      let internship;
      try {
        internship = await api.get(`/internships/${id}`);
      } catch (e) {
        alert('Unable to fetch internship details. Try again.');
        return;
      }

      if (internship.applyBy && new Date() > new Date(internship.applyBy)) {
        alert('Application deadline has passed for this internship.');
        return;
      }

      const profile = await api.get('/users/me', token);
      const needs = [];
      if (!profile.phone) needs.push('phone');
      if (!profile.university) needs.push('university');
      if (!profile.degree) needs.push('degree');
      if (!profile.skills || (Array.isArray(profile.skills) && profile.skills.length === 0)) needs.push('skills');
      if (needs.length > 0) {

        setProfileForm({ phone: profile.phone || '', university: profile.university || '', degree: profile.degree || '', skills: (profile.skills || []).join(', ') });
        setPendingApplyId(id);
        setShowProfileForm(true);
        return;
      }
      await api.post(`/internships/${id}/apply`, {}, token);
      setApplied(prev => new Set(Array.from(prev).concat([id])));
      alert('Applied successfully');
    } catch (err) {
      const msg = err && err.message ? err.message : JSON.stringify(err);
      alert('Failed to apply: ' + msg);
    }
  };

  const submitProfileThenApply = async () => {
    try {
      const token = api.getToken();
      if (!token) { alert('Not authenticated'); return; }
      const body = { ...profileForm, skills: (profileForm.skills || '').split(/[,\n]+/).map(s => s.trim()).filter(Boolean) };
      await api.put('/users/me', body, token);
      setShowProfileForm(false);
      if (pendingApplyId) {
        await api.post(`/internships/${pendingApplyId}/apply`, {}, token);
        setApplied(prev => new Set(Array.from(prev).concat([pendingApplyId])));
        setPendingApplyId(null);
        alert('Profile saved and application submitted');
      }
    } catch (err) {
      const msg = err && err.message ? err.message : JSON.stringify(err);
      alert('Failed to save profile: ' + msg);
    }
  };

  const user = currentUser || api.getUser();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm p-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-600">InternshipFinder</h1>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="font-semibold">{user ? user.name : 'Guest'}</p>
            <p className="text-sm text-gray-500">{user ? user.role : 'Student'}</p>
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
              {getInitial(user && user.company ? user.company : user && user.name ? user.name : 'U')}
            </div>
          )}
        </div>
      </header>

      <section className="bg-white shadow-sm py-8">
        <div className="max-w-[1600px] mx-auto px-6">
          <h2 className="text-3xl font-bold mb-2">Find Your Dream Internship</h2>
          <p className="text-gray-500 mb-6">Explore thousands of internship opportunities for you.</p>

          <div className="flex flex-col sm:flex-row gap-4">
            <input type="text" placeholder="Search internship title or company" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="flex-1 p-4 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            <input type="text" placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} className="sm:w-64 p-4 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            <div className="flex gap-2">
              <button onClick={() => {}} className="bg-blue-600 text-white px-6 py-4 rounded-lg hover:bg-blue-700 transition">Search</button>
              <button onClick={() => { setCategory([]); setMode([]); setSearchTerm(''); setLocation(''); }} className="bg-gray-200 text-gray-700 px-4 py-4 rounded-lg hover:bg-gray-300 transition">Clear</button>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-[1600px] mx-auto p-8 flex gap-8">
        <aside className="w-80 bg-white p-6 rounded-xl shadow h-fit">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Filter Internships</h3>
            <button onClick={() => { setCategory([]); setMode([]); }} className="text-blue-600 text-sm hover:underline">Clear</button>
          </div>

          <div className="mb-6">
            <h4 className="font-medium mb-2">Internship Mode</h4>
            <div className="space-y-2 text-sm text-gray-700">
              {["Remote", "On-site", "Hybrid"].map((m) => (
                <label key={m} className="flex items-center gap-2">
                  <input type="checkbox" checked={mode.includes(m)} onChange={() => handleCheckboxChange(m, setMode, mode)} className="accent-blue-600" />
                  {m}
                </label>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={hideClosed} onChange={(e) => setHideClosed(e.target.checked)} className="accent-blue-600" />
              <span className="text-sm text-gray-600">Hide closed jobs</span>
            </label>
          </div>

          <div>
            <h4 className="font-medium mb-2">Category</h4>
            <div className="space-y-2 text-sm text-gray-700">
              {["Software", "Design", "Mobile Development", "Full Stack Development", "DevOps","Frontend Development","Backend Development","Data Science","Machine Learning","Artificial Intelligence","Cybersecurity","Cloud Computing"].map((cat) => (
                <label key={cat} className="flex items-center gap-2">
                  <input type="checkbox" checked={category.includes(cat)} onChange={() => handleCheckboxChange(cat, setCategory, category)} className="accent-blue-600" />
                  {cat}
                </label>
              ))}
            </div>
          </div>
        </aside>

        <main className="flex-1">
          <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-8">
            {(() => {
              const filteredInternships = internships.filter((job) => {
                const term = (searchTerm || '').toLowerCase();
                if (term) {
                  const inTitle = (job.title || '').toLowerCase().includes(term);
                  const inCompany = (job.company || '').toLowerCase().includes(term);
                  if (!inTitle && !inCompany) return false;
                }
                if (location && location.trim() !== '') {
                  if (!((job.location || '').toLowerCase().includes(location.toLowerCase()))) return false;
                }
                if (mode.length > 0 && !mode.includes(job.mode)) return false;
                if (category.length > 0 && !category.includes(job.category)) return false;
                const isClosed = (job.applyBy && new Date() > new Date(job.applyBy)) || (job.status && job.status.toLowerCase() !== 'open');
                if (hideClosed && isClosed) return false;
                return true;
              });

              if (filteredInternships.length === 0) {
                return <div className="col-span-full p-6 text-center text-gray-600">No internships match your search and filters.</div>;
              }

              return filteredInternships.map((job) => (
              <div key={job._id || job.title} className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-lg transition border border-gray-100">
                <h3 className="text-xl font-semibold text-gray-800 mb-1">{job.title}</h3>
                <p className="text-sm text-gray-500 mb-2">{job.company}</p>

                <div className="text-sm text-gray-600 space-y-1">
                  <p>{job.location}</p>
                  <p className="text-green-600 font-medium">{job.mode}</p>
                  <p>{job.category}</p>
                  <p>Duration: {job.duration || 'N/A'}</p>
                  <p>Apply By: {job.applyBy ? new Date(job.applyBy).toLocaleDateString() : 'Open'}</p>
                </div>

                <div className="flex justify-between items-center mt-6">
                  <p className="text-blue-600 font-semibold text-sm">{job.minSalary && job.maxSalary ? `${job.minSalary} - ${job.maxSalary}` : job.salary || ''}</p>
                  <div className="flex items-center gap-3">
                    {user && user.role === 'student' ? (
                      applied.has(job._id) ? (
                        <span className="px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-600">Applied</span>
                      ) : (
                        (job.applyBy && new Date() > new Date(job.applyBy)) || (job.status && job.status.toLowerCase() !== 'open') ? (
                          <span className="px-3 py-1 rounded-full text-xs bg-gray-100 text-gray-600">Closed</span>
                        ) : (
                          <button onClick={() => navigate(`/internships/${job._id}`)} className="bg-blue-600 text-white px-3 py-1 rounded text-sm">Apply</button>
                        )
                      )
                    ) : null}
                    {(() => {
                      const isClosed = (job.applyBy && new Date() > new Date(job.applyBy)) || (job.status && job.status.toLowerCase() !== 'open');
                      const displayStatus = isClosed ? 'Closed' : (job.status || 'Open');
                      const cls = displayStatus === 'Open' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600';
                      return <span className={`px-3 py-1 rounded-full text-xs ${cls}`}>{displayStatus}</span>;
                    })()}
                  </div>
                </div>
              </div>
              ));
            })()}
          </div>
        </main>
      </div>

      {/* Job details modal shown before applying */}
      {showJobModal && selectedJob && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-11/12 max-w-3xl p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-bold">{selectedJob.title}</h3>
                <p className="text-sm text-gray-600">{selectedJob.company} • {selectedJob.location}</p>
              </div>
              <button onClick={() => setShowJobModal(false)} className="text-gray-500">Close</button>
            </div>

            <div className="mt-4">
              <h4 className="font-semibold">Description</h4>
              <p className="text-gray-700 mt-2">{selectedJob.description || 'No description provided.'}</p>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Category</p>
                <p className="font-medium">{selectedJob.category || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Mode</p>
                <p className="font-medium">{selectedJob.mode || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Duration</p>
                <p className="font-medium">{selectedJob.duration || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Salary</p>
                <p className="font-medium">{selectedJob.minSalary && selectedJob.maxSalary ? `${selectedJob.minSalary} - ${selectedJob.maxSalary}` : (selectedJob.salary || '-')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className="font-medium">{((selectedJob.applyBy && new Date() > new Date(selectedJob.applyBy)) || (selectedJob.status && selectedJob.status.toLowerCase() !== 'open')) ? 'Closed' : (selectedJob.status || 'Open')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Posted</p>
                <p className="font-medium">{selectedJob.createdAt ? new Date(selectedJob.createdAt).toLocaleString() : '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Application Deadline</p>
                <p className="font-medium">{selectedJob.applyBy ? new Date(selectedJob.applyBy).toLocaleString() : 'Open'}</p>
              </div>
            </div>

            <div className="mt-4">
              <h4 className="font-semibold">Requirements</h4>
              <ul className="list-disc list-inside text-gray-700 mt-2">
                {(selectedJob.requirements || []).length > 0 ? selectedJob.requirements.map((r, i) => (
                  <li key={i}>{r}</li>
                )) : <li>Not specified</li>}
              </ul>
            </div>

            <div className="mt-6 flex justify-end items-center gap-3">
              <button onClick={() => setShowJobModal(false)} className="px-4 py-2 bg-gray-100 rounded">Cancel</button>
              <button onClick={async () => {
                try {
                  await handleApply(selectedJob._id);
                  setShowJobModal(false);
                } catch (e) {
                  console.error(e);
                }
              }} className="px-4 py-2 bg-blue-600 text-white rounded">Confirm & Apply</button>
            </div>
          </div>
        </div>
      )}
  </div>
  );
};

export default FindInternship;
