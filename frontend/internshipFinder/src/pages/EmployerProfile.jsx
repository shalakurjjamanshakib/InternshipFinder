import React, { useState, useEffect } from 'react';
import api from '../api';

const EmployerProfile = () => {
  const [profile, setProfile] = useState({
    company: '',
    companyWebsite: '',
    companyDescription: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const token = api.getToken();
        if (!token) return;
        const u = await api.get('/users/me', token);
        setProfile({
          company: u.company || '',
          companyWebsite: u.companyWebsite || '',
          companyDescription: u.companyDescription || ''
        });
      } catch (err) {
        console.error('Failed to load employer profile', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const save = async () => {
    try {
      setSaving(true);
      const token = api.getToken();
      const updated = await api.put('/users/me', profile, token);
      setProfile({
        company: updated.company || '',
        companyWebsite: updated.companyWebsite || '',
        companyDescription: updated.companyDescription || ''
      });
      alert('Company profile saved');
    } catch (err) {
      console.error(err);
      alert('Failed to save company profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow">
        <h2 className="text-2xl font-semibold mb-6">Company Profile</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Company Name</label>
            <input
              className="w-full p-3 border rounded"
              value={profile.company}
              onChange={e => setProfile({ ...profile, company: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Website</label>
            <input
              className="w-full p-3 border rounded"
              value={profile.companyWebsite}
              onChange={e => setProfile({ ...profile, companyWebsite: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Description</label>
            <textarea
              className="w-full p-3 border rounded"
              rows={5}
              value={profile.companyDescription}
              onChange={e => setProfile({ ...profile, companyDescription: e.target.value })}
            />
          </div>

          <div className="text-right">
            <button
              className="bg-blue-600 text-white px-6 py-2 rounded"
              onClick={save}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployerProfile;
