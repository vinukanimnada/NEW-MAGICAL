/* ============================================================
   MAGICAL MOVIE LAND — Account System (Signup / Login / Logout)
   ============================================================
   Meka SITE EKE HAMA PAGE EKAKATAMA add karanna puluwan single
   file ekak. Firebase Authentication (email + password) saha
   Firestore (username uniqueness + user profile) use karanawa.

   ---------------- HOW TO ADD THIS TO A PAGE ----------------
   1. Me file eka "auth.js" widiyata site root ekata danna
      (style.css, script.js thiyena tanama).
   2. Ubath page ekaka </body> tag ekata kalin methana danna:

         <script type="module" src="auth.js"></script>

      Ithuru HTML/CSS ekak danna one na — modal eka saha
      header eke account icon eka methanin JS ekenma auto
      widiyata build karala DOM ekata danawa.
   3. Header eke ".header-right" class eka thiyena div ekakata
      witharak methanata account icon ekak auto-add wenawa
      (anime.html, watch.html wage page walin patan gena e
      class eka already thiyenawa). Ee class eka nathi
      page ekaka nam, <header> tag ekatama button eka append
      wenawa (fallback).

   ---------------- PROFILE PAGE ----------------
   Header eke account icon eken "Profile" select kalama, dan
   full "profile.html" page ekata navigate wenawa (kalinviye
   modal ekema tiny profile view ekakata giya, dan wenas kala —
   My List / Seen List / Shared Links / Comments stats + tabs
   thiyena dedicated page ekak profile.html eke thiyenawa).
   ============================================================ */

import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword,
  signOut, onAuthStateChanged, setPersistence,
  browserLocalPersistence, browserSessionPersistence,
  sendPasswordResetEmail, updateProfile
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  getFirestore, doc, getDoc, setDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCx0TEmgr3GCyvfeok9Y42yR1PTM4_8y9M",
  authDomain: "magical-movie-land.firebaseapp.com",
  projectId: "magical-movie-land",
  storageBucket: "magical-movie-land.firebasestorage.app",
  messagingSenderId: "27757424288",
  appId: "1:27757424288:web:d650e2659f09f0b9c823c5"
};

// Reuse an existing Firebase app instance if a page already initialized
// one (e.g. index.html/movies.html loading movie data), instead of
// throwing a "duplicate app" error.
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

/* =========================================================
   Helpers
   ========================================================= */
function normUsername(u) {
  return (u || '').trim().toLowerCase();
}

// Firestore doc "usernames/{lowerUsername}" -> { email, uid }
// This is what lets us log people in with a username instead of
// an email, since Firebase Auth itself only signs in via email.
async function usernameTaken(username) {
  const snap = await getDoc(doc(db, 'usernames', normUsername(username)));
  return snap.exists();
}

async function emailForUsername(username) {
  const snap = await getDoc(doc(db, 'usernames', normUsername(username)));
  if (!snap.exists()) return null;
  return snap.data().email || null;
}

/* =========================================================
   Inject CSS (scoped, won't clash with site styles)
   ========================================================= */
