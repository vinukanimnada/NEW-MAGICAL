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
  const header = document.getElementById('mainHeader');

  function syncHeaderHeight() {
    if (!header) return;
    document.documentElement.style.setProperty('--header-h', header.offsetHeight + 'px');
  }
  window.syncHeaderHeight = syncHeaderHeight;

  syncHeaderHeight();
  window.addEventListener('load', syncHeaderHeight);
  window.addEventListener('resize', syncHeaderHeight);
  if (window.ResizeObserver && header) {
    new ResizeObserver(syncHeaderHeight).observe(header);
  }
})();

/* ----- Sidebar open/close -----
   Call window.bindSidebar() any time #menuBtn / #sidebar / #overlay
   exist in the DOM (auto-called below on static pages; pages that
   inject the header via JS, like index.html, call it manually
   right after rendering the header). */
function bindSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('overlay');
  const menuBtn = document.getElementById('menuBtn');

  function openSidebar() {
    sidebar?.classList.add('active');
    overlay?.classList.add('active');
    menuBtn?.classList.add('active');
  }
  function closeSidebar() {
    sidebar?.classList.remove('active');
    overlay?.classList.remove('active');
    menuBtn?.classList.remove('active');
  }
  function toggleSidebar() {
    sidebar?.classList.contains('active') ? closeSidebar() : openSidebar();
  }

  menuBtn?.addEventListener('click', toggleSidebar);
  overlay?.addEventListener('click', closeSidebar);

  return { openSidebar, closeSidebar, toggleSidebar };
}
window.bindSidebar = bindSidebar;

/* ----- Search box open/close -----
   Call window.bindSearch(onClose) any time #searchBtn / #searchBox
   exist in the DOM. onClose is an optional callback for page-specific
   cleanup (e.g. hiding a results list) when the box is closed. */
function bindSearch(onClose) {
  const searchBtn = document.getElementById('searchBtn');
  const searchBox = document.getElementById('searchBox');
  const closeSearch = document.getElementById('closeSearch');
  const searchInput = document.getElementById('searchInput');

  function doClose() {
    searchBox?.classList.remove('active');
    if (searchInput) searchInput.value = '';
    if (typeof onClose === 'function') onClose();
  }

  searchBtn?.addEventListener('click', () => {
    searchBox?.classList.toggle('active');
    if (searchBox?.classList.contains('active')) {
      searchInput?.focus();
    } else {
      doClose();
    }
  });

  closeSearch?.addEventListener('click', doClose);

  return { close: doClose };
}
window.bindSearch = bindSearch;

/* ----- Auto-bind for pages with a static header
   (movies.html, series.html, about.html). Pages that render the
   header dynamically (index.html) call bindSidebar()/bindSearch()
   themselves after injecting the header HTML. ----- */
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('menuBtn')) bindSidebar();
  if (document.getElementById('searchBtn')) bindSearch();
});
