document.addEventListener('DOMContentLoaded', () => {

  // ===== 1. Header + Sidebar + Overlay Auto Inject =====
  const header = document.querySelector('header');
  if (header) {
    header.innerHTML = `
      <div class="logo">MAGICAL <span>MOVIE LAND</span></div>
      <div class="header-right">
        <i class="fa fa-search" id="searchBtn"></i>
        <i class="fa fa-bars" id="menuBtn"></i>
      </div>

      <!-- Sidebar Menu -->
      <div class="sidebar" id="sidebar">
        <i class="fa fa-times close-btn" id="closeSidebar"></i>
        <ul>
          <li><a href="index.html">Home</a></li>
          <li><a href="#">Movies</a></li>
          <li><a href="#">Cartoon</a></li>
          <li><a href="#">Sinhala Dubbed</a></li>
          <li><a href="#">Contact</a></li>
        </ul>
      </div>

      <!-- Overlay -->
      <div class="overlay" id="overlay"></div>
    `;
  }

  // ===== 2. Menu Toggle + Sidebar Close =====
  const menuBtn = document.getElementById('menuBtn');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('overlay');
  const closeSidebar = document.getElementById('closeSidebar');

  if (menuBtn && sidebar && overlay && closeSidebar) {
    menuBtn.onclick = () => {
      sidebar.classList.add('active');
      overlay.classList.add('active');
      menuBtn.classList.remove('fa-bars');
      menuBtn.classList.add('fa-times');
      closeSidebar.style.display = 'block';
    }

    overlay.onclick = closeMenu;
    closeSidebar.onclick = closeMenu;

    function closeMenu(){
      sidebar.classList.remove('active');
      overlay.classList.remove('active');
      menuBtn.classList.remove('fa-times');
      menuBtn.classList.add('fa-bars');
      closeSidebar.style.display = 'none';
    }

    // Link click කරාම menu close වෙන code එක
    document.querySelectorAll('.sidebar ul li a').forEach(link => {
      link.addEventListener('click', () => {
        closeMenu();
      });
    });
  }

  // ===== 3. Hero Slider - Auto + Dots + Swipe =====
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
        // දකුණට swipe = පරණ slide
        if (swipeDistance > 50) {
          currentSlide = (currentSlide - 1 + slides.length) % slides.length;
          showSlide(currentSlide);
        }
        // වම්පැත්තට swipe = අලුත් slide
        if (swipeDistance < -50) {
          nextSlide();
        }
      }
    }
  }

  // ===== 4. Search Toggle - ඕන නම් පහලින් code එක දාපන් =====
  // const searchBtn = document.getElementById('searchBtn');
  // const searchBox = document.getElementById('searchBox');
  // const closeSearch = document.getElementById('closeSearch');

});