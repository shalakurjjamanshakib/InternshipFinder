
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import api from "../api";

const HomePage = () => {
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const list = await api.get('/internships');
        if (!mounted) return;
        setInternships(list || []);
      } catch (err) {
        console.error('Failed to load internships', err);
        setInternships([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  const internshipsCount = internships.length;
  const companyCounts = internships.reduce((acc, it) => {
    const name = it.postedBy?.name || it.company || 'Unknown';
    acc[name] = (acc[name] || 0) + 1;
    return acc;
  }, {});
  const uniqueCompaniesCount = Object.keys(companyCounts).length;
  const activeUsersNow = Object.keys(companyCounts).length; 
  const topCompanies = Object.entries(companyCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <section className="flex flex-col items-center justify-center flex-grow text-center px-6 py-20 bg-gradient-to-b from-white to-gray-50">
        <h1 className="text-5xl font-bold text-gray-900 mb-2">
          Find Your Dream Internship
        </h1>
        <p className="text-gray-600 mt-4 max-w-2xl">
         Connect skilled students with great companies. Start your journey today — your perfect opportunity is just one click away!
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <Link
            to="/find-internship"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg text-lg font-medium hover:bg-blue-700 transition"
          >
            Find Internships
          </Link>
          {(() => {
            const user = api.getUser();
            if (!user) return (
              <Link
                to="/post-internship"
                className="border border-gray-300 px-6 py-3 rounded-lg text-lg font-medium text-gray-700 hover:bg-gray-100 transition"
              >
                Post an Internship
              </Link>
            );
            if (user.role === 'employer') return (
              <Link
                to="/post-internship"
                className="border border-gray-300 px-6 py-3 rounded-lg text-lg font-medium text-gray-700 hover:bg-gray-100 transition"
              >
                Post an Internship
              </Link>
            );
            return null; 
          })()}
        </div>


        <div className="mt-16 flex flex-col sm:flex-row justify-center gap-12 text-center">
          <div className="bg-white shadow-md rounded-lg p-6 w-56">
            <p className="text-4xl font-bold text-blue-600">{loading ? '—' : activeUsersNow}</p>
            <p className="text-gray-500 mt-2">Active Users Now</p>
          </div>

          <div className="bg-white shadow-md rounded-lg p-6 w-56">
            <p className="text-4xl font-bold text-purple-600">{loading ? '—' : uniqueCompaniesCount}</p>
            <p className="text-gray-500 mt-2">Companies</p>
          </div>

          <div className="bg-white shadow-md rounded-lg p-6 w-56">
            <p className="text-4xl font-bold text-green-600">{loading ? '—' : internshipsCount}</p>
            <p className="text-gray-500 mt-2">Internships Posted</p>
          </div>
        </div>

    

      </section>

      <Footer />
    </div>
  );
};

export default HomePage;