const style = document.createElement('style');
style.textContent = `
.mml-auth-btn { width:38px; height:38px; min-width:38px; border-radius:8px; background:#ff2d95; color:#fff; cursor:pointer; border:none; flex-shrink:0; margin-left:12px; padding:0; position:relative; }
.mml-auth-btn i { position:absolute !important; top:50% !important; left:50% !important; transform:translate(-50%,-50%) !important; margin:0 !important; padding:0 !important; font-size:16px !important; line-height:1 !important; }
.mml-auth-btn:not(:has(i)) { font-size:15px; font-weight:700; display:flex; align-items:center; justify-content:center; }
.mml-auth-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.85); z-index:5000; display:none; align-items:center; justify-content:center; padding:20px; }
.mml-auth-overlay.active { display:flex; }
.mml-auth-card { background:#111; border:1px solid #222; border-radius:14px; padding:28px 24px; max-width:380px; width:100%; max-height:88vh; overflow-y:auto; position:relative; }
.mml-auth-close { position:absolute; top:14px; right:14px; width:32px; height:32px; border-radius:50%; background:rgba(255,255,255,0.08); color:#fff; display:flex; align-items:center; justify-content:center; cursor:pointer; font-size:16px; }
.mml-auth-title { font-size:20px; font-weight:700; color:#fff; margin-bottom:18px; }
.mml-auth-input { width:100%; background:#0a0a0a; border:1px solid #222; color:#fff; padding:13px 14px; border-radius:8px; font-size:14.5px; margin-bottom:12px; outline:none; }
.mml-auth-input:focus { border-color:#ff2d95; }
.mml-auth-row { display:flex; gap:10px; }
.mml-auth-row .mml-auth-input { flex:1; }
.mml-auth-check { display:flex; align-items:center; gap:8px; font-size:13px; color:#aaa; margin-bottom:16px; }
.mml-auth-check input { width:16px; height:16px; accent-color:#ff2d95; }
.mml-auth-error { color:#ff5b5b; font-size:13px; margin-bottom:10px; min-height:15px; }
.mml-auth-submit { width:100%; background:#ff2d95; color:#fff; border:none; border-radius:8px; padding:13px; font-size:15px; font-weight:700; cursor:pointer; }
.mml-auth-submit:disabled { opacity:0.5; cursor:not-allowed; }
.mml-auth-switch { text-align:center; font-size:13px; color:#888; margin-top:16px; }
.mml-auth-switch a { color:#ff2d95; font-weight:600; cursor:pointer; }
.mml-auth-forgot { text-align:center; font-size:12.5px; color:#ff2d95; margin-top:10px; cursor:pointer; }
.mml-auth-section { display:none; }
.mml-auth-section.active { display:block; }
.mml-auth-menu { position:fixed; z-index:5001; background:#111; border:1px solid #222; border-radius:10px; padding:8px; min-width:180px; box-shadow:0 10px 30px rgba(0,0,0,0.5); display:none; }
.mml-auth-menu.active { display:block; }
.mml-auth-menu-user { padding:10px 12px; font-size:13.5px; font-weight:700; color:#fff; border-bottom:1px solid #222; margin-bottom:6px; }
.mml-auth-menu-item { padding:10px 12px; font-size:14px; color:#ddd; cursor:pointer; border-radius:6px; }
.mml-auth-menu-item:hover { background:#1a1a1a; color:#ff2d95; }
`;
document.head.appendChild(style);

/* =========================================================
   Inject modal HTML (login / signup only — the old in-modal
   profile view/edit sections were removed since Profile now
   navigates to the dedicated profile.html page instead)
   ========================================================= */
const overlay = document.createElement('div');
overlay.className = 'mml-auth-overlay';
overlay.id = 'mmlAuthOverlay';
overlay.innerHTML = `
  <div class="mml-auth-card">
    <div class="mml-auth-close" id="mmlAuthClose"><i class="fa fa-times"></i></div>

    <div class="mml-auth-section active" id="mmlLoginSection">
      <div class="mml-auth-title">Log in</div>
      <div class="mml-auth-error" id="mmlLoginError"></div>
      <input type="text" class="mml-auth-input" id="mmlLoginUsername" placeholder="Username">
      <input type="password" class="mml-auth-input" id="mmlLoginPassword" placeholder="Password">
      <label class="mml-auth-check"><input type="checkbox" id="mmlLoginStay" checked> Stay logged in</label>
      <button class="mml-auth-submit" id="mmlLoginBtn"><i class="fa fa-sign-in-alt"></i> Sign in</button>
      <div class="mml-auth-switch">Don't have an account yet? <a id="mmlGoSignup">Sign up here</a></div>
      <div class="mml-auth-forgot" id="mmlForgotBtn">I forgot my password</div>
    </div>

    <div class="mml-auth-section" id="mmlSignupSection">
      <div class="mml-auth-title">Sign up, it's free..</div>
      <div class="mml-auth-error" id="mmlSignupError"></div>
      <input type="text" class="mml-auth-input" id="mmlSignupUsername" placeholder="Username">
      <input type="email" class="mml-auth-input" id="mmlSignupEmail" placeholder="E-mail address">
      <input type="password" class="mml-auth-input" id="mmlSignupPassword" placeholder="Password">
      <div class="mml-auth-row">
        <input type="text" class="mml-auth-input" id="mmlSignupFirstName" placeholder="Name">
        <input type="text" class="mml-auth-input" id="mmlSignupLastName" placeholder="Last name">
      </div>
      <button class="mml-auth-submit" id="mmlSignupBtn"><i class="fa fa-user-plus"></i> Sign up</button>
      <div class="mml-auth-switch">Do you already have an account? <a id="mmlGoLogin">Login here</a></div>
    </div>
  </div>
`;
document.body.appendChild(overlay);

const menu = document.createElement('div');
menu.className = 'mml-auth-menu';
menu.id = 'mmlAuthMenu';
menu.innerHTML = `
  <div class="mml-auth-menu-user" id="mmlMenuUsername"></div>
  <div class="mml-auth-menu-item" id="mmlProfileBtn"><i class="fa fa-user-circle"></i> Profile</div>
  <div class="mml-auth-menu-item" id="mmlLogoutBtn"><i class="fa fa-right-from-bracket"></i> Logout</div>
`;
document.body.appendChild(menu);

