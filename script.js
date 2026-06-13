document.addEventListener('DOMContentLoaded', () => {

  // ===== Menu Toggle =====
  const menuBtn = document.getElementById('menuBtn');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('overlay');
  const closeSidebar = document.getElementById('closeSidebar');

  function closeMenu(){
    if(sidebar) sidebar.classList.remove('active');
    if(overlay) overlay.classList.remove('active');
    if(menuBtn){
      menuBtn.classList.remove('fa-times');
      menuBtn.classList.add('fa-bars');
    }
    if(closeSidebar) closeSidebar.style.display = 'none';
  }

  // Menu button click - open sidebar
  if (menuBtn && sidebar && overlay && closeSidebar) {
    menuBtn.onclick = () => {
      sidebar.classList.add('active');
      overlay.classList.add('active');
      menuBtn.classList.remove('fa-bars');
      menuBtn.classList.add('fa-times');
      closeSidebar.style.display = 'block';
    }

    // Overlay click - close sidebar
    overlay.onclick = closeMenu;

    // Close button click - close sidebar
    closeSidebar.onclick = closeMenu;

    // Link click කරාම menu close වෙන code එක
    document.querySelectorAll('#sidebar ul li a').forEach(link => {
      link.addEventListener('click', () => {
        closeMenu();
      });
    });
  } else {
    console.log('Menu elements missing. Check id="menuBtn", id="sidebar", id="overlay", id="closeSidebar"');
  }

  // ===== Hero Slider - Auto + Dots + Swipe =====
  let currentSlide = 0;
  const slides = document.querySelectorAll('.hero-slide');
  const dotsContainer = document.querySelector('.hero-dots');

  if (dotsContainer && slides.length > 0) {
    // Dots හදනවා
    slides.forEach((_, i) => {
      const dot = document.createElement('span');
      dot.classList.add('dot');
      if (i === 0) dot.classList.add('active');
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

    // Auto slide - තත්පර 5
    let autoSlide = setInterval(nextSlide, 5000);

    function resetAutoSlide() {
      clearInterval(autoSlide);
      autoSlide = setInterval(nextSlide, 5000);
    }

    // Swipe කරලා slide මාරු කරන code - Mobile only
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
        handleSwipe();
        autoSlide = setInterval(nextSlide, 5000);
      });

      function handleSwipe() {
        const swipeDistance = endX - startX;

        if (swipeDistance > 50) {
          currentSlide = (currentSlide - 1 + slides.length) % slides.length;
          showSlide(currentSlide);
        }

        if (swipeDistance < -50) {
          nextSlide();
        }
      }
    }
  }

}); // DOMContentLoaded අවසාන bracket එක

import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";

import {
  getFirestore,
  collection,
  addDoc
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

window.addMovie = async function () {
  await addDoc(collection(db, "movies"), {
    title: document.getElementById("title").value,
    poster: document.getElementById("poster").value,
    video: document.getElementById("video").value
  });

  alert("Movie Added Successfully");
};