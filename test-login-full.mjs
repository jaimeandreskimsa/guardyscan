// Test login flow completo con cookies
async function testLogin() {
  const cookies = new Map();
  
  function parseCookies(res) {
    const setCookie = res.headers.getSetCookie?.() || [];
    for (const c of setCookie) {
      const [nameVal] = c.split(';');
      const [name, val] = nameVal.split('=');
      cookies.set(name.trim(), val.trim());
    }
  }
  
  function cookieHeader() {
    return Array.from(cookies.entries()).map(([k,v]) => `${k}=${v}`).join('; ');
  }

  try {
    // Step 1: Get CSRF token + session cookie
    console.log('--- Step 1: Get CSRF token ---');
    const csrfRes = await fetch('http://localhost:3000/api/auth/csrf');
    parseCookies(csrfRes);
    const { csrfToken } = await csrfRes.json();
    console.log('CSRF:', csrfToken);
    console.log('Cookies:', Object.fromEntries(cookies));

    // Step 2: Login with credentials
    console.log('\n--- Step 2: Login ---');
    const loginRes = await fetch('http://localhost:3000/api/auth/callback/credentials', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': cookieHeader(),
      },
      body: new URLSearchParams({
        email: 'jaimegomez@kimsa.io',
        password: 'ChangeMe123!',
        csrfToken: csrfToken,
        json: 'true',
      }),
      redirect: 'manual',
    });
    
    parseCookies(loginRes);
    console.log('Status:', loginRes.status);
    console.log('Cookies after login:', Object.fromEntries(cookies));
    
    const body = await loginRes.text();
    console.log('Body:', body);

    // Step 3: Check session
    console.log('\n--- Step 3: Check session ---');
    const sessionRes = await fetch('http://localhost:3000/api/auth/session', {
      headers: { 'Cookie': cookieHeader() },
    });
    const session = await sessionRes.json();
    console.log('Session:', JSON.stringify(session, null, 2));

    if (session?.user?.email) {
      console.log('\n✅ LOGIN FUNCIONA CORRECTAMENTE');
      console.log('Usuario:', session.user.email);
      console.log('Rol:', session.user.role);
    } else {
      console.log('\n❌ LOGIN NO CREA SESION');
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
}

testLogin();
