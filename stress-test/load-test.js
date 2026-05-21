/**
 * IqraQuest — k6 Stress & Load Test Script (v2)
 * ===============================================
 * Simulates concurrent Student, Teacher, and Guardian user journeys.
 *
 * Usage:
 *   k6 run stress-test/load-test.js                                          # smoke (10 VUs, 1m, localhost:8000)
 *   k6 run --env VUS=5 --env DURATION=30s stress-test/load-test.js           # 5 VUs, 30s
 *   k6 run --env TARGET=https://staging.iqraquest.com --env VUS=50 stress-test/load-test.js
 *   k6 run --env DEBUG=true --env VUS=2 --env DURATION=15s stress-test/load-test.js   # verbose logging
 *   k6 run --env VUS=500 --env RAMP=true stress-test/load-test.js            # gradual ramp-up
 */

import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Rate, Counter, Trend } from 'k6/metrics';
import { SharedArray } from 'k6/data';

// ─── Custom Metrics ───────────────────────────────────────────────────────────
const loginSuccess   = new Rate('login_success');
const pageErrors     = new Counter('page_errors');
const loginDuration  = new Trend('login_duration', true);
const dashboardLoad  = new Trend('dashboard_load_time', true);

// ─── Load Test Users from JSON ────────────────────────────────────────────────
const users = new SharedArray('users', function () {
    return [JSON.parse(open('./users.json'))];
});
const allUsers = users[0];

// ─── Configuration ────────────────────────────────────────────────────────────
const BASE_URL = __ENV.TARGET   || 'http://127.0.0.1:8000';
const VUS      = parseInt(__ENV.VUS || '10');
const DURATION = __ENV.DURATION || '1m';
const DEBUG    = __ENV.DEBUG === 'true';

// ─── Scenarios ────────────────────────────────────────────────────────────────
// Weighted: 40% students, 30% teachers, 30% guardians
export const options = {
    scenarios: {
        students: {
            executor:  'constant-vus',
            vus:       Math.max(1, Math.round(VUS * 0.4)),
            duration:  DURATION,
            exec:      'studentJourney',
            tags:      { role: 'student' },
        },
        teachers: {
            executor:  'constant-vus',
            vus:       Math.max(1, Math.round(VUS * 0.3)),
            duration:  DURATION,
            exec:      'teacherJourney',
            tags:      { role: 'teacher' },
        },
        guardians: {
            executor:  'constant-vus',
            vus:       Math.max(1, Math.round(VUS * 0.3)),
            duration:  DURATION,
            exec:      'guardianJourney',
            tags:      { role: 'guardian' },
        },
    },
    thresholds: {
        http_req_duration:  ['p(95)<8000'],       // 95% under 8s (relaxed for dev servers)
        http_req_failed:    ['rate<0.15'],         // less than 15% HTTP errors
        login_success:      ['rate>0.80'],         // 80%+ login success
    },
};

// ─── Override: Ramp-Up Mode ───────────────────────────────────────────────────
if (__ENV.RAMP === 'true') {
    delete options.scenarios;
    options.stages = [
        { duration: '30s', target: Math.round(VUS * 0.1) },
        { duration: '1m',  target: Math.round(VUS * 0.5) },
        { duration: '2m',  target: VUS },
        { duration: '2m',  target: VUS },
        { duration: '30s', target: 0 },
    ];
}

