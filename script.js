import { supabase } from './supabase-config.js';
import { initGlobe } from './globe.js';

window.initHeroAutoScroll = () => {
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  if (currentPath === 'index.html' || currentPath === '') return;

  const hero = document.querySelector('.page-hero, .hero');
  if (!hero) return;
  
  let nextSection = hero.nextElementSibling;
  while (nextSection && (nextSection.tagName === 'SCRIPT' || nextSection.tagName === 'STYLE')) {
    nextSection = nextSection.nextElementSibling;
  }
  if (!nextSection) return;

  let userInteracted = false;
  let scrollTimer;
  
  const cancelScroll = () => {
    userInteracted = true;
    cleanup();
  };
  
  const cleanup = () => {
    clearTimeout(scrollTimer);
    window.removeEventListener('wheel', cancelScroll);
    window.removeEventListener('touchstart', cancelScroll);
    window.removeEventListener('keydown', cancelScroll);
    window.removeEventListener('mousedown', cancelScroll);
  };

  setTimeout(() => {
    window.addEventListener('wheel', cancelScroll, { passive: true, once: true });
    window.addEventListener('touchstart', cancelScroll, { passive: true, once: true });
    window.addEventListener('keydown', cancelScroll, { passive: true, once: true });
    window.addEventListener('mousedown', cancelScroll, { passive: true, once: true });
  }, 100);
  
  scrollTimer = setTimeout(() => {
    cleanup();
    // Only auto-scroll if the user hasn't scrolled manually
    if (!userInteracted && window.scrollY < 50) {
      nextSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, 1000);
};

document.addEventListener('DOMContentLoaded', () => {
  const nav = document.querySelector('.nav');
  const progress = document.querySelector('.progress');
  const menu = document.querySelector('.menu');

  // Handle initial hash in URL on page load (e.g. index.html#about or direct hash navigation)
  if (window.location.hash) {
    setTimeout(() => {
      const targetEl = document.getElementById(window.location.hash.substring(1));
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 200);
  }

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
  window.appObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        window.appObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.reveal').forEach(el => window.appObserver.observe(el));

  // Animated Timeline Track (Scroll-driven progress stepper)
  let scrollTimeout;
  
  function updateTimelineProgress() {
    const timelineTrack = document.querySelector('.timeline-container');
    const progressLine = document.querySelector('.timeline-line-progress');
    
    if (!timelineTrack || !progressLine) return;

    const trackRect = timelineTrack.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const triggerPoint = viewportHeight * 0.5; // Center of screen
    
    // 1. Line progress: calculate % based on scroll past center
    const scrolledPx = triggerPoint - trackRect.top;
    const progressPercent = Math.min(Math.max((scrolledPx / trackRect.height) * 100, 0), 100);
    progressLine.style.height = `${progressPercent}%`;
  }

  window.initTimeline = function() {
    updateTimelineProgress();
    
    // 2. Setup IntersectionObserver for timeline items (reversible, both ways)
    const timelineItems = document.querySelectorAll('.timeline-item');
    if (timelineItems.length > 0) {
      if (window.timelineObserver) {
        window.timelineObserver.disconnect();
      }
      
      window.timelineObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-active');
          } else {
            entry.target.classList.remove('is-active');
          }
        });
      }, { rootMargin: "-40% 0px -40% 0px" });
      
      timelineItems.forEach(item => window.timelineObserver.observe(item));
    }
  };

  // Simple requestAnimationFrame throttle for scroll performance
  window.addEventListener('scroll', () => {
    if (!scrollTimeout) {
      scrollTimeout = requestAnimationFrame(() => {
        updateTimelineProgress();
        scrollTimeout = null;
      });
    }
  }, { passive: true });
  
  // Initial call on load
  window.initTimeline();
  window.initHeroAutoScroll();
});

