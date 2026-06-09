// Menu Toggle
const menuBtn = document.getElementById('menuBtn');
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');

menuBtn.onclick = () => {
  sidebar.classList.add('active');
  overlay.classList.add('active');
  menuBtn.classList.remove('fa-bars');
  menuBtn.classList.add('fa-times');
}

overlay.onclick = closeMenu;

function closeMenu(){
  sidebar.classList.remove('active');
  overlay.classList.remove('active');
  menuBtn.classList.remove('fa-times');
  menuBtn.classList.add('fa-bars');
}

// Search Toggle
const searchBtn = document.getElementById('searchBtn');
const searchBox = document.getElementById('searchBox');
const closeSearch = document.getElementById('closeSearch');

searchBtn.onclick = () => {
  searchBox.classList.add('active');
  searchBtn.style.display = 'none';
}

closeSearch.onclick = () => {
  searchBox.classList.remove('active');
  searchBtn.style.display = 'block';
}

console.log("Sinhala Cartoons loaded ✅");

// Close sidebar button
const closeSidebar = document.getElementById('closeSidebar');
closeSidebar.onclick = closeMenu;