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
