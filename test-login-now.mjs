// Test login endpoint directly
async function testLogin() {
  try {
    // First get CSRF token
    const csrfRes = await fetch('http://localhost:3000/api/auth/csrf');
    const csrfData = await csrfRes.json();
    console.log('CSRF Token:', csrfData.csrfToken);

    // Now try login
    const res = await fetch('http://localhost:3000/api/auth/callback/credentials', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        email: 'jaimegomez@kimsa.io',
        password: 'ChangeMe123!',
        csrfToken: csrfData.csrfToken,
        json: 'true',
      }),
      redirect: 'manual',
    });

    console.log('Status:', res.status);
    console.log('Headers:', Object.fromEntries(res.headers.entries()));
    
    const text = await res.text();
    console.log('Body:', text);

    if (res.status === 200) {
      const data = JSON.parse(text);
      console.log('Login result:', data);
      if (data.url) {
        console.log('\n✅ LOGIN EXITOSO - Redirige a:', data.url);
      } else if (data.error) {
        console.log('\n❌ LOGIN FALLIDO - Error:', data.error);
      }
    }
  } catch (err) {
    console.error('Error:', err);
  }
}

testLogin();
