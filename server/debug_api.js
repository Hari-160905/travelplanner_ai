import http from 'http';

const doReq = (opts, payload) => new Promise((resolve, reject) => {
  const req = http.request(opts, (res) => {
    let body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => resolve({ statusCode: res.statusCode, body }));
  });
  req.on('error', reject);
  if (payload) req.write(payload);
  req.end();
});

const main = async () => {
  try {
    const loginPayload = JSON.stringify({ email: 'test@example.com', password: 'password123' });
    const login = await doReq({ host: 'localhost', port: 5000, path: '/api/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(loginPayload) } }, loginPayload);
    console.log('login', login.statusCode, login.body);
    const token = JSON.parse(login.body).token;
    const calls = [
      { path: '/api/trips', method: 'GET' },
      { path: '/api/expenses', method: 'GET' },
      { path: '/api/expenses/summary', method: 'GET' }
    ];
    for (const call of calls) {
      const res = await doReq({ host: 'localhost', port: 5000, path: call.path, method: call.method, headers: { Authorization: `Bearer ${token}` } });
      console.log(call.path, res.statusCode, res.body);
    }
    const createTripPayload = JSON.stringify({ title: 'Debug Trip', destination: 'Berlin', startDate: '2026-08-01', endDate: '2026-08-05', budget: 1234, notes: 'debug' });
    const tripRes = await doReq({ host: 'localhost', port: 5000, path: '/api/trips', method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(createTripPayload), Authorization: `Bearer ${token}` } }, createTripPayload);
    console.log('create trip', tripRes.statusCode, tripRes.body);
    const createExpensePayload = JSON.stringify({ category: 'Food', amount: 25.5, currency: 'USD', description: 'Debug lunch', spentAt: '2026-08-02' });
    const expenseRes = await doReq({ host: 'localhost', port: 5000, path: '/api/expenses', method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(createExpensePayload), Authorization: `Bearer ${token}` } }, createExpensePayload);
    console.log('create expense', expenseRes.statusCode, expenseRes.body);
  } catch (err) {
    console.error('error', err.message, err.stack);
  }
};

main();
