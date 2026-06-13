document.addEventListener('DOMContentLoaded', () => {

  // ===== Menu Toggle =====
  const menuBtn = document.getElementById('menuBtn');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('overlay');
  const closeSidebar = document.getElementById('closeSidebar');

  function closeMenu() {
    if (sidebar) sidebar.classList.remove('active');
    if (overlay) overlay.classList.remove('active');

    if (menuBtn) {
      menuBtn.classList.remove('fa-times');
      menuBtn.classList.add('fa-bars');
    }

    if (closeSidebar) closeSidebar.style.display = 'none';
  }

  if (menuBtn && sidebar && overlay && closeSidebar) {
    menuBtn.onclick = () => {
      sidebar.classList.add('active');
      overlay.classList.add('active');

      menuBtn.classList.remove('fa-bars');
      menuBtn.classList.add('fa-times');

      closeSidebar.style.display = 'block';
    };

    overlay.onclick = closeMenu;
    closeSidebar.onclick = closeMenu;

    document.querySelectorAll('#sidebar ul li a').forEach(link => {
      link.addEventListener('click', closeMenu);
    });
  }

  // ===== Hero Slider =====
  let currentSlide = 0;
  const slides = document.querySelectorAll('.hero-slide');
  const dotsContainer = document.querySelector('.hero-dots');

  if (dotsContainer && slides.length > 0) {

    slides.forEach((_, i) => {
      const dot = document.createElement('span');

      dot.classList.add('dot');

      if (i === 0) {
        dot.classList.add('active');
      }

      dot.addEventListener('click', () => {
        showSlide(i);
        resetAutoSlide();
      });

      dotsContainer.appendChild(dot);
    });

    const dots = document.querySelectorAll('.dot');

    function showSlide(n) {
      slides.forEach(slide => slide.classList.remove('active'));
      dots.forEach(dot => dot.classList.remove('active'));

      slides[n].classList.add('active');
      dots[n].classList.add('active');

      currentSlide = n;
    }

    function nextSlide() {
      currentSlide = (currentSlide + 1) % slides.length;
      showSlide(currentSlide);
    }

    let autoSlide = setInterval(nextSlide, 5000);

    function resetAutoSlide() {
      clearInterval(autoSlide);
      autoSlide = setInterval(nextSlide, 5000);
    }

    let startX = 0;
    let endX = 0;

    const hero = document.querySelector('.hero');

    if (hero) {

      hero.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        clearInterval(autoSlide);
      });

      hero.addEventListener('touchend', (e) => {
        endX = e.changedTouches[0].clientX;

        const swipeDistance = endX - startX;

        if (swipeDistance > 50) {
          currentSlide = (currentSlide - 1 + slides.length) % slides.length;
          showSlide(currentSlide);
        }

        if (swipeDistance < -50) {
          nextSlide();
        }

        autoSlide = setInterval(nextSlide, 5000);
      });
    }
  }
});


// ===== Firebase =====

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";


const firebaseConfig = {
  apiKey: "AIzaSyCx0TEmgr3GCyvfeok9Y42yR1PTM4_8y9M",
  authDomain: "magical-movie-land.firebaseapp.com",
  projectId: "magical-movie-land",
  storageBucket: "magical-movie-land.firebasestorage.app",
  messagingSenderId: "27757424288",
  appId: "1:27757424288:web:93f8549fc39e4537c823c5"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


// ===== Admin Panel - Add Movie =====

window.addMovie = async function () {

  const title = document.getElementById("title").value;
  const poster = document.getElementById("poster").value;
  const video = document.getElementById("video").value;

  if (!title || !poster || !video) {
    alert("Please fill all fields");
    return;
  }

  await addDoc(collection(db, "movies"), {
    title,
    poster,
    video
  });

  alert("Movie Added Successfully");

  document.getElementById("title").value = "";
  document.getElementById("poster").value = "";
  document.getElementById("video").value = "";
};


// ===== Auto Load Movies =====

async function loadMovies() {

  const movieGrid = document.getElementById("latestMovies");

  if (!movieGrid) return;

  const snapshot = await getDocs(collection(db, "movies"));

  movieGrid.innerHTML = "";

  snapshot.forEach((doc) => {

    const movie = doc.data();

    movieGrid.innerHTML += `
      <a href="${movie.video}" style="text-decoration:none; color:inherit;">
        <div class="movie-card">
          <img src="${movie.poster}" alt="${movie.title}">
          <div class="card-info">
            <h3>${movie.title}</h3>
            <p>Movie Land</p>
          </div>
        </div>
      </a>
    `;
  });
}

loadMovies();