/* =========================================================
   Inject profile button into header
   ========================================================= */
const authBtn = document.createElement('button');
authBtn.className = 'mml-auth-btn';
authBtn.id = 'mmlAuthBtn';
authBtn.innerHTML = '<i class="fa fa-user"></i>';

// Appended AFTER whatever's already in .header-right (e.g. the search
// icon), so the layout reads [search] [profile] left-to-right — search
// stays on the left, the login/profile button sits on the right.
const headerRight = document.querySelector('.header-right');
if (headerRight) {
  headerRight.appendChild(authBtn);
} else {
  const header = document.querySelector('header');
  if (header) header.appendChild(authBtn);
}

/* =========================================================
   Modal open/close + form switching
   ========================================================= */
const loginSection = document.getElementById('mmlLoginSection');
const signupSection = document.getElementById('mmlSignupSection');
const loginError = document.getElementById('mmlLoginError');
const signupError = document.getElementById('mmlSignupError');

function openModal(section) {
  loginError.textContent = '';
  signupError.textContent = '';
  loginSection.classList.toggle('active', section === 'login');
  signupSection.classList.toggle('active', section === 'signup');
  overlay.classList.add('active');
}
function closeModal() { overlay.classList.remove('active'); }

document.getElementById('mmlAuthClose').addEventListener('click', closeModal);
overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });
document.getElementById('mmlGoSignup').addEventListener('click', () => openModal('signup'));
document.getElementById('mmlGoLogin').addEventListener('click', () => openModal('login'));

/* =========================================================
   Header profile button behavior:
   - Logged out -> opens login modal
   - Logged in  -> opens small dropdown menu (username + Profile + Logout)
   ========================================================= */
let currentUser = null;

authBtn.addEventListener('click', (e) => {
  if (currentUser) {
    const rect = authBtn.getBoundingClientRect();
    menu.style.top = (rect.bottom + 8) + 'px';
    menu.style.right = (window.innerWidth - rect.right) + 'px';
    menu.classList.toggle('active');
  } else {
    openModal('login');
  }
});
document.addEventListener('click', (e) => {
  if (!menu.contains(e.target) && e.target !== authBtn && !authBtn.contains(e.target)) {
    menu.classList.remove('active');
  }
});

document.getElementById('mmlLogoutBtn').addEventListener('click', async () => {
  await signOut(auth);
  menu.classList.remove('active');
});

// FIX: kalinviye methana modal ekema tiny "profileView" section eka
// open kala. Dan Vinuka ge ඉල්ලීම anuwa — dedicated "profile.html"
// page ekakata navigate karanawa (My List / Seen List / Shared Links /
// Comments stats + List/Seen/Links/Settings tabs thiyena screenshot eke
// design ekatama match wena full page eka).
document.getElementById('mmlProfileBtn').addEventListener('click', () => {
  menu.classList.remove('active');
  if (!currentUser) return;
  window.location.href = 'profile.html';
});

/* =========================================================
   SIGN UP
   ========================================================= */
document.getElementById('mmlSignupBtn').addEventListener('click', async () => {
  const username = document.getElementById('mmlSignupUsername').value.trim();
  const email = document.getElementById('mmlSignupEmail').value.trim();
  const password = document.getElementById('mmlSignupPassword').value;
  const firstName = document.getElementById('mmlSignupFirstName').value.trim();
  const lastName = document.getElementById('mmlSignupLastName').value.trim();
  const btn = document.getElementById('mmlSignupBtn');

  signupError.textContent = '';

  if (!username || !email || !password) {
    signupError.textContent = 'Username, Email, Password අනිවාර්යයි';
    return;
  }
  if (password.length < 6) {
    signupError.textContent = 'Password එකේ අඩුම වශයෙන් අකුරු 6ක් ඕන';
    return;
  }
  if (!/^[a-zA-Z0-9_.]{3,20}$/.test(username)) {
    signupError.textContent = 'Username එකේ letters/numbers/underscore විතරයි (අකුරු 3-20)';
    return;
  }

  btn.disabled = true;
  btn.innerHTML = '<i class="fa fa-spinner fa-spin"></i>';

  try {
    // Duplicate username check FIRST — Firebase Auth itself will catch a
    // duplicate email (auth/email-already-in-use), but username
    // uniqueness has to be checked against our own Firestore lookup.
    const taken = await usernameTaken(username);
    if (taken) {
      signupError.textContent = 'මේ Username එක දැනටමත් පාවිච්චි කරලා. වෙන එකක් try කරන්න.';
      return;
    }

    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const uid = cred.user.uid;

    await updateProfile(cred.user, { displayName: username }).catch(() => {});

    // usernames/{lowerUsername} -> lookup doc for username-based login
    await setDoc(doc(db, 'usernames', normUsername(username)), { email, uid });

    // users/{uid} -> full profile
    await setDoc(doc(db, 'users', uid), {
      username, email, firstName, lastName,
      createdAt: new Date().toISOString()
    });

    closeModal();
  } catch (err) {
    console.error(err);
    if (err.code === 'auth/email-already-in-use') {
      signupError.textContent = 'මේ Email එක දැනටමත් register වෙලා තියෙනවා.';
    } else if (err.code === 'auth/invalid-email') {
      signupError.textContent = 'Email address එක වැරදියි.';
    } else {
      signupError.textContent = 'Error: ' + err.message;
    }
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="fa fa-user-plus"></i> Sign up';
  }
});