// ─── Pre-flight: setup() runs once before all VUs ─────────────────────────────
export function setup() {
    console.log(`\n🎯 Target: ${BASE_URL}`);
    console.log(`👥 VUs: ${VUS}  |  Duration: ${DURATION}  |  Debug: ${DEBUG}`);
    console.log(`📦 Users loaded: ${allUsers.students.length} students, ${allUsers.teachers.length} teachers, ${allUsers.guardians.length} guardians\n`);

    // Pre-flight: hit homepage to verify connectivity
    const homeRes = http.get(`${BASE_URL}/home`, {
        redirects: 5,
        timeout: '15s',
    });
    console.log(`🏠 Homepage: HTTP ${homeRes.status} (${homeRes.timings.duration.toFixed(0)}ms)`);
    if (homeRes.status !== 200) {
        console.log(`⚠️  Homepage returned ${homeRes.status}. Body preview: ${homeRes.body.substring(0, 300)}`);
    }

    // Pre-flight: test a single student login
    const testUser = allUsers.students[0];
    console.log(`\n🔐 Pre-flight login test: ${testUser.email}`);

    const loginPageRes = http.get(`${BASE_URL}/login`, { redirects: 5, timeout: '15s' });
    console.log(`   GET /login → HTTP ${loginPageRes.status} (${loginPageRes.timings.duration.toFixed(0)}ms)`);

    if (loginPageRes.status === 200) {
        // Extract CSRF token
        const jar = http.cookieJar();
        const xsrfCookies = jar.cookiesForURL(BASE_URL)['XSRF-TOKEN'];
        const xsrfToken = xsrfCookies ? decodeURIComponent(xsrfCookies[0]) : '';

        let csrfToken = '';
        const metaMatch = loginPageRes.body.match(/<meta\s+name="csrf-token"\s+content="([^"]+)"/);
        if (metaMatch) csrfToken = metaMatch[1];
        if (!csrfToken) {
            const inputMatch = loginPageRes.body.match(/name="_token"\s+value="([^"]+)"/);
            if (inputMatch) csrfToken = inputMatch[1];
        }

        console.log(`   CSRF token found: ${csrfToken ? 'YES (' + csrfToken.substring(0, 12) + '...)' : 'NO'}`);
        console.log(`   XSRF cookie found: ${xsrfToken ? 'YES' : 'NO'}`);

        const loginRes = http.post(`${BASE_URL}/login`, {
            email: testUser.email,
            password: testUser.password,
            _token: csrfToken,
        }, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-XSRF-TOKEN': xsrfToken,
                'Accept': 'text/html,application/xhtml+xml',
            },
            redirects: 5,
            timeout: '15s',
        });

        const loginOk = loginRes.status === 200 && !loginRes.url.includes('/login');
        console.log(`   POST /login → HTTP ${loginRes.status} → final URL: ${loginRes.url}`);
        console.log(`   Login result: ${loginOk ? '✅ SUCCESS' : '❌ FAILED'}`);

        if (!loginOk) {
            console.log(`   Response body preview: ${loginRes.body.substring(0, 500)}`);
            console.log(`\n⛔ Pre-flight login failed. Possible causes:`);
            console.log(`   1. Test users don't exist on this server (run the seeder on staging)`);
            console.log(`   2. CSRF/session config differs from local`);
            console.log(`   3. Middleware is blocking (IP blocker, rate limiter)`);
            console.log(`   The test will still run, but expect high failure rates.\n`);
        }

        // Logout to clean up the setup session
        http.post(`${BASE_URL}/logout`, null, {
            headers: { 'X-XSRF-TOKEN': xsrfToken },
            redirects: 5,
        });
    } else {
        console.log(`⛔ Cannot reach login page (HTTP ${loginPageRes.status}). Check the TARGET URL.\n`);
    }

    return { baseUrl: BASE_URL };
}

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

function pickUser(role) {
    const pool = allUsers[role + 's'];
    return pool[Math.floor(Math.random() * pool.length)];
}

function dbg(msg) {
    if (DEBUG) console.log(`  [VU ${__VU}] ${msg}`);
}

/**
 * Laravel session login with CSRF handling.
 * Returns { ok, headers } or { ok: false } on failure.
 */
function laravelLogin(email, password) {
    const jar = http.cookieJar();

    // 1. GET /login → obtain session + XSRF cookie + CSRF meta/input token
    const loginPage = http.get(`${BASE_URL}/login`, {
        redirects: 5,
        tags: { name: 'GET /login' },
    });

    dbg(`GET /login → ${loginPage.status} (${loginPage.timings.duration.toFixed(0)}ms)`);

    if (loginPage.status !== 200) {
        dbg(`Login page failed: HTTP ${loginPage.status}`);
        loginSuccess.add(false);
        pageErrors.add(1);
        return { ok: false };
    }

    // Extract XSRF-TOKEN cookie (URL-encoded by Laravel)
    const xsrfCookies = jar.cookiesForURL(BASE_URL)['XSRF-TOKEN'];
    const xsrfToken = xsrfCookies && xsrfCookies.length > 0
        ? decodeURIComponent(xsrfCookies[0])
        : '';

    // Extract _token from HTML (meta tag or hidden input)
    let csrfToken = '';
    const metaMatch = loginPage.body.match(/<meta\s+name="csrf-token"\s+content="([^"]+)"/);
    if (metaMatch) {
        csrfToken = metaMatch[1];
    } else {
        const inputMatch = loginPage.body.match(/name="_token"\s+value="([^"]+)"/);
        if (inputMatch) csrfToken = inputMatch[1];
    }

    if (!csrfToken && !xsrfToken) {
        dbg('⚠️ No CSRF token found — login will likely fail with 419');
        loginSuccess.add(false);
        pageErrors.add(1);
        return { ok: false };
    }

    // 2. POST /login
    const loginRes = http.post(
        `${BASE_URL}/login`,
        { email, password, _token: csrfToken },
        {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-XSRF-TOKEN': xsrfToken,
                'Accept': 'text/html,application/xhtml+xml',
            },
            redirects: 5,
            tags: { name: 'POST /login' },
        }
    );

    loginDuration.add(loginRes.timings.duration);

    // Success = landed on a dashboard page (not back on /login)
    const finalUrl = loginRes.url || '';
    const isOnLogin = finalUrl.includes('/login') || finalUrl.endsWith('/');
    const success = loginRes.status === 200 && !isOnLogin;

    loginSuccess.add(success);
    dbg(`POST /login → ${loginRes.status} → ${finalUrl} → ${success ? '✅' : '❌'}`);

    if (!success) {
        pageErrors.add(1);
        if (DEBUG) {
            const snippet = (loginRes.body || '').substring(0, 200);
            dbg(`Response preview: ${snippet}`);
        }
        return { ok: false };
    }

    // Build headers for subsequent requests (cookies are auto-managed by k6 per-VU)
    const updatedXsrf = jar.cookiesForURL(BASE_URL)['XSRF-TOKEN'];
    const authHeaders = {
        'X-XSRF-TOKEN': updatedXsrf ? decodeURIComponent(updatedXsrf[0]) : xsrfToken,
        'Accept': 'text/html,application/xhtml+xml,application/json',
    };

    return { ok: true, headers: authHeaders };
}

