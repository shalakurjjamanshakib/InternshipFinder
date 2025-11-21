import React, { useState, useEffect } from "react";
import api from "../api";

const StudentProfile = () => {
  const [resume, setResume] = useState(null);

  const [profile, setProfile] = useState(student);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const token = api.getToken();
        if (!token) return;
        const user = await api.get('/users/me', token);
        setProfile({ ...student, ...user });
      } catch (err) {
        console.error('Failed to load profile', err);
      }
    })();
  }, []);

  const save = async () => {
    try {
      const token = api.getToken();
      const toSend = { ...profile };
      if (typeof toSend.skills === 'string') {
        toSend.skills = toSend.skills.split(/[\n,]+/).map(s => s.trim()).filter(Boolean);
      }
      const updated = await api.put('/users/me', toSend, token);
      setProfile(updated);
      setEditing(false);
      alert('Profile updated');
    } catch (err) {
      alert('Failed to update profile');
    }
  };

  const [applications, setApplications] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const token = api.getToken();
        if (!token) return;
        const apps = await api.get('/applications/my', token);
        setApplications(apps || []);
      } catch (err) {
        console.error('Failed to load applications', err);
      }
    })();
  }, []);

  const handleResumeUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setResume(file);
    } else {
      alert("Please upload a PDF file only.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-64 bg-white border-r border-gray-200 p-6 flex flex-col justify-between">
        <div>
          <h1 className="text-2xl font-bold text-blue-600 mb-8">FindInternship</h1>
          <nav className="space-y-3">

            <button className="w-full text-left p-2 rounded-lg bg-blue-50 text-blue-700 font-medium">
              Profile
            </button>
            <button className="w-full text-left p-2 rounded-lg hover:bg-gray-100">My Applications</button>
            <button className="w-full text-left p-2 rounded-lg hover:bg-gray-100">Browse Internships</button>
          </nav>
        </div>

        <div className="flex items-center gap-3 mt-8">
          <div className="w-10 h-10 bg-blue-200 rounded-full" />
          <div>
            <p className="font-semibold">{student.name.split(" ")[0]}</p>
            <p className="text-sm text-gray-500">Student</p>
          </div>
        </div>
      </aside>

      <main className="flex-1 p-10">
        <div className="bg-white rounded-xl shadow p-8 mb-8">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-blue-800 text-2xl font-bold">
              
            </div>
            <div>
              <h2 className="text-2xl font-bold">{profile.name}</h2>
              <p className="text-gray-600">{profile.degree}</p>
              <p className="text-gray-500">{profile.university}</p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-6">
            <div>
              <p className="text-gray-500 text-sm">Email</p>
              <p className="font-medium">{profile.email}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Phone</p>
              <p className="font-medium">{profile.phone}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Location</p>
              <p className="font-medium">{profile.location}</p>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="font-semibold text-lg mb-2">About</h3>
            {editing ? (
              <textarea value={profile.about || ''} onChange={e => setProfile({...profile, about: e.target.value})} className="w-full p-3 border rounded-lg" rows={4} />
            ) : (
              <p className="text-gray-700 leading-relaxed">{profile.about}</p>
            )}
          </div>

          <div className="mt-6">
            <h3 className="font-semibold text-lg mb-2">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {editing ? (
                <textarea value={Array.isArray(profile.skills) ? profile.skills.join(', ') : (profile.skills || '')} onChange={e => setProfile({...profile, skills: e.target.value})} className="w-full p-3 border rounded-lg" rows={2} />
              ) : (
                (profile.skills || []).map((skill, idx) => (
                  <span key={idx} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">{skill}</span>
                ))
              )}
            </div>
          </div>

          {/* Additional profile fields */}
          {editing && (
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="text-sm">Phone</label>
                <input value={profile.phone || ''} onChange={e => setProfile({...profile, phone: e.target.value})} className="w-full p-2 border rounded mt-1" />
              </div>
              <div>
                <label className="text-sm">Location</label>
                <input value={profile.location || ''} onChange={e => setProfile({...profile, location: e.target.value})} className="w-full p-2 border rounded mt-1" />
              </div>
              <div>
                <label className="text-sm">University</label>
                <input value={profile.university || ''} onChange={e => setProfile({...profile, university: e.target.value})} className="w-full p-2 border rounded mt-1" />
              </div>
              <div>
                <label className="text-sm">Degree</label>
                <input value={profile.degree || ''} onChange={e => setProfile({...profile, degree: e.target.value})} className="w-full p-2 border rounded mt-1" />
              </div>
            </div>
          )}

          <div className="mt-6">
            <h3 className="font-semibold text-lg mb-2">My Applications</h3>
            <div className="space-y-3">
              {applications.length === 0 && <p className="text-sm text-gray-500">You haven't applied to any internships yet.</p>}
              {applications.map((app) => (
                <div key={app._id} className="p-4 border rounded-lg bg-gray-50 flex justify-between items-center">
                  <div>
                    <p className="font-medium">{app.internship?.title || 'Unknown'}</p>
                    <p className="text-sm text-gray-500">{app.internship?.company || ''}</p>
                  </div>
                  <div className="text-sm">
                    <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-800">{app.status}</span>
                  </div>
                </div>
              ))}
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

            <label
              htmlFor="resume-upload"
              className="bg-gray-200 text-gray-700 px-5 py-2 rounded-lg hover:bg-gray-300 cursor-pointer"
            >
              {resume ? "Re-upload Resume" : "Upload Resume"}
            </label>
            <input
              id="resume-upload"
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={handleResumeUpload}
            />

            {resume && (
              <div className="mt-4 p-4 bg-gray-50 border rounded-lg flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-800">{resume.name}</p>
                  <p className="text-sm text-gray-500">{(resume.size / 1024).toFixed(1)} KB</p>
                </div>
                <a
                  href={URL.createObjectURL(resume)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-600 text-white px-4 py-1 rounded-md hover:bg-blue-700 text-sm"
                >
                  View Resume
                </a>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentProfile;