// Page Transition & Nav Link click logic
document.querySelectorAll('nav a, header a.brand, footer a').forEach(link => {
  link.addEventListener('click', async (e) => {
    const href = link.getAttribute('href');
    if (!href || href.startsWith('http') || link.target === '_blank') return;
    
    const url = new URL(href, window.location.origin);
    const normalizePath = (p) => p.replace(/\/index\.html$/, '/').replace(/\/$/, '') || '/';
    const isSamePage = normalizePath(url.pathname) === normalizePath(window.location.pathname);
    
    if (isSamePage) {
      e.preventDefault();
      if (url.hash) {
        const targetEl = document.getElementById(url.hash.substring(1));
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
          history.pushState(null, '', href);
        }
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        history.pushState(null, '', href);
      }
      return;
    }

    // If navigating to another page that has a hash (e.g. index.html#about from expertise.html)
    if (url.hash) {
      return;
    }

    e.preventDefault();
    
    document.body.classList.add('page-transitioning');
    
    // Wait for fade out animation
    await new Promise(r => setTimeout(r, 200));

    try {
      const res = await fetch(href);
      const html = await res.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      const newMain = doc.querySelector('main');
      if (newMain) {
        document.querySelector('main').innerHTML = newMain.innerHTML;
      }
      
      // update active link
      document.querySelectorAll('nav a').forEach(a => a.classList.remove('active'));
      const currentActive = document.querySelector(`nav a[href="${href}"]`);
      if (currentActive) currentActive.classList.add('active');
      
      history.pushState(null, '', href);
      window.scrollTo({ top: 0, behavior: 'instant' });
      
      document.body.classList.remove('page-transitioning');
      document.body.classList.add('page-loaded');
      
      // Re-init scripts
      if (window.appObserver) {
        document.querySelectorAll('.reveal').forEach(el => {
          el.classList.remove('visible');
          window.appObserver.observe(el);
        });
      }
      if (window.initTimeline) {
        window.initTimeline();
      }
      if (window.initHeroAutoScroll) {
        window.initHeroAutoScroll();
      }
      
      initGlobe();
      
      if (href.includes('work.html') && window.loadWorkGrid) {
        window.loadWorkGrid();
      }
      if (href.includes('experience.html') && window.loadExpGrid) {
        window.loadExpGrid();
      }
      
      setTimeout(() => {
        document.body.classList.remove('page-loaded');
      }, 800);
    } catch (err) {
      window.location.href = href;
    }
  });
});



window.loadWorkGrid = async function() {
  const grid = document.getElementById('dynamic-work-grid');
  if(!grid) return;
  const { data, error } = await supabase.from('work_items').select('*').order('order', { ascending: true });
  if (error) { grid.innerHTML = '<p style="color:red">Error loading work items.</p>'; return; }
  const images = ['image-one', 'image-two', 'image-three', 'image-one', 'image-two'];
  const graphics = ['<div class="shape"></div>', '<div class="bars"></div>', '<div class="circle"></div>'];
  grid.innerHTML = data.map((item, index) => {
    const img = images[index % images.length];
    const grp = graphics[index % graphics.length];
    const lrg = item.is_large ? 'large' : '';
    return `
      <article class="case ${lrg} reveal">
        <div class="case-image ${img}">
          <span>Project / 0${item.order}</span>
          ${grp}
        </div>
        <div class="case-meta">
          <p>${item.tag_line || ''}</p>
          <h3>${item.title}</h3>
          <p class="muted">${item.description}</p>
          ${item.link_url ? `<a class="text-link" href="${item.link_url}">${item.link_label || 'View'} <b>↗</b></a>` : ''}
        </div>
      </article>
    `;
  }).join('');
  setTimeout(() => {
    document.querySelectorAll('#dynamic-work-grid .reveal').forEach(el => {
      el.classList.add('visible');
      if(window.appObserver) window.appObserver.observe(el);
    });
  }, 100);
};

window.loadExpGrid = async function() {
  const grid = document.getElementById('dynamic-exp-grid');
  if(!grid) return;
  const { data, error } = await supabase.from('experience_items').select('*').order('order', { ascending: true });
  if (error) { grid.innerHTML += '<p style="color:red">Error loading experience items.</p>'; return; }
  
  // Clear any placeholder/existing content except the track
  const trackHTML = `
    <div class="timeline-line-track">
      <div class="timeline-line-progress"></div>
    </div>
  `;
  
  grid.innerHTML = trackHTML + data.map((item, index) => `
    <div class="timeline-item">
      <div class="timeline-checkbox" aria-hidden="true">
        <svg viewBox="0 0 24 24">
          <path d="M5 12l5 5L20 7" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <div class="timeline-card">
        <span class="timeline-date">${item.date_range || `STEP 0${index + 1}`}</span>
        <h3 class="timeline-title">${item.title}</h3>
        <p class="timeline-desc">${item.description ? item.description.replace(/\n/g, '<br>') : ''}</p>
        <b>↗</b>
      </div>
    </div>
  `).join('');
  
  if (window.initTimeline) {
    window.initTimeline();
  }
};

function initDataLoad() {
  if (window.location.pathname.includes('work.html')) window.loadWorkGrid();
  if (window.location.pathname.includes('experience.html')) window.loadExpGrid();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDataLoad);
} else {
  initDataLoad();
}

initGlobe();
