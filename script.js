// Menu Toggle
const menuBtn = document.getElementById('menuBtn');
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');
const closeSidebar = document.getElementById('closeSidebar');

// Menu button click - open sidebar
menuBtn.onclick = () => {
  sidebar.classList.add('active');
  overlay.classList.add('active');
  menuBtn.classList.remove('fa-bars');
  menuBtn.classList.add('fa-times');
  closeSidebar.style.display = 'block'; // × button එක පෙන්නවා
}

// Overlay click - close sidebar
overlay.onclick = closeMenu;

// Close button click - close sidebar
closeSidebar.onclick = closeMenu;

// Close sidebar function
function closeMenu(){
  sidebar.classList.remove('active');
  overlay.classList.remove('active');
  menuBtn.classList.remove('fa-times');
  menuBtn.classList.add('fa-bars');
  closeSidebar.style.display = 'none'; // × button එක හංගනවා
}

// Search Toggle - උඹේ පැරණි code එක තියෙනවා නම් ඒකත් එහෙම්ම තියපන්
// const searchBtn = document.getElementById('searchBtn');
// const searchBox = document.getElementById('searchBox');
// const closeSearch = document.getElementById('closeSearch');

