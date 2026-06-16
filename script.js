// ================= Firebase Imports =================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, getDocs, query, where, orderBy, limit } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// ================= Firebase Config =================
const firebaseConfig = {
  apiKey: "AIzaSyCx0TEmgr3GCyvfeok9Y42yR1PTM4_8y9M",
  authDomain: "mag-movies-9a3e7.firebaseapp.com",
  projectId: "mag-movies-9a3e7",
  storageBucket: "mag-movies-9a3e7.firebasestorage.app",
  messagingSenderId: "772535584323",
  appId: "1:772535584323:web:d1d4c0b3e8a4c2f1b9d8e7"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ================= DOM Elements =================
const heroSlider = document.getElementById('heroSlider');
const heroDots = document.getElementById('heroDots');
const movieGrid = document.getElementById('movieGrid');
const latestGrid = document.getElementById('latestGrid');
const seriesGrid = document.getElementById('seriesGrid');
const searchInput = document.getElementById('searchInput');

// Global variable
let allMovies = [];
let currentSlide = 0;
let slideInterval;

// ================= Create Movie Card with WATCH LINK =================
function createCard(movie, id) {
  const quality = movie.quality || 'HD';
  const rating = movie.rating || 'N/A';

  return `
    <div class="card">
      <a href="watch.html?id=${id}" style="text-decoration:none; color:inherit; display:block;">
        <div class="card-img">
          <img src="${movie.poster || 'https://via.placeholder.com/300x450/1a1a1a/666?text=No+Image'}"
               alt="${movie.title}"
               loading="lazy"
               onerror="this.src='https://via.placeholder.com/300x450/1a1a1a/666?text=No+Image'">
          <span class="quality-badge">${quality}</span>
          ${rating!== 'N/A'? `<span class="rating-badge">⭐ ${rating}</span>` : ''}
          <div class="play-overlay">
            <i class="fa fa-play"></i>
          </div>
        </div>
        <div class="card-info">
          <h3>${movie.title || 'Untitled'}</h3>
          <p>${movie.year || '2024'} • ${movie.genre || 'Movie'}</p>
        </div>
      </a>
    </div>
  `;
}

// ================= Load Hero Slider =================
async function loadHeroSlider() {
  try {
    const q = query(
      collection(db, "movies"),
      where("featured", "==", true),
      limit(5)
    );
    const snapshot = await getDocs(q);

    let heroMovies = [];
    snapshot.forEach(doc => {
      heroMovies.push({ id: doc.id,...doc.data() });
    });

    // Featured නැත්තම් latest 5 ගනින්
    if (heroMovies.length === 0) {
      const q2 = query(collection(db, "movies"), orderBy("createdAt", "desc"), limit(5));
      const snap2 = await getDocs(q2);
      snap2.forEach(doc => {
        heroMovies.push({ id: doc.id,...doc.data() });
      });
    }

    if (heroMovies.length === 0) {
      heroSlider.innerHTML = '<p style="text-align:center; padding:100px;">No movies found</p>';
      return;
    }

    // Slides හදනවා - WATCH LINK එක දාලා
    heroSlider.innerHTML = heroMovies.map((m, index) => `
      <div class="hero-slide ${index === 0? 'active' : ''}"
           style="background-image: linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.8)), url('${m.backdrop || m.poster}')">
        <div class="hero-content">
          <h1>${m.title}</h1>
          <div class="hero-meta">
            ${m.rating? `<span>⭐ ${m.rating}</span>` : ''}
            ${m.year? `<span>${m.year}</span>` : ''}
            ${m.quality? `<span class="quality">${m.quality}</span>` : ''}
          </div>
          <p>${m.description? m.description.substring(0, 150) + '...' : 'No description available'}</p>
          <a href="watch.html?id=${m.id}" class="watch-btn">
            <i class="fa fa-play"></i> WATCH NOW
          </a>
        </div>
      </div>
    `).join('');

    // Dots හදනවා
    heroDots.innerHTML = heroMovies.map((_, i) => `
      <span class="dot ${i === 0? 'active' : ''}" onclick="changeSlide(${i})"></span>
    `).join('');

    // Auto slide
    startAutoSlide(heroMovies.length);

  } catch (error) {
    console.error("Hero load error:", error);
    heroSlider.innerHTML = '<p style="text-align:center; padding:100px;">Error loading hero</p>';
  }
}

// ================= Auto Slide Function =================
function startAutoSlide(total) {
  clearInterval(slideInterval);
  slideInterval = setInterval(() => {
    currentSlide = (currentSlide + 1) % total;
    changeSlide(currentSlide);
  }, 5000);
}

// ================= Change Slide =================
window.changeSlide = function(n) {
  const slides = document.querySelectorAll('.hero-slide');
  const dots = document.querySelectorAll('.dot');

  slides.forEach(s => s.classList.remove('active'));
  dots.forEach(d => d.classList.remove('active'));

  if (slides[n]) slides[n].classList.add('active');
  if (dots[n]) dots[n].classList.add('active');

  currentSlide = n;
  clearInterval(slideInterval);
  startAutoSlide(slides.length);
}

// ================= Load Movies by Category =================
async function loadMovies(category, gridElement) {
  if (!gridElement) return;

  gridElement.innerHTML = '<p style="text-align:center; grid-column:1/-1;">Loading...</p>';

  try {
    let q;
    if (category === 'latest') {
      q = query(collection(db, "movies"), orderBy("createdAt", "desc"), limit(12));
    } else if (category === 'series') {
      q = query(collection(db, "movies"), where("type", "==", "series"), orderBy("createdAt", "desc"), limit(12));
    } else {
      q = query(collection(db, "movies"), where("category", "==", category), orderBy("createdAt", "desc"), limit(12));
    }

    const snapshot = await getDocs(q);
    let html = '';

    snapshot.forEach(doc => {
      html += createCard(doc.data(), doc.id);
    });

    gridElement.innerHTML = html || '<p style="text-align:center; grid-column:1/-1;">No movies found</p>';

  } catch (error) {
    console.error(`${category} load error:`, error);
    gridElement.innerHTML = '<p style="text-align:center; grid-column:1/-1; color:red;">Error loading movies</p>';
  }
}

// ================= Search Function =================
async function searchMovies(searchTerm) {
  if (!searchTerm || searchTerm.length < 2) {
    loadMovies('latest', latestGrid);
    return;
  }

  movieGrid.innerHTML = '<p style="text-align:center; grid-column:1/-1;">Searching...</p>';

  try {
    const q = query(collection(db, "movies"), orderBy("title"));
    const snapshot = await getDocs(q);
    let html = '';

    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.title && data.title.toLowerCase().includes(searchTerm.toLowerCase())) {
        html += createCard(data, doc.id);
      }
    });

    movieGrid.innerHTML = html || '<p style="text-align:center; grid-column:1/-1;">No results found</p>';

  } catch (error) {
    console.error("Search error:", error);
  }
}

// ================= Initialize on Page Load =================
document.addEventListener('DOMContentLoaded', () => {
  loadHeroSlider();
  loadMovies('latest', latestGrid);
  loadMovies('series', seriesGrid);

  // Search
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchMovies(e.target.value);
    });
  }
});

// ================= Mobile Menu Toggle =================
window.toggleMenu = function() {
  document.querySelector('.nav-links').classList.toggle('active');
}