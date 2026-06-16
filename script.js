// ================= Firebase Imports - මුලින්ම තියන්න ඕන =================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, getDocs, orderBy, query, where, limit, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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

// ================= Create Card with Link + Quality + IMDb Badge =================
function createCard(m, id) {
  const quality = m.quality || 'HD';
  const qualityClass = quality.toLowerCase().replace('.', '-'); // WEB-DL -> web-dl

  return `
    <div class="movie-card">
      <a href="watch.html?id=${id}" style="text-decoration:none; color:inherit; display:block;">
        <span class="badge ${qualityClass}">${quality}</span>
        ${m.imdbRating? `<span class="badge imdb">⭐ ${m.imdbRating}</span>` : ''}
        <img src="${m.poster || m.thumbnail || 'https://via.placeholder.com/300x450'}" alt="${m.title || 'Movie'}">
        <div class="card-info">
          <h3>${m.title || 'Untitled Movie'}</h3>
          <p>${m.year || '2024'} | ${m.category || 'Movie'}</p>
        </div>
      </a>
    </div>
  `;
}

// ================= HERO SLIDER - FIREBASE එකෙන් Load කරනවා =================
async function loadHeroSlider() {
    const heroSlides = document.getElementById('heroSlides');
    const heroDots = document.getElementById('heroDots');
    const heroSlider = document.getElementById('heroSlider');
    
    if(!heroSlides) return;
    
    try {
        // featured: true + banner තියෙන movies ගන්න
        const q = query(collection(db, "movies"), limit(10));
        const querySnapshot = await getDocs(q);
        
        const heroMovies = [];
        querySnapshot.forEach((doc) => {
            const m = doc.data();
            if(m.featured === true && m.banner && m.banner.trim() !== '') {
                heroMovies.push({id: doc.id, ...m});
            }
        });
        
        console.log('Hero movies found:', heroMovies.length);
        
        if(heroMovies.length === 0) {
            console.log('Hero එකක් නෑ. Admin එකෙන් featured tick + banner URL දාපන්');
            if(heroSlider) heroSlider.style.display = 'none';
            return;
        }
        
        let slidesHTML = '';
        let dotsHTML = '';
        
        heroMovies.slice(0, 5).forEach((m, index) => {
            const bannerURL = m.banner.startsWith('http') ? m.banner : 'https://via.placeholder.com/1920x1080/111/fff?text=Invalid+Banner+URL';
            
            slidesHTML += `
            <div class="hero-slide" style="background-image: url('${bannerURL}')">
                <div class="hero-content">
                    <h1>${m.title || 'Movie'}</h1>
                    ${(m.imdbRating || m.year) ? `
                    <div class="hero-meta">
                        ${m.imdbRating ? `<span class="imdb">IMDb: ${m.imdbRating}</span>` : ''}
                        ${m.year ? `<span class="year">${m.year}</span>` : ''}
                    </div>` : ''}
                    ${m.genres ? `<p class="desc">${m.genres}</p>` : ''}
                    ${m.description ? `<p class="desc">${m.description.substring(0, 120)}...</p>` : ''}
                    <a href="movie.html?id=${m.id}" class="watch-btn">
                        <i class="fa fa-play"></i> WATCH NOW
                    </a>
                </div>
            </div>`;
            
            dotsHTML += `<div class="dot ${index === 0 ? 'active' : ''}" onclick="goToSlide(${index})"></div>`;
        });
        
        heroSlides.innerHTML = slidesHTML;
        heroDots.innerHTML = dotsHTML;
        
        // Auto slide 5sec
        let currentSlide = 0;
        setInterval(() => {
            currentSlide = (currentSlide + 1) % heroMovies.length;
            goToSlide(currentSlide);
        }, 5000);
        
    } catch(error) {
        console.error('Hero load error:', error);
        if(heroSlider) heroSlider.style.display = 'none';
    }
}

