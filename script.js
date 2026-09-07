document.addEventListener('DOMContentLoaded', () => {
  const nav = document.querySelector('.nav');
  const progress = document.querySelector('.progress');
  const menu = document.querySelector('.menu');

  // Scroll Progress and Header Scrolled state
  window.addEventListener('scroll', () => {
    if (nav) {
      nav.classList.toggle('scrolled', window.scrollY > 20);
    }
    if (progress) {
      const scrollTotal = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = scrollTotal > 0 ? `${(window.scrollY / scrollTotal) * 100}%` : '0%';
    }
  }, { passive: true });

  // Mobile Menu Toggle
  if (menu && nav) {
    menu.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('open');
      menu.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    document.querySelectorAll('nav a').forEach(a => {
      a.addEventListener('click', () => nav.classList.remove('open'));
    });
  }

  // Active Link Highlighting based on current path
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('nav a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === 'index.html' && href.startsWith('#')) || (currentPath === '' && href === 'index.html')) {
      if (href === currentPath || (currentPath === 'index.html' && href === 'index.html')) {
        link.classList.add('active');
      }
    }
  });

  // Scroll Reveal Animations for generic reveal elements
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

  // Animated Timeline Track & Auto-Checking Checkboxes
  const timelineTrack = document.querySelector('.timeline-container');
  const progressLine = document.querySelector('.timeline-line-progress');
  const timelineItems = document.querySelectorAll('.timeline-item');

  function updateTimeline() {
    if (!timelineTrack || !progressLine) return;

    const trackRect = timelineTrack.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    // Trigger point is 70% down the screen for a smooth scroll feel
    const triggerPoint = viewportHeight * 0.7;

    const scrolledPx = triggerPoint - trackRect.top;
    const totalPx = trackRect.height;
    const progressPercent = Math.min(Math.max((scrolledPx / totalPx) * 100, 0), 100);

    progressLine.style.height = `${progressPercent}%`;

    timelineItems.forEach(item => {
      const itemRect = item.getBoundingClientRect();
      if (itemRect.top <= triggerPoint) {
        item.classList.add('visible');
        item.classList.add('checked');
      } else {
        item.classList.remove('checked');
      }
    });
  }

  if (timelineTrack) {
    window.addEventListener('scroll', updateTimeline, { passive: true });
    updateTimeline(); // Initial check on load
  }
});
