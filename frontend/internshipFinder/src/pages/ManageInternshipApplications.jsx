import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api';

const ManageInternshipApplications = () => {
  const { id } = useParams();
  const [applications, setApplications] = useState([]);
  const [internship, setInternship] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const token = api.getToken();
        console.debug('[ManageInternshipApplications] id=', id, 'tokenPresent=', !!token);
        if (!token) throw new Error('Not authenticated');
        const apps = await api.get(`/internships/${id}/applications`, token);
        console.debug('[ManageInternshipApplications] apps:', apps);
        setApplications(apps || []);
        try {
          const item = await api.get(`/internships/${id}`);
          setInternship(item);
        } catch (e) {
          
        }
      } catch (err) {
        let msg = 'Failed to load';
        if (!err) msg = 'Unknown error';
        else if (typeof err === 'string') msg = err;
        else if (err.message) msg = err.message;
        else msg = JSON.stringify(err);
        console.error('[ManageInternshipApplications] load error:', err);
        setError(msg);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const navigate = useNavigate();
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');

  if (loading) return (
    <div className="p-8">
      <div className="text-center py-20">
        <div className="inline-block animate-pulse px-6 py-4 bg-gray-100 rounded">Please wait — loading applications…</div>
      </div>
    </div>
  );

  const openProfile = (applicant) => {
    setSelectedApplicant(applicant);
    setShowModal(true);
  };

  const closeProfile = () => {
    setSelectedApplicant(null);
    setShowModal(false);
  };

  const handleDeleteInternship = async () => {
    if (!confirm('Delete this internship and all applications?')) return;
    try {
      const token = api.getToken();
      if (!token) throw new Error('Not authenticated');
      await api.del(`/internships/${id}`, token);
      navigate('/manage-internships');
    } catch (err) {
      alert('Failed to delete internship');
    }
  };

  const updateApplicationStatus = async (appId, status, message) => {
    try {
      const token = api.getToken();
      if (!token) throw new Error('Not authenticated');
      const payload = { status };
      if (status === 'accepted' || status === 'under_review') {
        payload.message = '';
      } else if (typeof message !== 'undefined') {
        payload.message = message;
      }
      const updated = await api.put(`/applications/${appId}/status`, payload, token);
      setApplications(prev => prev.map(p => p._id === updated._id ? updated : p));
    } catch (err) {
      let msg = 'Failed to update status';
      if (err && err.message) msg = err.message;
      alert(msg);
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Applicants {internship ? `for "${internship.title}"` : ''}</h2>
          <p className="text-sm text-gray-500">{applications.length} application(s)</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/manage-internships')} className="px-4 py-2 bg-gray-100 rounded">Back</button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          <button onClick={() => setFilterStatus('all')} className={`px-3 py-1 rounded ${filterStatus === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}>All</button>
          <button onClick={() => setFilterStatus('accepted')} className={`px-3 py-1 rounded ${filterStatus === 'accepted' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}>Accepted</button>
          <button onClick={() => setFilterStatus('under_review')} className={`px-3 py-1 rounded ${filterStatus === 'under_review' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}>Under Review</button>
          <button onClick={() => setFilterStatus('rejected')} className={`px-3 py-1 rounded ${filterStatus === 'rejected' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}>Rejected</button>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Sort:</label>
          <select value={sortOrder} onChange={e => setSortOrder(e.target.value)} className="px-2 py-1 border rounded">
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
          </select>
        </div>
      </div>

      {error && <p className="text-red-500">{error}</p>}

      {applications.length === 0 && <p className="text-gray-500">No applications yet.</p>}

      <div className="mt-4 space-y-4">
        {(() => {
          let list = (applications || []).slice();
          if (filterStatus && filterStatus !== 'all') {
            list = list.filter(a => ((a.status || '').toLowerCase()) === String(filterStatus).toLowerCase());
          }
          list.sort((a, b) => {
            if (sortOrder === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
            return new Date(a.createdAt) - new Date(b.createdAt);
          });
          return list.map(app => (
          <div key={app._id} className="p-4 border rounded-lg flex justify-between items-center">
            <div>
              <p className="font-semibold">{app.applicant?.name || 'Unknown'} {app.applicant?._id && <span className="ml-2 inline-block px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded">Active profile</span>}</p>
              <p className="text-sm text-gray-500">{app.applicant?.email || ''} • {app.applicant?.phone || ''}</p>
              <p className="text-sm text-gray-400">Applied on {new Date(app.createdAt).toLocaleDateString()}</p>
              {app.message && <p className="text-sm text-red-600">Reason: {app.message}</p>}
            </div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">{app.status}</span>
              <button onClick={() => openProfile(app.applicant)} className="text-blue-600 text-sm">View profile</button>
              <div className="flex items-center gap-2">
                {app.status !== 'under_review' && (
                  <button onClick={async () => await updateApplicationStatus(app._id, 'under_review')} className="text-sm text-blue-600">Under Review</button>
                )}
                {app.status !== 'accepted' && (
                  <button onClick={async () => await updateApplicationStatus(app._id, 'accepted')} className="text-sm text-green-600">Accept</button>
                )}
                {app.status !== 'rejected' && (
                  <button onClick={async () => {
                    const reason = window.prompt('Optional rejection message (reason):', '');
                    if (reason === null) return; 
                    await updateApplicationStatus(app._id, 'rejected', reason);
                  }} className="text-sm text-red-600">Reject</button>
                )}
              </div>
            </div>
          </div>
          ));
        })()}
      </div>

      {/* Profile modal */}
      {showModal && selectedApplicant && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-11/12 max-w-2xl p-6">
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-semibold">{selectedApplicant.name}</h3>
              <button onClick={closeProfile} className="text-gray-500">Close</button>
            </div>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{selectedApplicant.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium">{selectedApplicant.phone || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">University</p>
                <p className="font-medium">{selectedApplicant.university || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Degree</p>
                <p className="font-medium">{selectedApplicant.degree || '-'}</p>
              </div>
            </div>
            <div className="mt-6">
              <h4 className="font-semibold">Resume</h4>
              {selectedApplicant.resume ? (
                <a href={`${(import.meta.env.VITE_API_BASE || 'http://localhost:5000').replace(/\/api$/, '')}${selectedApplicant.resume}`} target="_blank" rel="noreferrer" className="text-blue-600">Open resume</a>
              ) : (
                <p className="text-sm text-gray-500">No resume uploaded</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageInternshipApplications;