/* =========================================================
   LOG IN  (by username — looked up to an email, then Firebase
   Auth signs in with that email + the given password)
   ========================================================= */
document.getElementById('mmlLoginBtn').addEventListener('click', async () => {
  const username = document.getElementById('mmlLoginUsername').value.trim();
  const password = document.getElementById('mmlLoginPassword').value;
  const stayLoggedIn = document.getElementById('mmlLoginStay').checked;
  const btn = document.getElementById('mmlLoginBtn');

  loginError.textContent = '';

  if (!username || !password) {
    loginError.textContent = 'Username සහ Password දෙකම දාන්න';
    return;
  }

  btn.disabled = true;
  btn.innerHTML = '<i class="fa fa-spinner fa-spin"></i>';

  try {
    const email = await emailForUsername(username);
    if (!email) {
      loginError.textContent = 'මේ Username එක හම්බුනේ නෑ';
      return;
    }

    // "Stay logged in" unchecked -> session-only persistence (clears when
    // the browser tab/window closes). Checked -> stays logged in across
    // browser restarts, same as the reference site's checkbox.
    await setPersistence(auth, stayLoggedIn ? browserLocalPersistence : browserSessionPersistence);
    await signInWithEmailAndPassword(auth, email, password);

    closeModal();
  } catch (err) {
    console.error(err);
    if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found') {
      loginError.textContent = 'Username හෝ Password වැරදියි.';
    } else {
      loginError.textContent = 'Error: ' + err.message;
    }
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="fa fa-sign-in-alt"></i> Sign in';
  }
});

document.getElementById('mmlLoginUsername').addEventListener('keypress', (e) => { if (e.key === 'Enter') document.getElementById('mmlLoginBtn').click(); });
document.getElementById('mmlLoginPassword').addEventListener('keypress', (e) => { if (e.key === 'Enter') document.getElementById('mmlLoginBtn').click(); });

/* =========================================================
   FORGOT PASSWORD
   ========================================================= */
document.getElementById('mmlForgotBtn').addEventListener('click', async () => {
  const input = prompt('Password reset කරන්න ඔයාගේ Username එක හෝ Email එක දාන්න:');
  if (!input) return;
  const raw = input.trim();
  try {
    const email = raw.includes('@') ? raw : await emailForUsername(raw);
    if (!email) { alert('මේ Username/Email එකට account එකක් හම්බුනේ නෑ.'); return; }
    await sendPasswordResetEmail(auth, email);
    alert('Password reset link එකක් ' + email + ' වලට යවලා තියෙනවා.');
  } catch (err) {
    alert('Error: ' + err.message);
  }
});

/* =========================================================
   AUTH STATE — keep the header button in sync with login state
   ========================================================= */
onAuthStateChanged(auth, (user) => {
  currentUser = user;
  if (user) {
    const label = user.displayName || (user.email || '').split('@')[0];
    authBtn.innerHTML = label.charAt(0).toUpperCase();
    document.getElementById('mmlMenuUsername').textContent = label;
  } else {
    authBtn.innerHTML = '<i class="fa fa-user"></i>';
    menu.classList.remove('active');
  }
});

// Expose for other scripts on the page that might want to check login
// state (e.g. to gate a feature, show a "My Watchlist" link, etc.)
window.MMLAuth = {
  get user() { return currentUser; },
  openLogin: () => openModal('login'),
  openSignup: () => openModal('signup'),
  logout: () => signOut(auth)
};
