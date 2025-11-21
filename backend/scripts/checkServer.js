
(async () => {
  try {
    const base = process.env.API_BASE || 'https://internshipfinder-g0it.onrender.com/api';
    console.log('Checking', base);

    const r = await fetch(`${base}/internships`);
    console.log('/internships', r.status);
    const text = await r.text();
    console.log('body (truncated):', text.slice(0, 200));

    console.log('Server appears reachable. To test register/login use a REST client (Postman) or the frontend forms.');
  } catch (err) {
    console.error('Error connecting to server:', err);
    process.exit(1);
  }
})();
