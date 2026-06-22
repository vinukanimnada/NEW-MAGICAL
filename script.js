// ================= Firebase Imports =================
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

// ================= Create Card =================
function createCard(m, id) {
  const quality = m.quality || 'HD';
  const qualityClass = quality.toLowerCase().replace('.', '-');

  return `
    <div class="movie-card">
      <a href="watch.html?id=${id}" style="text-decoration:none; color:inherit; display:block;">
        <span class="badge ${qualityClass}">${quality}</span>
        ${m.imdbRating ? `<span class="badge imdb">⭐ ${m.imdbRating}</span>` : ''}
        <img src="${m.poster || m.thumbnail || 'https://via.placeholder.com/300x450'}" alt="${m.title || 'Movie'}">
        <div class="card-info">
          <h3>${m.title || 'Untitled Movie'}</h3>
          <p>${m.year || '2024'} | ${m.category || 'Movie'}</p>
        </div>
      </a>
    </div>
  `;
}

// ================= HERO SLIDER - BACKGROUND IMAGE =================
async function loadHeroSlider() {
    const heroSlides = document.getElementById('heroSlides');
    const heroDots = document.getElementById('heroDots');
    const heroSlider = document.getElementById('heroSlider');
    
    if(!heroSlides) return;
    
    try {
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
            const bannerURL = m.banner.startsWith('http') ? m.banner : 'https://via.placeholder.com/1920x1080/111/fff?text=No+Banner';
            
            slidesHTML += `
            <div class="hero-slide ${index === 0 ? 'active' : ''}" style="background-image: url('${bannerURL}')">
                <div class="hero-content">
                    <h1>${m.title || 'Movie'}</h1>
                    ${(m.imdbRating || m.year) ? `
                    <div class="hero-meta">
                        ${m.imdbRating ? `<span class="imdb">IMDb: ${m.imdbRating}</span>` : ''}
                        ${m.year ? `<span class="year">${m.year}</span>` : ''}
                    </div>` : ''}
                    ${m.description ? `<p class="desc">${m.description.substring(0, 100)}...</p>` : ''}
                    <a href="movie.html?id=${m.id}" class="watch-btn">
                        <i class="fa fa-play"></i> WATCH NOW
                    </a>
                </div>
            </div>`;
            
            dotsHTML += `<div class="dot ${index === 0 ? 'active' : ''}" onclick="goToSlide(${index})"></div>`;
        });
        
        heroSlides.innerHTML = slidesHTML;
        heroDots.innerHTML = dotsHTML;
        
        // Auto slide 5sec - opacity fade
        let currentSlide = 0;
        setInterval(() => {
            currentSlide = (currentSlide + 1) % heroMovies.length;
            goToSlide(currentSlide);
        }, 2500);
        
    } catch(error) {
        console.error('Hero load error:', error);
        if(heroSlider) heroSlider.style.display = 'none';
    }
}

// ================= goToSlide - FIXED VERSION =================
window.goToSlide = function(n) {
    const slides = document.querySelectorAll('.hero-slide');
    const dots = document.querySelectorAll('.hero-dots .dot');
    
    slides.forEach((slide, i) => {
        slide.classList.remove('active');
        if(i === n) slide.classList.add('active');
    });
    
    dots.forEach((dot, i) => {
        dot.classList.remove('active');
        if(i === n) dot.classList.add('active');
    });
}

// ================= Load Movies =================
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
    grid.innerHTML = '<p style="color:red; grid-column:1/-1; text-align:center;">Index Error</p>';
  }
}

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

// Page load
loadHeroSlider();
loadLatestMovies();
loadTVShows();
loadTrendingMovies();

// ================= Menu + Search =================
document.addEventListener('DOMContentLoaded', function() {
  const menuBtn = document.getElementById("menuBtn");
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("overlay");
  const closeSidebar = document.getElementById("closeSidebar");

  if(menuBtn) {
    menuBtn.onclick = () => {
      sidebar.classList.add("active");
      overlay.classList.add("active");
    };
  }

  if(closeSidebar) closeSidebar.onclick = () => {
    sidebar.classList.remove("active");
    overlay.classList.remove("active");
  };

  if(overlay) overlay.onclick = () => {
    sidebar.classList.remove("active");
    overlay.classList.remove("active");
  };

  const searchBtn = document.getElementById("searchBtn");
  const searchBox = document.getElementById("searchBox");
  const closeSearch = document.getElementById("closeSearch");

  if(searchBtn) searchBtn.onclick = () => searchBox.classList.add("active");
  if(closeSearch) closeSearch.onclick = () => searchBox.classList.remove("active");
});





