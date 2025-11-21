import fetch from 'node-fetch';

async function run() {
  try {
    console.log('Registering user...');
    let r = await fetch('http://localhost:5000/api/auth/register', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name: 'Smoke User', email: 'smoke@test.local', password: 'Password1!', role: 'employer' }) });
    console.log('register status', r.status, await r.text());

    console.log('Logging in...');
    r = await fetch('http://localhost:5000/api/auth/login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: 'smoke@test.local', password: 'Password1!' }) });
    const login = await r.json();
    console.log('login status', r.status, login);
    const token = login.token;

    console.log('Posting internship...');
    r = await fetch('http://localhost:5000/api/internships', { method: 'POST', headers: { 'content-type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ title: 'Smoke Intern', company: 'ACME', location: 'Dhaka', description: 'Smoke test', requirements: ['js'], mode: 'Remote' }) });
    console.log('post status', r.status, await r.text());

    console.log('Fetching my internships...');
    r = await fetch('http://localhost:5000/api/internships/my/list', { headers: { Authorization: `Bearer ${token}` } });
    console.log('list status', r.status, await r.text());
  } catch (err) {
    console.error(err);
  }
}

run();
