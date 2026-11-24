import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const cfg = {
  apiKey: "AIzaSyCx0TEmgr3GCyvfeok9Y42yR1PTM4_8y9M",
  authDomain: "magical-movie-land.firebaseapp.com",
  projectId: "magical-movie-land",
  storageBucket: "magical-movie-land.firebasestorage.app",
  messagingSenderId: "27757424288",
  appId: "1:27757424288:web:d650e2659f09f0b9c823c5"
};
const app = getApps().length ? getApps()[0] : initializeApp(cfg);
const db = getFirestore(app);
const DEFAULT_INTRO = 'https://pub-08576c48d56a414dabb33e79de2c0a73.r2.dev/Vinuka/intro-defult.MP4';
const toast = m => (window.showToast ? window.showToast(m) : alert(m));
const isHttp = u => /^https?:\/\//i.test(String(u || '').trim());

// --- tab + section ඉබේම හදනවා ---
const tabsBar = document.querySelector('.admin-tabs');
const tab = document.createElement('div');
tab.className = 'admin-tab';
tab.dataset.tab = 'intro';
tab.textContent = 'Intro Video';
tabsBar.appendChild(tab);

const sec = document.createElement('div');
sec.className = 'admin-form-section';
sec.id = 'tab-intro';
sec.innerHTML = `
  <div class="form-hint" style="margin-bottom:12px;">Movie එකක් play කරන්න කලින් පෙන්නන Intro video එක. Direct .mp4 link එකක් දාන්න.</div>
  <div class="form-group"><label>Intro Video URL</label>
    <input type="url" class="admin-input" id="introUrl" placeholder="https://...mp4"></div>
  <div class="hero-toggle" style="margin-bottom:14px;">
    <div class="hero-toggle-text">
      <div class="hero-toggle-title"><i class="fa fa-film"></i> Intro video පෙන්වන්න</div>
      <div class="form-hint">Off කළොත් movie එක කෙලින්ම play වෙනවා.</div>
    </div>
    <label class="tgl"><input type="checkbox" id="introEnabled" checked><span class="tgl-track"></span></label>
  </div>
  <div style="display:flex; gap:8px;">
    <button class="btn btn-primary" id="introSave" style="flex:1; justify-content:center;"><i class="fa fa-save"></i> Save</button>
    <button class="btn btn-secondary" id="introPreviewBtn"><i class="fa fa-play"></i> Preview</button>
    <button class="btn btn-secondary" id="introReset">Default</button>
  </div>
  <video id="introPreview" controls playsinline style="display:none; width:100%; margin-top:14px; border-radius:10px; background:#000;"></video>`;
document.getElementById('adminPanel').appendChild(sec);

const urlEl = sec.querySelector('#introUrl'), onEl = sec.querySelector('#introEnabled'), prev = sec.querySelector('#introPreview');

// වෙන tab එකක් click කළාම අපේ tab එක inactive වෙන්න
document.querySelectorAll('.admin-tab').forEach(t => {
  if (t === tab) return;
  t.addEventListener('click', () => tab.classList.remove('active'));
});
tab.addEventListener('click', () => {
  document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.admin-form-section').forEach(s => s.classList.remove('active'));
  tab.classList.add('active'); sec.classList.add('active');
  load();
});

async function load() {
  try {
    const s = await getDoc(doc(db, 'settings', 'intro'));
    const d = s.exists() ? s.data() : {};
    urlEl.value = d.url || DEFAULT_INTRO;
    onEl.checked = d.enabled !== false;
  } catch (e) { console.error(e); toast('❌ Load කරගන්න බැරි උනා (Firestore rules බලන්න)'); }
}

sec.querySelector('#introSave').addEventListener('click', async e => {
  const url = urlEl.value.trim();
  if (onEl.checked && !isHttp(url)) { toast('Intro URL එක http:// හෝ https:// වලින් පටන් ගන්න ඕන'); return; }
  if (url && !isHttp(url)) { toast('URL එක වැරදියි'); return; }
  const b = e.currentTarget; b.disabled = true;
  try { await setDoc(doc(db, 'settings', 'intro'), { url, enabled: onEl.checked }, { merge: true }); toast('✅ Intro saved'); }
  catch (err) { console.error(err); toast('❌ Error: ' + err.message); }
  finally { b.disabled = false; }
});
sec.querySelector('#introReset').addEventListener('click', () => { urlEl.value = DEFAULT_INTRO; });
sec.querySelector('#introPreviewBtn').addEventListener('click', () => {
  const u = urlEl.value.trim();
  if (!isHttp(u)) { toast('මුලින් හරි URL එකක් දාන්න'); return; }
  prev.src = u; prev.style.display = 'block'; prev.play().catch(() => {});
});
