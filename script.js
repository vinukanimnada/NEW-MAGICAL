/* =========================================================
   MAGICAL MOVIE LAND — shared script.js
   ========================================================= */

/* ----- Header height sync ----- */
(function () {
  function syncHeaderHeight() {
    const header = document.getElementById('mainHeader');
    if (!header) return;
    document.documentElement.style.setProperty('--header-h', header.offsetHeight + 'px');
  }
  window.syncHeaderHeight = syncHeaderHeight;

  syncHeaderHeight();
  window.addEventListener('load', syncHeaderHeight);
  window.addEventListener('resize', syncHeaderHeight);
  
  const header = document.getElementById('mainHeader');
  if (window.ResizeObserver && header) {
    new ResizeObserver(syncHeaderHeight).observe(header);
  }
})();

/* ----- Sidebar open/close with X Animation ----- */
function bindSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('overlay');
  let menuBtn = document.getElementById('menuBtn');

  if (!menuBtn || !sidebar || !overlay) {
    console.warn("[MAGICAL AI] Sidebar elements not found. bindSidebar() skipped");
    return null;
  }

  const newMenuBtn = menuBtn.cloneNode(true);
  newMenuBtn.id = 'menuBtn';
  menuBtn.parentNode.replaceChild(newMenuBtn, menuBtn);

  const newOverlay = overlay.cloneNode(true);
  newOverlay.id = 'overlay';
  overlay.parentNode.replaceChild(newOverlay, overlay);

  function openSidebar() {
    sidebar.classList.add('active');
    newOverlay.classList.add('active');
    newMenuBtn.classList.add('active'); // X animation trigger
    document.body.style.overflow = 'hidden';
  }
  function closeSidebar() {
    sidebar.classList.remove('active');
    newOverlay.classList.remove('active');
    newMenuBtn.classList.remove('active'); // aye 3 line
    document.body.style.overflow = '';
  }
  function toggleSidebar() {
    sidebar.classList.contains('active') ? closeSidebar() : openSidebar();
  }

  newMenuBtn.addEventListener('click', toggleSidebar);
  newOverlay.addEventListener('click', closeSidebar);

  sidebar.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeSidebar);
  });

  return { openSidebar, closeSidebar, toggleSidebar };
}
window.bindSidebar = bindSidebar;

/* ----- Search box open/close ----- */
function bindSearch(onClose) {
  const searchBtn = document.getElementById('searchBtn');
  const searchBox = document.getElementById('searchBox');
  const closeSearch = document.getElementById('closeSearch');
  const searchInput = document.getElementById('searchInput');

  if (!searchBtn || !searchBox) {
    console.warn("[MAGICAL AI] Search elements not found. bindSearch() skipped");
    return null;
  }

  function doClose() {
    searchBox.classList.remove('active');
    if (searchInput) searchInput.value = '';
    if (typeof onClose === 'function') onClose();
  }

  const newSearchBtn = searchBtn.cloneNode(true);
  newSearchBtn.id = 'searchBtn';
  searchBtn.parentNode.replaceChild(newSearchBtn, searchBtn);

  newSearchBtn.addEventListener('click', () => {
    searchBox.classList.toggle('active');
    if (searchBox.classList.contains('active')) {
      searchInput?.focus();
    } else {
      doClose();
    }
  });

  closeSearch?.addEventListener('click', doClose);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && searchBox.classList.contains('active')) doClose();
  });

  return { close: doClose };
}
window.bindSearch = bindSearch;

/* ----- Auto-bind for STATIC pages ----- */
function tryAutoBind() {
  if (document.getElementById('menuBtn')) bindSidebar();
  if (document.getElementById('searchBtn')) bindSearch();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', tryAutoBind);
} else {
  tryAutoBind();
}

// Sakura Petals Effect
function createPetal() {
  const petal = document.createElement('div');
  petal.classList.add('sakura-petal');
  
  petal.style.left = Math.random() * 100 + 'vw';
  petal.style.animationDuration = Math.random() * 5 + 5 + 's';
  petal.style.animationDelay = Math.random() * 5 + 's';
  petal.style.width = Math.random() * 8 + 8 + 'px';
  petal.style.height = petal.style.width;
  petal.style.background = `rgba(255, ${45 + Math.random()*20}, ${149 + Math.random()*20}, 0.7)`;

  document.getElementById('sakura-container').appendChild(petal);

  setTimeout(() => {
    petal.remove();
  }, 10000);
}

setInterval(createPetal, 200);
