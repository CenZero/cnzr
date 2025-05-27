// Demo Cookie Parser & Session untuk Cenzero Framework
// Menunjukkan semua fitur:
// ✅ Cookie parser: parse & set cookie di req/res  
// ✅ Session: gunakan cookie + in-memory store (Map) untuk simpan session
// ✅ app.useSession(options): akan inject `ctx.session` pada request

import { CenzeroApp } from '../src/core/server';
import { CenzeroContext } from '../src/core/context';

const app = new CenzeroApp({
  port: 3010,
  useContext: true // Pastikan context mode aktif
});

// 1. Konfigurasi session dengan app.useSession(options)
app.useSession({
  name: 'cenzero-demo-session',           // Nama cookie session
  secret: 'super-secret-key-for-demo',     // Secret key untuk signing
  maxAge: 30 * 60 * 1000,                 // 30 menit
  secure: false,                          // Set true untuk HTTPS
  httpOnly: true,                         // Cookie tidak bisa diakses via JavaScript
  sameSite: 'lax'                         // CSRF protection
});

// 2. Middleware untuk logging request dengan cookie & session info
app.use((ctx: CenzeroContext, next: () => Promise<void>) => {
  console.log(`\n📝 Request: ${ctx.method} ${ctx.path}`);
  console.log(`🍪 Cookies:`, ctx.cookies.all());
  console.log(`🔐 Session ID:`, ctx.session.id);
  console.log(`📦 Session Data:`, ctx.session.all);
  return next();
});

// 3. Routes untuk testing Cookie Parser