let allMovies = []; // Search කරන්න cache කරගන්න

// Movies load කරපු ගමන් array එකේ save කරගන්න
async function loadMovies() {
  try {
    const q = query(
      collection(db, "movies"),
      where("category", "==", "allmovies"),
      where("type", "==", "movie")
    );
    const snapshot = await getDocs(q);

    if(snapshot.empty) {
      grid.innerHTML = '<div class="no-movies">Movies නැත.</div>';
      return;
    }

    grid.innerHTML = "";
    allMovies = []; // Clear

    snapshot.forEach(doc => {
      const m = doc.data();
      m.id = doc.id; // ID save කරගන්න
      allMovies.push(m);

      // පරණ card display code එක
      const poster = m.poster || 'https://via.placeholder.com/300x450/222/fff?text=No+Image';
      let rating = m.imdbRating? m.imdbRating.toString().split('/')[0] : '0.0';
      if(!rating.includes('.')) rating += '.0';
      const quality = (m.quality || 'WEB-DL').toUpperCase();
      let title = m.title || 'Untitled';
      if(title.length > 20) title = title.substring(0, 20) + '...';

      const card = `
        <div class="movie-card" onclick="openMovie('${doc.id}')">
          <span class="quality-badge">${quality}</span>
          <span class="rating-badge">★ ${rating}</span>
          <img src="${poster}" alt="${m.title}" loading="lazy">
          <div class="movie-title">${title}</div>
        </div>
      `;
      grid.innerHTML += card;
    });
  } catch(err) {
    console.error(err);
    grid.innerHTML = `<div class="no-movies">Error: ${err.message}</div>`;
  }
}

// Search function
function searchMovies(query) {
  const resultsDiv = document.getElementById('searchResults');
  const gridDiv = document.getElementById('movieGrid');

  if(!query.trim()) {
    resultsDiv.classList.remove('active');
    gridDiv.style.display = 'grid';
    return;
  }

  gridDiv.style.display = 'none';
  resultsDiv.classList.add('active');

  const filtered = allMovies.filter(m =>
    m.title && m.title.toLowerCase().includes(query.toLowerCase())
  );

  if(filtered.length === 0) {
    resultsDiv.innerHTML = '<div class="search-no-result">🔍 Results හමු නොවීය</div>';
    return;
  }

  resultsDiv.innerHTML = filtered.map(m => {
    const poster = m.poster || 'https://via.placeholder.com/60x90/222/fff';
    const year = m.year || 'N/A';
    const duration = m.duration || 'N/A';
    const genre = m.genre || m.language || 'Movie';

    let title = m.title;
    if(title.length > 40) title = title.substring(0, 40) + '...';

    return `
      <div class="search-result-item" onclick="openMovie('${m.id}')">
        <img src="${poster}" class="search-result-poster" loading="lazy">
        <div class="search-result-info">
          <div class="search-result-title">${title}</div>
          <div class="search-result-meta">
            ${year} • ${duration} min<br>
            ${genre}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

window.openMovie = function(id) {
  window.location.href = `watch.html?id=${id}`;
}

// Search bar events
searchBtn?.addEventListener('click', () => {
  searchBox.classList.toggle('active');
  if(searchBox.classList.contains('active')) {
    searchBox.querySelector('input').focus();
  } else {
    searchMovies(''); // Close කරපු ගමන් grid පෙන්නන්න
  }
});

const searchInput = document.querySelector('.search-box input');
const searchBtnIcon = document.querySelector('.search-box button');

// Type කරද්දි search
searchInput?.addEventListener('input', (e) => {
  searchMovies(e.target.value);
});

// Enter ගැහුවම search
searchInput?.addEventListener('keypress', (e) => {
  if(e.key === 'Enter') {
    searchMovies(e.target.value);
  }
});

// Search button click
searchBtnIcon?.addEventListener('click', () => {
  searchMovies(searchInput.value);
});