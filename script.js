// Menu + Search Toggle
const menuBtn = document.getElementById("menuBtn");
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");
const closeSidebar = document.getElementById("closeSidebar");

menuBtn.onclick = () => {
  sidebar.classList.add("active");
  overlay.classList.add("active");
  closeSidebar.style.display = "block";
};

closeSidebar.onclick = () => {
  sidebar.classList.remove("active");
  overlay.classList.remove("active");
  closeSidebar.style.display = "none";
};

overlay.onclick = () => {
  sidebar.classList.remove("active");
  overlay.classList.remove("active");
  closeSidebar.style.display = "none";
};

const searchBtn = document.getElementById("searchBtn");
const searchBox = document.getElementById("searchBox");
const closeSearch = document.getElementById("closeSearch");

searchBtn.onclick = () => searchBox.classList.add("active");
closeSearch.onclick = () => searchBox.classList.remove("active");

// Hero Slider
let slides = document.querySelectorAll(".hero-slide");
let dotsContainer = document.querySelector(".hero-dots");
let current = 0;

slides.forEach((_, i) => {
  let dot = document.createElement("span");
  if (i === 0) dot.classList.add("active");
  dot.addEventListener("click", () => goToSlide(i));
  dotsContainer.appendChild(dot);
});

function showSlide(index) {
  slides.forEach((s, i) => {
    s.classList.remove("active");
    dotsContainer.children[i].classList.remove("active");
  });
  slides[index].classList.add("active");
  dotsContainer.children[index].classList.add("active");
}

function goToSlide(index) {
  current = index;
  showSlide(current);
}

setInterval(() => {
  current = (current + 1) % slides.length;
  showSlide(current);
}, 5000);

// ================= Firebase Load Movies =================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, getDocs, orderBy, query, where, limit } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCx0TEmgr3GCyvfeok9Y42yR1PTM4_8y9M",
  authDomain: "magical-movie-land.firebaseapp.com",
  projectId: "magical-movie-land",
  storageBucket: "magical-movie-land.firebasestorage.app",
  messagingSenderId: "27757424288",
  appId: "1:27757424288:web:d650e2659f09f0b9c823c5",
  measurementId: "G-KK84DYV9EP"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function createCard(m) {
  return `
    <div class="movie-card">
      <span class="badge hd">HD</span>
      <img src="${m.poster || m.thumbnail}" alt="${m.title}">
      <div class="card-info">
        <h3>${m.title}</h3>
        <p>${m.year || '2024'} | ${m.category}</p>
      </div>
    </div>
  `;
}

// 1. Latest Uploads
async function loadLatestMovies() {
  const grid = document.getElementById("latestMovies");
  if(!grid) return;

  try {
    const q = query(collection(db, "movies"), where("category", "==", "latest"), orderBy("createdAt", "desc"), limit(12));
    const snapshot = await getDocs(q);
    let html = '';
    snapshot.forEach(doc => { html += createCard(doc.data()); });
    grid.innerHTML = html || '<p style="color:#666; grid-column:1/-1; text-align:center;">Movies නැත</p>';
  } catch(err) {
    console.error("Latest Error:", err);
    grid.innerHTML = '<p style="color:red; grid-column:1/-1; text-align:center;">Error loading</p>';
  }
}

// 2. TV Shows
async function loadTVShows() {
  const grid = document.getElementById("tvShowsMovies");
  if(!grid) return;

  try {
    const q = query(collection(db, "movies"), where("category", "==", "tvshows"), orderBy("createdAt", "desc"), limit(12));
    const snapshot = await getDocs(q);
    let html = '';
    snapshot.forEach(doc => { html += createCard(doc.data()); });
    grid.innerHTML = html || '<p style="color:#666; grid-column:1/-1; text-align:center;">TV Shows නැත</p>';
  } catch(err) {
    console.error("TV Shows Error:", err);
    grid.innerHTML = '<p style="color:red; grid-column:1/-1; text-align:center;">Error loading</p>';
  }
}

// 3. Daily Trending
async function loadTrendingMovies() {
  const grid = document.getElementById("trendingMovies");
  if(!grid) return;

  try {
    const q = query(collection(db, "movies"), where("category", "==", "trending"), orderBy("createdAt", "desc"), limit(12));
    const snapshot = await getDocs(q);
    let html = '';
    snapshot.forEach(doc => { html += createCard(doc.data()); });
    grid.innerHTML = html || '<p style="color:#666; grid-column:1/-1; text-align:center;">Trending නැත</p>';
  } catch(err) {
    console.error("Trending Error:", err);
    grid.innerHTML = '<p style="color:red; grid-column:1/-1; text-align:center;">Error loading</p>';
  }
}

// Page load වෙද්දි 3ම run වෙනවා
loadLatestMovies();
loadTVShows();
loadTrendingMovies();