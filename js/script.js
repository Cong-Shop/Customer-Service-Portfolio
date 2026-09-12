  const els = document.querySelectorAll('.reveal');
  els.forEach(el => el.classList.remove('in'));
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.15 });
  els.forEach(el => io.observe(el));

  // magnetic glow buttons: track pointer position per button
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('pointermove', (e) => {
      const r = btn.getBoundingClientRect();
      const mx = ((e.clientX - r.left) / r.width) * 100;
      const my = ((e.clientY - r.top) / r.height) * 100;
      btn.style.setProperty('--mx', mx + '%');
      btn.style.setProperty('--my', my + '%');
    });
  });

  // liquid nav: highlight the link for the section currently under the nav
  const navLinks = document.querySelectorAll('.nav-inner a');
  const navSections = Array.from(navLinks)
    .map(a => document.getElementById(a.dataset.section))
    .filter(Boolean);

  if (navSections.length) {
    const OFFSET = 110; // roughly nav height + breathing room
    let ticking = false;

    function updateActiveNav() {
      let currentId = navSections[0].id;
      navSections.forEach(sec => {
        if (sec.getBoundingClientRect().top <= OFFSET) {
          currentId = sec.id;
        }
      });
      navLinks.forEach(a => {
        a.classList.toggle('active', a.dataset.section === currentId);
      });
      ticking = false;
    }

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(updateActiveNav);
        ticking = true;
      }
    }, { passive: true });

    updateActiveNav();
  }

  // 3D parallax floating tools gallery (Work page)
  const parallaxStage = document.getElementById('toolsParallax');
  if (parallaxStage) {
    const floaters = Array.from(parallaxStage.querySelectorAll('.float-logo'));
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let rafId = null;

    function updateParallax() {
      const rect = parallaxStage.getBoundingClientRect();
      const viewportH = window.innerHeight;
      // progress runs roughly from +1 (stage below viewport) to -1 (stage above viewport)
      const progress = ((rect.top + rect.height / 2) - viewportH / 2) / (viewportH / 2 + rect.height / 2);
      floaters.forEach(el => {
        const speed = parseFloat(el.dataset.speed || '0.1');
        const offset = -progress * speed * 220;
        el.style.setProperty('--py', offset.toFixed(1) + 'px');
      });
      rafId = null;
    }

    function onScroll() {
      if (rafId === null) rafId = requestAnimationFrame(updateParallax);
    }

    if (!reduceMotion) {
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll);
      updateParallax();
    }
  }

  // modern carousel (Work page): arrows, dots, swipe, autoplay
  const track = document.getElementById('carouselTrack');
  if (track) {
    const slides = Array.from(track.children);
    const dotsWrap = document.getElementById('carouselDots');
    const prevBtn = document.querySelector('.carousel-btn.prev');
    const nextBtn = document.querySelector('.carousel-btn.next');
    let index = 0;
    let autoplayTimer = null;

    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', 'Go to slide ' + (i + 1));
      dot.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(dot);
    });
    const dots = Array.from(dotsWrap.children);

    function render() {
      track.style.transform = 'translateX(' + (-index * 100) + '%)';
      dots.forEach((d, i) => d.classList.toggle('active', i === index));
    }
    function goTo(i) {
      index = (i + slides.length) % slides.length;
      render();
      resetAutoplay();
    }
    function next() { goTo(index + 1); }
    function prev() { goTo(index - 1); }

    function resetAutoplay() {
      if (autoplayTimer) clearInterval(autoplayTimer);
      autoplayTimer = setInterval(next, 5000);
    }

    nextBtn.addEventListener('click', next);
    prevBtn.addEventListener('click', prev);

    // swipe support
    let startX = null;
    track.addEventListener('pointerdown', (e) => { startX = e.clientX; });
    track.addEventListener('pointerup', (e) => {
      if (startX === null) return;
      const diff = e.clientX - startX;
      if (Math.abs(diff) > 40) { diff < 0 ? next() : prev(); }
      startX = null;
    });

    const carousel = document.getElementById('workCarousel');
    carousel.addEventListener('mouseenter', () => clearInterval(autoplayTimer));
    carousel.addEventListener('mouseleave', resetAutoplay);

    render();
    resetAutoplay();
  }