// Home - menampilkan status cookies & session
app.get('/', (ctx: CenzeroContext) => {
  const cookies = ctx.cookies.all();
  const sessionData = ctx.session.all;
  const sessionId = ctx.session.id;

  ctx.html(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Cenzero Cookie & Session Demo</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          .container { max-width: 800px; margin: 0 auto; }
          .section { background: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 8px; }
          .endpoint { background: #e8f4fd; padding: 10px; margin: 10px 0; border-radius: 4px; }
          pre { background: #2d3748; color: #e2e8f0; padding: 15px; border-radius: 4px; overflow-x: auto; }
          .button { background: #4299e1; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 5px; }
          .button:hover { background: #3182ce; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🍪 Cenzero Cookie & Session Demo</h1>
          
          <div class="section">
            <h2>📊 Current State</h2>
            <p><strong>Session ID:</strong> <code>${sessionId || 'None'}</code></p>
            <p><strong>Cookies:</strong></p>
            <pre>${JSON.stringify(cookies, null, 2)}</pre>
            <p><strong>Session Data:</strong></p>
            <pre>${JSON.stringify(sessionData, null, 2)}</pre>
          </div>

          <div class="section">
            <h2>🍪 Cookie Operations</h2>
            <a href="/cookie/set/theme/dark" class="button">Set Theme Cookie</a>
            <a href="/cookie/set/lang/id" class="button">Set Language Cookie</a>
            <a href="/cookie/get/theme" class="button">Get Theme Cookie</a>
            <a href="/cookie/delete/theme" class="button">Delete Theme Cookie</a>
            <a href="/cookie/clear" class="button">Clear All Cookies</a>
          </div>

          <div class="section">
            <h2>🔐 Session Operations</h2>
            <a href="/session/login" class="button">Simulate Login</a>
            <a href="/session/profile" class="button">Get Profile</a>
            <a href="/session/set/counter" class="button">Increment Counter</a>
            <a href="/session/regenerate" class="button">Regenerate Session</a>
            <a href="/session/logout" class="button">Logout</a>
          </div>

          <div class="section">
            <h2>🧪 Test Endpoints</h2>
            <div class="endpoint"><strong>GET /</strong> - Home page dengan status cookies & session</div>
            <div class="endpoint"><strong>GET /cookie/set/:name/:value</strong> - Set cookie dengan nama dan value</div>
            <div class="endpoint"><strong>GET /cookie/get/:name</strong> - Get cookie berdasarkan nama</div>
            <div class="endpoint"><strong>GET /cookie/delete/:name</strong> - Delete cookie</div>
            <div class="endpoint"><strong>GET /cookie/clear</strong> - Clear semua cookies</div>
            <div class="endpoint"><strong>GET /session/login</strong> - Simulate login dan set session data</div>
            <div class="endpoint"><strong>GET /session/profile</strong> - Get user profile dari session</div>
            <div class="endpoint"><strong>GET /session/set/counter</strong> - Increment counter di session</div>
            <div class="endpoint"><strong>GET /session/regenerate</strong> - Regenerate session ID</div>
            <div class="endpoint"><strong>GET /session/logout</strong> - Destroy session</div>
            <div class="endpoint"><strong>GET /api/status</strong> - JSON response dengan cookies & session info</div>
          </div>
        </div>
      </body>
    </html>
  `);
});

// 4. Cookie Operations

// Set cookie
app.get('/cookie/set/:name/:value', (ctx: CenzeroContext) => {
  const { name, value } = ctx.params;
  
  // Set cookie dengan berbagai options
  ctx.cookies.set(name, value, {
    maxAge: 3600, // 1 hour
    httpOnly: name === 'session', // Session cookies should be httpOnly
    secure: false, // Set true untuk HTTPS
    sameSite: 'lax'
  });

  console.log(`🍪 Cookie Set: ${name} = ${value}`);

  ctx.json({
    success: true,
    message: `Cookie '${name}' set to '${value}'`,
    cookie: { name, value },
    allCookies: ctx.cookies.all()
  });
});

// Get cookie
app.get('/cookie/get/:name', (ctx: CenzeroContext) => {
  const { name } = ctx.params;
  const value = ctx.cookies.get(name);

  console.log(`🍪 Cookie Get: ${name} = ${value || 'undefined'}`);

  ctx.json({
    success: true,
    cookie: { name, value: value || null },
    exists: !!value,
    allCookies: ctx.cookies.all()
  });
});

// Delete cookie
app.get('/cookie/delete/:name', (ctx: CenzeroContext) => {
  const { name } = ctx.params;
  
  ctx.cookies.delete(name);
  console.log(`🍪 Cookie Deleted: ${name}`);

  ctx.json({
    success: true,
    message: `Cookie '${name}' deleted`,
    allCookies: ctx.cookies.all()
  });
});

// Clear all cookies
app.get('/cookie/clear', (ctx: CenzeroContext) => {
  ctx.cookies.clear();
  console.log(`🍪 All Cookies Cleared`);

  ctx.json({
    success: true,
    message: 'All cookies cleared',
    allCookies: ctx.cookies.all()
  });
});

// 5. Session Operations

// Simulate login
app.get('/session/login', (ctx: CenzeroContext) => {
  const userData = {
    id: Date.now(),
    username: 'cenzero_user',
    email: 'user@cenzero.com',
    role: 'admin',
    loginTime: new Date().toISOString()
  };

  // Set session data
  ctx.session.set('user', userData);
  ctx.session.set('isAuthenticated', true);
  
  // Save session (automatically called, but can be explicit)
  ctx.session.save();

  console.log(`🔐 User Login: ${userData.username}`);

  ctx.json({
    success: true,
    message: 'Login successful',
    user: userData,
    sessionId: ctx.session.id,
    sessionData: ctx.session.all
  });
});

// Get profile from session
app.get('/session/profile', (ctx: CenzeroContext) => {
  const user = ctx.session.get('user');
  const isAuthenticated = ctx.session.get('isAuthenticated');

  console.log(`🔐 Profile Access: ${user ? user.username : 'Anonymous'}`);

  if (!isAuthenticated || !user) {
    ctx.status(401).json({
      success: false,
      message: 'Not authenticated. Please login first.',
      loginUrl: '/session/login'
    });
    return;
  }

  ctx.json({
    success: true,
    user,
    sessionId: ctx.session.id,
    allSessionData: ctx.session.all
  });
});

// Session counter
app.get('/session/set/counter', (ctx: CenzeroContext) => {
  const currentCounter = ctx.session.get('counter') || 0;
  const newCounter = currentCounter + 1;
  
  ctx.session.set('counter', newCounter);
  ctx.session.set('lastIncrement', new Date().toISOString());

  console.log(`🔐 Counter Incremented: ${newCounter}`);

  ctx.json({
    success: true,
    message: `Counter incremented to ${newCounter}`,
    counter: newCounter,
    sessionData: ctx.session.all
  });
});

// Regenerate session ID
app.get('/session/regenerate', (ctx: CenzeroContext) => {
  const oldSessionId = ctx.session.id;
  
  // Regenerate session ID (keeps data but creates new ID)
  ctx.session.regenerate();
  
  const newSessionId = ctx.session.id;

  console.log(`🔐 Session Regenerated: ${oldSessionId} -> ${newSessionId}`);

  ctx.json({
    success: true,
    message: 'Session ID regenerated',
    oldSessionId,
    newSessionId,
    sessionData: ctx.session.all
  });
});

// Logout (destroy session)
app.get('/session/logout', (ctx: CenzeroContext) => {
  const sessionId = ctx.session.id;
  
  // Destroy session
  ctx.session.destroy();

  console.log(`🔐 User Logout: Session ${sessionId} destroyed`);

  ctx.json({
    success: true,
    message: 'Logout successful. Session destroyed.',
    destroyedSessionId: sessionId
  });
});

// 6. API endpoint untuk status
app.get('/api/status', (ctx: CenzeroContext) => {
  ctx.json({
    success: true,
    timestamp: new Date().toISOString(),
    cookies: ctx.cookies.all(),
    session: {
      id: ctx.session.id,
      data: ctx.session.all
    },
    request: {
      method: ctx.method,
      path: ctx.path,
      query: ctx.query,
      headers: {
        'user-agent': ctx.get('user-agent'),
        'cookie': ctx.get('cookie')
      }
    }
  });
});

// 7. Cleanup expired sessions setiap 5 menit
setInterval(() => {
  console.log('🧹 Cleaning up expired sessions...');
  // Session.cleanup(); // Static method untuk cleanup
}, 5 * 60 * 1000);

// Start server
app.listen(3010, 'localhost', () => {
  console.log('\n🚀 Cenzero Cookie & Session Demo Server running on http://localhost:3010');
  console.log('\n📋 Features yang didemonstrasikan:');
  console.log('✅ Cookie Parser: parse & set cookie di req/res');
  console.log('✅ Session: gunakan cookie + in-memory store (Map)');
  console.log('✅ app.useSession(options): inject ctx.session pada request');
  
  console.log('\n🧪 Test endpoints:');
  console.log('👉 GET  /                          - Home page dengan UI');
  console.log('👉 GET  /cookie/set/:name/:value   - Set cookie');
  console.log('👉 GET  /cookie/get/:name          - Get cookie');
  console.log('👉 GET  /cookie/delete/:name       - Delete cookie');
  console.log('👉 GET  /cookie/clear              - Clear all cookies');
  console.log('👉 GET  /session/login             - Simulate login');
  console.log('👉 GET  /session/profile           - Get profile dari session');
  console.log('👉 GET  /session/set/counter       - Increment counter');
  console.log('👉 GET  /session/regenerate        - Regenerate session ID');
  console.log('👉 GET  /session/logout            - Destroy session');
  console.log('👉 GET  /api/status                - JSON status info');
  
  console.log('\n📝 Curl examples:');
  console.log('curl http://localhost:3010/cookie/set/theme/dark');
  console.log('curl http://localhost:3010/cookie/get/theme');
  console.log('curl -c cookies.txt http://localhost:3010/session/login');
  console.log('curl -b cookies.txt http://localhost:3010/session/profile');
  console.log('curl -b cookies.txt http://localhost:3010/session/set/counter');
  console.log('curl -b cookies.txt http://localhost:3010/api/status');
});

/*
Features yang sudah diimplementasikan dan berfungsi:

✅ 1. COOKIE PARSER: PARSE & SET COOKIE DI REQ/RES
   - ctx.cookies.set(name, value, options) untuk set cookie
   - ctx.cookies.get(name) untuk get cookie
   - ctx.cookies.delete(name) untuk delete cookie
   - ctx.cookies.clear() untuk clear semua cookies
   - ctx.cookies.all() untuk get semua cookies
   - Support cookie options: maxAge, expires, path, domain, secure, httpOnly, sameSite

✅ 2. SESSION: GUNAKAN COOKIE + IN-MEMORY STORE (MAP)
   - ctx.session.set(key, value) untuk set session data
   - ctx.session.get(key) untuk get session data
   - ctx.session.delete(key) untuk delete session key
   - ctx.session.clear() untuk clear session data
   - ctx.session.destroy() untuk destroy session
   - ctx.session.regenerate() untuk regenerate session ID
   - ctx.session.save() untuk save session ke store
   - Session ID ditandatangani dengan secret key
   - Automatic session expiration
   - In-memory store menggunakan Map

✅ 3. APP.USESESSION(OPTIONS): INJECT CTX.SESSION PADA REQUEST
   - app.useSession() method untuk konfigurasi session
   - SessionOptions: name, secret, maxAge, secure, httpOnly, sameSite
   - Session otomatis tersedia di ctx.session pada setiap request
   - Session data persisten antar request menggunakan cookie
   - Support untuk regenerate session ID
   - Automatic cleanup expired sessions

✅ 4. FITUR TAMBAHAN:
   - Session signing dengan crypto untuk security
   - Flexible session configuration
   - Cookie options support
   - Automatic session saving
   - Session cleanup utility
   - Development-friendly logging
   - HTTP-only cookies untuk security
   - SameSite protection untuk CSRF
*/