window.goToSlide = function(n) {
    const slides = document.getElementById('heroSlides');
    const dots = document.querySelectorAll('.hero-dots .dot');
    if(slides) slides.style.transform = `translateX(-${n * 100}%)`;
    dots.forEach((dot, i) => dot.classList.toggle('active', i === n));
}

// ================= Firebase Load Movies =================
// 1. Latest Uploads
async function loadLatestMovies() {
  const grid = document.getElementById("latestMovies");
  if(!grid) return;
  grid.innerHTML = '<p style="color:#666; grid-column:1/-1; text-align:center;">Loading...</p>';

  try {
    const q = query(collection(db, "movies"), where("category", "==", "latest"), orderBy("createdAt", "desc"), limit(12));
    const snapshot = await getDocs(q);
    let html = '';
    snapshot.forEach(doc => { html += createCard(doc.data(), doc.id); });
    grid.innerHTML = html || '<p style="color:#666; grid-column:1/-1; text-align:center;">Movies නැත</p>';
  } catch(err) {
    console.error("Latest Error:", err);
    grid.innerHTML = '<p style="color:red; grid-column:1/-1; text-align:center;">Index Error - Firebase Console බලන්න</p>';
  }
}

// 2. TV Shows
async function loadTVShows() {
  const grid = document.getElementById("tvShowsMovies");
  if(!grid) return;
  grid.innerHTML = '<p style="color:#666; grid-column:1/-1; text-align:center;">Loading...</p>';

  try {
    const q = query(collection(db, "movies"), where("category", "==", "tvshows"), orderBy("createdAt", "desc"), limit(12));
    const snapshot = await getDocs(q);
    let html = '';
    snapshot.forEach(doc => { html += createCard(doc.data(), doc.id); });
    grid.innerHTML = html || '<p style="color:#666; grid-column:1/-1; text-align:center;">TV Shows නැත</p>';
  } catch(err) {
    console.error("TV Shows Error:", err);
  }
}

// 3. Daily Trending
async function loadTrendingMovies() {
  const grid = document.getElementById("trendingMovies");
  if(!grid) return;
  grid.innerHTML = '<p style="color:#666; grid-column:1/-1; text-align:center;">Loading...</p>';

  try {
    const q = query(collection(db, "movies"), where("category", "==", "trending"), orderBy("createdAt", "desc"), limit(12));
    const snapshot = await getDocs(q);
    let html = '';
    snapshot.forEach(doc => { html += createCard(doc.data(), doc.id); });
    grid.innerHTML = html || '<p style="color:#666; grid-column:1/-1; text-align:center;">Trending නැත</p>';
  } catch(err) {
    console.error("Trending Error:", err);
  }
}

// Page load වෙද්දි Firebase data load වෙනවා
loadHeroSlider(); // Hero එක මුලින්ම load කරගමු
loadLatestMovies();
loadTVShows();
loadTrendingMovies();

// ================= Menu + Search =================
document.addEventListener('DOMContentLoaded', function() {
  // Menu Toggle
  const menuBtn = document.getElementById("menuBtn");
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("overlay");
  const closeSidebar = document.getElementById("closeSidebar");

  if(menuBtn) {
    menuBtn.onclick = () => {
      sidebar.classList.add("active");
      overlay.classList.add("active");
      closeSidebar.style.display = "block";
    };
  }

  if(closeSidebar) closeSidebar.onclick = () => {
    sidebar.classList.remove("active");
    overlay.classList.remove("active");
    closeSidebar.style.display = "none";
  };

  if(overlay) overlay.onclick = () => {
    sidebar.classList.remove("active");
    overlay.classList.remove("active");
    closeSidebar.style.display = "none";
  };

  // Search Toggle
  const searchBtn = document.getElementById("searchBtn");
  const searchBox = document.getElementById("searchBox");
  const closeSearch = document.getElementById("closeSearch");

  if(searchBtn) searchBtn.onclick = () => searchBox.classList.add("active");
  if(closeSearch) closeSearch.onclick = () => searchBox.classList.remove("active");
});