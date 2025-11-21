import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';

const InternshipDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await api.get(`/internships/${id}`);
        if (mounted) setJob(data);
      } catch (e) {
        console.error('Failed to load internship', e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [id]);

  const handleApply = async () => {
    try {
      const token = api.getToken();
      if (!token) {
        alert('Please login as a student to apply.');
        navigate('/login');
        return;
      }

      const profile = await api.get('/users/me', token);
      const needs = [];
      if (!profile.phone) needs.push('phone');
      if (!profile.university) needs.push('university');
      if (!profile.degree) needs.push('degree');
      if (!profile.skills || (Array.isArray(profile.skills) && profile.skills.length === 0)) needs.push('skills');
      if (needs.length > 0) {
        if (confirm('Your profile is missing required fields (phone/university/degree/skills). Go to profile to complete it?')) {
          navigate('/student-profile');
        }
        return;
      }

      setApplying(true);
      await api.post(`/internships/${id}/apply`, {}, token);
      alert('Application submitted');
    } catch (err) {
      console.error(err);
      const msg = err && err.message ? err.message : JSON.stringify(err);
      alert('Failed to apply: ' + msg);
    } finally {
      setApplying(false);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (!job) return <div className="p-8">Internship not found.</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">{job.title}</h1>
            <p className="text-sm text-gray-600">{job.company} • {job.location}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">{job.category}</p>
            <p className="text-sm text-gray-500">{job.mode}</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold">Description</h3>
            <p className="mt-2 text-gray-700">{job.description || 'No description provided.'}</p>

            <h4 className="mt-4 font-semibold">Requirements</h4>
            <ul className="list-disc list-inside mt-2 text-gray-700">
              {(job.requirements || []).length > 0 ? job.requirements.map((r, i) => <li key={i}>{r}</li>) : <li>Not specified</li>}
            </ul>
          </div>

          <aside className="bg-gray-50 p-4 rounded-lg border">
            <p className="text-sm text-gray-500">Duration</p>
            <p className="font-medium">{job.duration || '-'}</p>

            <p className="text-sm text-gray-500 mt-4">Salary</p>
            <p className="font-medium">{job.minSalary && job.maxSalary ? `${job.minSalary} - ${job.maxSalary}` : (job.salary || '-')}</p>

            <p className="text-sm text-gray-500 mt-4">Status</p>
            <p className="font-medium">{job.status || 'Open'}</p>

            <div className="mt-6">
              <button onClick={() => navigate(-1)} className="mr-3 px-4 py-2 bg-gray-100 rounded">Back</button>
              <button disabled={applying || job.status !== 'Open'} onClick={handleApply} className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-60">{applying ? 'Applying...' : 'Apply'}</button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default InternshipDetails;
