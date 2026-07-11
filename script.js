/* =========================================================
   MAGICAL MOVIE LAND — shared script.js
   Common logic used across index.html, movies.html,
   series.html, about.html (and any future page):
     - keep --header-h in sync with the real header height
     - sidebar open/close (hamburger + overlay)
     - search box open/close
   Page-specific logic (Firebase queries, movie grids,
   search filtering, etc.) stays in each page's own <script>.
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

/* ----- Sidebar open/close -----
   Call window.bindSidebar() any time #menuBtn / #sidebar / #overlay
   exist in the DOM. */
function bindSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('overlay');
  const menuBtn = document.getElementById('menuBtn');

  if (!menuBtn || !sidebar || !overlay) {
    console.warn("[MAGICAL AI] Sidebar elements not found. bindSidebar() skipped");
    return null;
  }

  function openSidebar() {
    sidebar.classList.add('active');
    overlay.classList.add('active');
    menuBtn.classList.add('active');
    document.body.style.overflow = 'hidden'; // scroll lock
  }
  function closeSidebar() {
    sidebar.classList.remove('active');
    overlay.classList.remove('active');
    menuBtn.classList.remove('active');
    document.body.style.overflow = '';
  }
  function toggleSidebar() {
    sidebar.classList.contains('active') ? closeSidebar() : openSidebar();
  }

  // duplicate event listener na wenna kalin clone karanawa
  const newMenuBtn = menuBtn.cloneNode(true);
  const newOverlay = overlay.cloneNode(true);
  menuBtn.parentNode.replaceChild(newMenuBtn, menuBtn);
  overlay.parentNode.replaceChild(newOverlay, overlay);

  newMenuBtn.addEventListener('click', toggleSidebar);
  newOverlay.addEventListener('click', closeSidebar);

  return { openSidebar, closeSidebar, toggleSidebar };
}
window.bindSidebar = bindSidebar;

/* ----- Search box open/close -----
   Call window.bindSearch(onClose) any time #searchBtn / #searchBox
   exist in the DOM. */
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

  // ESC key dala close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && searchBox.classList.contains('active')) doClose();
  });

  return { close: doClose };
}
window.bindSearch = bindSearch;

/* ----- Auto-bind for STATIC pages only -----
   Dynamic header thiyena index.html eke meka skip wenawa.
   E nisa index.html eke header inject karala passe bindSidebar() call karanna. */
function tryAutoBind() {
  if (document.getElementById('menuBtn')) bindSidebar();
  if (document.getElementById('searchBtn')) bindSearch();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', tryAutoBind);
} else {
  tryAutoBind();
}