/**
 * Authenticated GET with error tracking and debug logging.
 */
function authGet(url, headers, tagName) {
    const res = http.get(url, {
        headers,
        redirects: 5,
        tags: { name: tagName },
    });

    const ok = res.status === 200;
    if (!ok) pageErrors.add(1);

    check(res, { [`${tagName} → 200`]: (r) => r.status === 200 });
    dbg(`${tagName} → ${res.status} (${res.timings.duration.toFixed(0)}ms)`);

    return res;
}

/**
 * Random think-time between actions.
 */
function think(min, max) {
    sleep(Math.random() * (max - min) + min);
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCENARIO: STUDENT JOURNEY
// ═══════════════════════════════════════════════════════════════════════════════

export function studentJourney() {
    const user = pickUser('student');
    dbg(`Student journey start: ${user.email}`);

    group('Student Journey', function () {
        // 1. Homepage (public)
        group('Homepage', function () {
            const res = http.get(`${BASE_URL}/home`, { tags: { name: 'GET /home' } });
            check(res, { 'homepage loaded': (r) => r.status === 200 });
            dbg(`GET /home → ${res.status}`);
        });
        think(1, 2);

        // 2. Browse teachers API (public)
        group('Browse Teachers API', function () {
            authGet(`${BASE_URL}/api/teachers`, {}, 'GET /api/teachers');
            think(0.5, 1);
            authGet(`${BASE_URL}/api/subjects`, {}, 'GET /api/subjects');
        });
        think(1, 2);

        // 3. Login
        const session = laravelLogin(user.email, user.password);
        if (!session.ok) { think(1, 2); return; }
        think(1, 2);

        // 4. Dashboard
        group('Dashboard', function () {
            const res = authGet(`${BASE_URL}/student/dashboard`, session.headers, 'GET /student/dashboard');
            dashboardLoad.add(res.timings.duration);
        });
        think(1, 3);

        // 5. Teachers list
        group('Teachers', function () {
            authGet(`${BASE_URL}/student/teachers`, session.headers, 'GET /student/teachers');
        });
        think(1, 2);

        // 6. Bookings
        group('Bookings', function () {
            authGet(`${BASE_URL}/student/bookings`, session.headers, 'GET /student/bookings');
        });
        think(1, 2);

        // 7. Wallet
        group('Wallet', function () {
            authGet(`${BASE_URL}/student/wallet`, session.headers, 'GET /student/wallet');
        });
        think(1, 2);

        // 8. Notifications
        group('Notifications', function () {
            authGet(`${BASE_URL}/student/notifications`, session.headers, 'GET /student/notifications');
        });
        think(0.5, 1);

        // 9. Profile
        group('Profile', function () {
            authGet(`${BASE_URL}/student/profile`, session.headers, 'GET /student/profile');
        });
        think(1, 2);

        // 10. Logout
        group('Logout', function () {
            http.post(`${BASE_URL}/logout`, null, {
                headers: session.headers,
                redirects: 5,
                tags: { name: 'POST /logout' },
            });
        });
    });
    think(1, 2);
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCENARIO: TEACHER JOURNEY
// ═══════════════════════════════════════════════════════════════════════════════

export function teacherJourney() {
    const user = pickUser('teacher');
    dbg(`Teacher journey start: ${user.email}`);

    group('Teacher Journey', function () {
        // 1. Homepage
        group('Homepage', function () {
            const res = http.get(`${BASE_URL}/home`, { tags: { name: 'GET /home' } });
            check(res, { 'homepage loaded': (r) => r.status === 200 });
        });
        think(1, 2);

        // 2. Login
        const session = laravelLogin(user.email, user.password);
        if (!session.ok) { think(1, 2); return; }
        think(1, 2);

        // 3. Dashboard
        group('Dashboard', function () {
            const res = authGet(`${BASE_URL}/teacher/dashboard`, session.headers, 'GET /teacher/dashboard');
            dashboardLoad.add(res.timings.duration);
        });
        think(1, 3);

        // 4. Booking Requests
        group('Requests', function () {
            authGet(`${BASE_URL}/teacher/requests`, session.headers, 'GET /teacher/requests');
        });
        think(1, 2);

        // 5. My Bookings
        group('Bookings', function () {
            authGet(`${BASE_URL}/teacher/bookings`, session.headers, 'GET /teacher/bookings');
        });
        think(1, 2);

        // 6. Schedule
        group('Schedule', function () {
            authGet(`${BASE_URL}/teacher/schedule`, session.headers, 'GET /teacher/schedule');
        });
        think(1, 2);

        // 7. Earnings
        group('Earnings', function () {
            authGet(`${BASE_URL}/teacher/earnings`, session.headers, 'GET /teacher/earnings');
        });
        think(1, 2);

        // 8. Wallet
        group('Wallet', function () {
            authGet(`${BASE_URL}/teacher/wallet`, session.headers, 'GET /teacher/wallet');
        });
        think(0.5, 1);

        // 9. Notifications
        group('Notifications', function () {
            authGet(`${BASE_URL}/teacher/notifications`, session.headers, 'GET /teacher/notifications');
        });
        think(0.5, 1);

        // 10. Profile
        group('Profile', function () {
            authGet(`${BASE_URL}/teacher/profile`, session.headers, 'GET /teacher/profile');
        });
        think(1, 2);

        // 11. Logout
        group('Logout', function () {
            http.post(`${BASE_URL}/logout`, null, {
                headers: session.headers,
                redirects: 5,
                tags: { name: 'POST /logout' },
            });
        });
    });
    think(1, 2);
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCENARIO: GUARDIAN JOURNEY
// ═══════════════════════════════════════════════════════════════════════════════

export function guardianJourney() {
    const user = pickUser('guardian');
    dbg(`Guardian journey start: ${user.email}`);

    group('Guardian Journey', function () {
        // 1. Homepage
        group('Homepage', function () {
            const res = http.get(`${BASE_URL}/home`, { tags: { name: 'GET /home' } });
            check(res, { 'homepage loaded': (r) => r.status === 200 });
        });
        think(1, 2);

        // 2. Login
        const session = laravelLogin(user.email, user.password);
        if (!session.ok) { think(1, 2); return; }
        think(1, 2);

        // 3. Dashboard
        group('Dashboard', function () {
            const res = authGet(`${BASE_URL}/guardian/dashboard`, session.headers, 'GET /guardian/dashboard');
            dashboardLoad.add(res.timings.duration);
        });
        think(1, 3);

        // 4. Children
        group('Children', function () {
            authGet(`${BASE_URL}/guardian/children`, session.headers, 'GET /guardian/children');
        });
        think(1, 2);

        // 5. Browse Teachers
        group('Teachers', function () {
            authGet(`${BASE_URL}/guardian/teachers`, session.headers, 'GET /guardian/teachers');
        });
        think(1, 2);

        // 6. Bookings
        group('Bookings', function () {
            authGet(`${BASE_URL}/guardian/bookings`, session.headers, 'GET /guardian/bookings');
        });
        think(1, 2);

        // 7. Wallet
        group('Wallet', function () {
            authGet(`${BASE_URL}/guardian/wallet`, session.headers, 'GET /guardian/wallet');
        });
        think(1, 2);

        // 8. Notifications
        group('Notifications', function () {
            authGet(`${BASE_URL}/guardian/notifications`, session.headers, 'GET /guardian/notifications');
        });
        think(0.5, 1);

        // 9. Profile
        group('Profile', function () {
            authGet(`${BASE_URL}/guardian/profile`, session.headers, 'GET /guardian/profile');
        });
        think(1, 2);

        // 10. Logout
        group('Logout', function () {
            http.post(`${BASE_URL}/logout`, null, {
                headers: session.headers,
                redirects: 5,
                tags: { name: 'POST /logout' },
            });
        });
    });
    think(1, 2);
}

// ═══════════════════════════════════════════════════════════════════════════════
// DEFAULT (used in RAMP mode)
// ═══════════════════════════════════════════════════════════════════════════════

export default function () {
    const roll = Math.random();
    if (roll < 0.4) {
        studentJourney();
    } else if (roll < 0.7) {
        teacherJourney();
    } else {
        guardianJourney();
    }
}
