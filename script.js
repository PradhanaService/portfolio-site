import { supabase } from './supabase-config.js';
import { initGlobe } from './globe.js';

let _heroAutoScrollCleanup = null;

window.initHeroAutoScroll = () => {
  if (_heroAutoScrollCleanup) {
    _heroAutoScrollCleanup();
    _heroAutoScrollCleanup = null;
  }

  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  if (currentPath === 'index.html' || currentPath === '' || currentPath.includes('experience.html')) return;

  const hero = document.querySelector('.page-hero, .hero');
  if (!hero) return;

  let nextSection = hero.nextElementSibling;
  while (nextSection && (nextSection.tagName === 'SCRIPT' || nextSection.tagName === 'STYLE')) {
    nextSection = nextSection.nextElementSibling;
  }
  if (!nextSection) return;

  // Skip auto-scroll if the user has already scrolled past the hero section
  if (window.scrollY > 50) return;

  let userInteracted = false;
  let scrollTimer = null;
  let onSearchCompleteHandler = null;

  const cancelScroll = () => {
    userInteracted = true;
    cleanup();
  };

  const cleanup = () => {
    if (scrollTimer) {
      clearTimeout(scrollTimer);
      scrollTimer = null;
    }
    if (onSearchCompleteHandler) {
      window.removeEventListener('searchAnimationComplete', onSearchCompleteHandler);
      onSearchCompleteHandler = null;
    }
    window.removeEventListener('wheel', cancelScroll);
    window.removeEventListener('touchstart', cancelScroll);
    window.removeEventListener('pointerdown', cancelScroll);
    window.removeEventListener('keydown', cancelScroll);
    window.removeEventListener('mousedown', cancelScroll);
  };

  _heroAutoScrollCleanup = cleanup;

  setTimeout(() => {
    window.addEventListener('wheel', cancelScroll, { passive: true, once: true });
    window.addEventListener('touchstart', cancelScroll, { passive: true, once: true });
    window.addEventListener('pointerdown', cancelScroll, { passive: true, once: true });
    window.addEventListener('keydown', cancelScroll, { passive: true, once: true });
    window.addEventListener('mousedown', cancelScroll, { passive: true, once: true });
  }, 50);

  const performScroll = (targetEl) => {
    cleanup();
    if (!userInteracted && window.scrollY < 50) {
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (currentPath.includes('expertise.html')) {
    // 1. expertise.html: Wait 1.5 seconds, then smooth-scroll down to content section
    scrollTimer = setTimeout(() => {
      performScroll(nextSection);
    }, 1500);
  } else if (currentPath.includes('services.html')) {
    // 2. services.html: Auto-scroll when searchAnimationComplete event is received (first sequence)
    const targetSection = document.querySelector('.services') || nextSection;
    onSearchCompleteHandler = () => {
      performScroll(targetSection);
    };
    window.addEventListener('searchAnimationComplete', onSearchCompleteHandler, { once: true });
  } else {
    // Default fallback delay (1s) for other pages if applicable
    scrollTimer = setTimeout(() => {
      performScroll(nextSection);
    }, 1000);
  }
};

window.initGridGlow = () => {
  const heroGrids = document.querySelectorAll('.hero-grid');
  if (!heroGrids.length) return;

  heroGrids.forEach(heroGrid => {
    const isMobile = window.innerWidth <= 768;
    const cellSize = isMobile ? 40 : 54;
    const numGlows = isMobile ? 14 : 10;

    // Clear existing glows on resize/re-init to prevent duplicates
    heroGrid.querySelectorAll('.grid-glow').forEach(g => g.remove());

    for (let i = 0; i < numGlows; i++) {
      const glow = document.createElement('div');
      glow.classList.add('grid-glow');
      glow.style.width = `${cellSize - 1}px`;
      glow.style.height = `${cellSize - 1}px`;
      glow.style.pointerEvents = 'none';
      glow.style.zIndex = '0';
      heroGrid.appendChild(glow);

      setTimeout(() => animateGlow(glow, cellSize, heroGrid), Math.random() * 2000);
    }
  });

  function animateGlow(el, size, heroGrid) {
    if (!heroGrid.clientWidth || !heroGrid.clientHeight) return;

    const cols = Math.floor(heroGrid.clientWidth / size);
    const rows = Math.floor(heroGrid.clientHeight / size);
    if (cols <= 0 || rows <= 0) return;

    const col = Math.floor(Math.random() * cols);
    const row = Math.floor(Math.random() * rows);

    el.style.left = `${col * size}px`;
    el.style.top = `${row * size}px`;

    el.style.animation = 'none';
    el.offsetHeight;

    const duration = 1800 + Math.random() * 2500;
    el.style.animation = `glowFade ${duration}ms ease-in-out forwards`;

    setTimeout(() => animateGlow(el, size, heroGrid), duration + 300);
  }
};

document.addEventListener('DOMContentLoaded', () => {
  const nav = document.querySelector('.nav');
  const detailNav = document.querySelector('.detail-nav');
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
    if (detailNav) {
      detailNav.classList.toggle('scrolled', window.scrollY > 20);
    }
    if (progress) {
      const scrollTotal = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = scrollTotal > 0 ? `${(window.scrollY / scrollTotal) * 100}%` : '0%';
    }
  }, { passive: true });

  // Mobile Menu Toggle
  if (menu && nav) {
    menu.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = nav.classList.toggle('open');
      menu.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    document.querySelectorAll('nav a').forEach(a => {
      a.addEventListener('click', () => {
        nav.classList.remove('open');
        menu.setAttribute('aria-expanded', 'false');
      });
    });

    document.addEventListener('click', (e) => {
      if (nav.classList.contains('open') && !nav.contains(e.target)) {
        nav.classList.remove('open');
        menu.setAttribute('aria-expanded', 'false');
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && nav.classList.contains('open')) {
        nav.classList.remove('open');
        menu.setAttribute('aria-expanded', 'false');
      }
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
  window.checkRevealInViewport = function() {
    const vh = window.innerHeight || document.documentElement.clientHeight || 800;
    document.querySelectorAll('.reveal').forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top <= vh * 0.98 && rect.bottom >= -50) {
        el.classList.add('visible');
      }
    });
  };

  window.appObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting || (entry.boundingClientRect && entry.boundingClientRect.top < (window.innerHeight || 800))) {
        entry.target.classList.add('visible');
        window.appObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.01, rootMargin: '50px 0px 50px 0px' });

  document.querySelectorAll('.reveal').forEach(el => window.appObserver.observe(el));
  window.checkRevealInViewport();

  if (detailNav) {
    detailNav.querySelector('.project-back')?.addEventListener('click', returnToWorkGrid);
  }

  const floatingBtn = document.querySelector('.floating-work-btn');
  if (floatingBtn) {
    floatingBtn.addEventListener('click', (e) => {
      if (window.location.pathname.endsWith('work.html') || window.location.pathname.includes('work')) {
        const workDetail = document.getElementById('work-detail');
        if (workDetail && !workDetail.hidden) {
          e.preventDefault();
          returnToWorkGrid(e);
        } else {
          const workListing = document.getElementById('work-listing');
          if (workListing) {
            e.preventDefault();
            workListing.scrollIntoView({ behavior: 'smooth' });
          }
        }
      }
    });
  }

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

    // 2. Stepper check for each timeline item (tick marks stay checked once reached by progress line)
    const timelineItems = document.querySelectorAll('.timeline-item');
    timelineItems.forEach(item => {
      const checkbox = item.querySelector('.timeline-checkbox');
      const targetPoint = checkbox ? (checkbox.getBoundingClientRect().top + checkbox.offsetHeight * 0.5) : item.getBoundingClientRect().top;
      
      // When the progress line reaches or passes this checkbox
      if (targetPoint <= triggerPoint + 10) {
        item.classList.add('is-passed');
      } else {
        item.classList.remove('is-passed');
      }
    });
  }

  window.initTimeline = function() {
    updateTimelineProgress();
    
    // 2. Setup IntersectionObserver for timeline items (current focal item)
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

  window.initSkillCards = () => {
    const skills = document.querySelectorAll('.skill');
    const skillGrid = document.querySelector('.skill-grid');
    if (!skills.length || !skillGrid) return;
    
    // Manage counter animation
    const animateCounter = (el, target, duration = 1200) => {
      if (el._rafId) cancelAnimationFrame(el._rafId);
      const startTime = performance.now();
      
      const updateCounter = (currentTime) => {
        const elapsedTime = currentTime - startTime;
        if (elapsedTime < duration) {
          // Easing cubic-bezier(0.22, 1, 0.36, 1) approximation (easeOutQuint)
          const t = elapsedTime / duration;
          const progress = 1 - Math.pow(1 - t, 5);
          const current = Math.floor(progress * target);
          el.innerText = current + '%';
          el._rafId = requestAnimationFrame(updateCounter);
        } else {
          el.innerText = target + '%';
          el._rafId = null;
        }
      };
      
      el._rafId = requestAnimationFrame(updateCounter);
    };

    const resetSkill = (skill) => {
      skill.classList.remove('is-expanded', 'is-hover-expanded');
      skill.removeAttribute('data-pinned');
      skill.style.removeProperty('--meter-target');
      skill.style.removeProperty('--mobile-skill-height');
      const valueEl = skill.querySelector('.meter-value');
      if (valueEl) {
        if (valueEl._rafId) cancelAnimationFrame(valueEl._rafId);
        valueEl.innerText = '0%';
      }
    };

    const showMeter = (skill) => {
      const potential = skill.getAttribute('data-potential') || '0';
      skill.style.setProperty('--meter-target', `${potential}%`);
      const valueEl = skill.querySelector('.meter-value');
      if (valueEl) animateCounter(valueEl, parseInt(potential, 10));
    };

    const showHoverCard = (skill) => {
      if (skill.classList.contains('is-hover-expanded')) return;
      skills.forEach(otherSkill => {
        if (otherSkill !== skill && otherSkill.dataset.pinned !== 'true') {
          resetSkill(otherSkill);
        }
      });
      skill.classList.add('is-hover-expanded');
      showMeter(skill);
    };

    skillGrid.addEventListener('mousemove', (event) => {
      if (window.innerWidth <= 700) return;
      // Do not change card on hover if a card is pinned by click
      if (Array.from(skills).some(s => s.dataset.pinned === 'true')) return;

      const gridBounds = skillGrid.getBoundingClientRect();
      const column = Math.min(2, Math.max(0, Math.floor(((event.clientX - gridBounds.left) / gridBounds.width) * 3)));
      const row = Math.min(1, Math.max(0, Math.floor(((event.clientY - gridBounds.top) / gridBounds.height) * 2)));
      const skill = skills[row * 3 + column];
      if (skill) showHoverCard(skill);
    });

    skillGrid.addEventListener('mouseleave', () => {
      skills.forEach(skill => {
        if (skill.dataset.pinned !== 'true') {
          resetSkill(skill);
        }
      });
    });

    skills.forEach(skill => {
      skill.addEventListener('mouseenter', () => {
        if (window.innerWidth <= 700) return;
        if (Array.from(skills).some(s => s.dataset.pinned === 'true')) return;
        showHoverCard(skill);
      });

      skill.addEventListener('click', (e) => {
        e.stopPropagation();
        if (skill.dataset.pinned === 'true' || skill.classList.contains('is-expanded')) {
          resetSkill(skill);
          return;
        }

        skills.forEach(otherSkill => {
          if (otherSkill !== skill) resetSkill(otherSkill);
        });
        skill.classList.remove('is-hover-expanded');
        skill.classList.add('is-expanded');
        skill.dataset.pinned = 'true';
        showMeter(skill);

        if (window.innerWidth <= 700) {
          setTimeout(() => {
            const rect = skill.getBoundingClientRect();
            if (rect.top < 80) {
              window.scrollBy({ top: rect.top - 85, behavior: 'smooth' });
            }
          }, 150);
        }
      });
    });

    document.addEventListener('click', (e) => {
      if (!skillGrid.contains(e.target)) {
        skills.forEach(skill => {
          if (skill.dataset.pinned === 'true') {
            resetSkill(skill);
          }
        });
      }
    });
  };

  // Initial call on load
  window.initTimeline();
  window.initHeroAutoScroll();
  window.initGridGlow();
  window.initSkillCards();

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (window.initGridGlow) window.initGridGlow();
      if (window.initTimeline) window.initTimeline();
    }, 250);
  });
});

// Page Transition & Nav Link click logic
document.querySelectorAll('nav a, header a.brand, footer a, header a.talk, a.talk').forEach(link => {
  link.addEventListener('click', async (e) => {
    const href = link.getAttribute('href');
    if (!href || href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:') || link.target === '_blank') return;
    
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

    e.preventDefault();
    
    document.body.classList.add('page-transitioning');
    
    // Wait for fade out animation
    await new Promise(r => setTimeout(r, 200));

    try {
      const fetchUrl = url.pathname;
      const res = await fetch(fetchUrl);
      const html = await res.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      const newMain = doc.querySelector('main');
      if (newMain) {
        document.querySelector('main').innerHTML = newMain.innerHTML;
      }
      
      // update active link
      document.querySelectorAll('nav a').forEach(a => a.classList.remove('active'));
      const pageBase = url.pathname.split('/').pop() || 'index.html';
      const currentActive = document.querySelector(`nav a[href="${pageBase}"]`);
      if (currentActive) currentActive.classList.add('active');
      
      history.pushState(null, '', href);
      
      if (url.hash) {
        const hashId = url.hash.substring(1);
        const targetEl = document.getElementById(hashId);
        if (targetEl) {
          setTimeout(() => {
            targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 100);
        } else {
          window.scrollTo({ top: 0, behavior: 'instant' });
        }
      } else {
        window.scrollTo({ top: 0, behavior: 'instant' });
      }
      
      document.body.classList.remove('page-transitioning');
      if (!href.includes('project=')) {
        document.body.classList.remove('project-detail-page');
      }
      document.body.classList.add('page-loaded');
      
      // Re-init scripts
      if (window.appObserver) {
        document.querySelectorAll('.reveal').forEach(el => {
          el.classList.remove('visible');
          window.appObserver.observe(el);
        });
        if (window.checkRevealInViewport) window.checkRevealInViewport();
      }
      if (window.initTimeline) {
        window.initTimeline();
      }
      if (window.initHeroAutoScroll) {
        window.initHeroAutoScroll();
      }

      if (window.initSkillCards) {
        window.initSkillCards();
      }
      
      if (window.initGridGlow) {
        window.initGridGlow();
      }

      // Re-init page-specific hero animations after SPA swap
      if (href.includes('expertise.html')) {
        const hadPingPong = !!window.initLogoPingPong;
        import('./logo-pingpong.js').then(() => {
          if (hadPingPong && window.initLogoPingPong) window.initLogoPingPong();
        });
      }
      if (href.includes('services.html')) {
        const hadSearchAnim = !!window.initServicesSearchAnimation;
        import('./services-search-animation.js').then(() => {
          if (hadSearchAnim && window.initServicesSearchAnimation) window.initServicesSearchAnimation();
        });
      }
      
      initGlobe();
      
      if (href.includes('work.html')) {
        if (window.loadWorkGrid) window.loadWorkGrid();
        if (window.initWorkAnim) window.initWorkAnim();
      }
      if (href.includes('experience.html')) {
        if (window.loadExpGrid) window.loadExpGrid();
        if (window.initTimeline) window.initTimeline();
        setTimeout(() => { if (window.renderHeroBarChart) window.renderHeroBarChart(); }, 50);
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
  if (error) { grid.innerHTML = '<p class="muted">Work items could not be loaded right now.</p>'; return; }
  const images = ['image-one', 'image-two', 'image-three', 'image-one', 'image-two'];
  const graphics = ['<div class="shape"></div>', '<div class="bars"></div>', '<div class="circle"></div>'];
  grid.innerHTML = data.map((item, index) => {
    const img = images[index % images.length];
    const grp = graphics[index % graphics.length];
    const lrg = item.is_large ? 'large' : '';
    return `
      <a class="case ${lrg} reveal case-card-link" href="work.html?project=${encodeURIComponent(item.id)}" aria-label="View ${escapeHTML(item.title)} project details">
        <div class="case-image ${img}">
          <span>Project / ${String(item.order || index + 1).padStart(2, '0')}</span>
          ${grp}
        </div>
        <div class="case-meta">
          <p>${escapeHTML(item.tag_line || '')}</p>
          <h3>${escapeHTML(item.title || 'Untitled project')} <span class="case-card-arrow" aria-hidden="true">↗</span></h3>
          <p class="muted">${escapeHTML(item.description || '')}</p>
        </div>
      </a>
    `;
  }).join('');
  if (!grid.dataset.hasClickListener) {
    grid.dataset.hasClickListener = 'true';
    grid.addEventListener('click', (e) => {
      const card = e.target.closest('.case-card-link');
      if (card) {
        e.preventDefault();
        const href = card.getAttribute('href');
        history.pushState(null, '', href);
        window.loadWorkDetail();
      }
    });
  }
  setTimeout(() => {
    document.querySelectorAll('#dynamic-work-grid .reveal').forEach(el => {
      el.classList.add('visible');
      if(window.appObserver) window.appObserver.observe(el);
    });
  }, 100);
};

function escapeHTML(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[char]);
}

function getProjectClient(project) {
  return project.client_name || project.client || project.clientName || project.customer_name || '';
}

function isExternalURL(value) {
  return /^https?:\/\//i.test(value || '');
}

window.loadWorkDetail = async function() {
  const detail = document.getElementById('work-detail');
  if (!detail) return;

  const projectId = new URLSearchParams(window.location.search).get('project');
  if (!projectId) {
    window.location.replace('work.html');
    return;
  }

  document.body.classList.add('project-detail-page');
  const listing = document.getElementById('work-listing');
  const detailNav = document.querySelector('.detail-nav');
  if (listing) listing.hidden = true;
  detail.hidden = false;
  if (detailNav) detailNav.hidden = false;

  detail.classList.remove('project-opening', 'project-closing');
  void detail.offsetWidth;
  detail.classList.add('project-opening');
  setTimeout(() => detail.classList.remove('project-opening'), 500);
  window.scrollTo({ top: 0, behavior: 'instant' });

  console.log('[loadWorkDetail] Fetching project ID:', projectId);
  const { data: project, error } = await supabase.from('work_items').select('*').eq('id', projectId).maybeSingle();
  console.log('[loadWorkDetail] Supabase result:', { projectId, error, project });

  if (error || !project) {
    console.error('[loadWorkDetail] Failed to load project:', { projectId, error, project });
    detail.hidden = false;
    detail.innerHTML = `<div class="project-not-found"><p class="eyebrow">Project / unavailable</p><h1>This project couldn’t be found.</h1><a class="project-back" href="work.html">← <span>Back to all projects</span></a></div>`;
    return;
  }

  const title = escapeHTML(project.title || 'Untitled project');
  const category = escapeHTML(project.tag_line || '');
  const description = escapeHTML(project.overview || project.overview_text || project.description || '');
  const client = escapeHTML(getProjectClient(project) || 'Independent project');
  const liveURL = isExternalURL(project.live_site_url) ? project.live_site_url : (isExternalURL(project.link_url) ? project.link_url : '');
  const liveLabel = escapeHTML(project.live_site_label || project.link_label || 'Visit live site');
  const reviewURL = project.review_url || 'index.html#contact';
  const reviewTarget = isExternalURL(reviewURL) ? ' target="_blank" rel="noopener noreferrer"' : '';
  const challenge = escapeHTML(project.challenge_text || '');
  const approach = escapeHTML(project.approach_text || '');
  const processSteps = Array.isArray(project.process_steps)
    ? project.process_steps.filter(step => step && typeof step.title === 'string' && typeof step.description === 'string')
    : [];
  const outcomes = Array.isArray(project.outcomes)
    ? project.outcomes.filter(outcome => outcome && typeof outcome.icon_label === 'string' && typeof outcome.value === 'string' && typeof outcome.description === 'string')
    : [];

  const categoryColors = {
    'SEO': { a: '#223962', b: '#14203a', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>' },
    'Meta Ads': { a: '#5a3d82', b: '#151c32', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 10v4h3v7h4v-7h3l1 -4h-4v-2a1 1 0 0 1 1 -1h3v-4h-3a5 5 0 0 0 -5 5v2h-3"></path></svg>' },
    'SMM': { a: '#28585a', b: '#101d2e', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1 -2 2h-7l-4 4v-4h-3a2 2 0 0 1 -2 -2v-10a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2z"></path></svg>' },
    'Content': { a: '#5a2e2e', b: '#1a1010', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h4l10.5 -10.5a1.5 1.5 0 0 0 -4 -4l-10.5 10.5v4"></path><line x1="13.5" y1="6.5" x2="17.5" y2="10.5"></line></svg>' }
  };
  const defaultColor = { a: '#263d77', b: '#1a294b', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"></circle><path d="M12 3v18"></path><path d="M12 8l4.5 4.5m0 -9l-4.5 4.5"></path></svg>' };
  
  const rawTag = (project.tag_line || project.category || '').trim();
  const matchedKey = Object.keys(categoryColors).find(k => rawTag.toLowerCase() === k.toLowerCase());
  const catData = matchedKey ? categoryColors[matchedKey] : defaultColor;
  
  const badgeHTML = category ? `<div class="project-cover-badge">${catData.icon}<span>${category}</span></div>` : '';

  const tagsList = project.services 
    ? (Array.isArray(project.services) ? project.services : project.services.split(','))
    : [];
  
  const brandingStr = project.branding || category || '';
  const durationStr = project.duration || '';

  const metadataColumns = [];
  if (brandingStr) {
    metadataColumns.push(`<div class="project-cover-meta"><span>BRANDING</span><strong>${escapeHTML(brandingStr)}</strong></div>`);
  }
  
  metadataColumns.push(`<div class="project-cover-meta"><span>CLIENT</span><strong>${client}</strong></div>`);
  
  if (durationStr) {
    metadataColumns.push(`<div class="project-cover-meta"><span>DURATION</span><strong>${escapeHTML(durationStr)}</strong></div>`);
  }
  
  if (tagsList.length > 0) {
    metadataColumns.push(`<div class="project-cover-meta"><span>SERVICES</span><strong>${tagsList.map(t => escapeHTML(t.trim())).join('<br>')}</strong></div>`);
  }

  const metadataRowHTML = metadataColumns.length > 0
    ? `<div class="project-cover-metadata-row">${metadataColumns.join('')}</div>`
    : '';

  detail.innerHTML = `
    <section class="project-cover" style="--hero-a: ${catData.a}; --hero-b: ${catData.b};">
      <div class="project-cover-orbit" aria-hidden="true"></div>
      <div class="project-cover-center">
        <h1 class="project-cover-title">${title}</h1>
      </div>
      ${metadataRowHTML}
    </section>
    <div class="project-content">
      <section class="project-story">
      ${description ? `<article class="project-story-section reveal">
        <p class="project-section-index">01 / INTRODUCTION</p>
        <h2>The Project Overview.</h2>
        <p class="project-description">${description}</p>
      </article>` : ''}
      ${challenge || approach ? `<article class="project-story-section project-method reveal">
        <p class="project-section-index">02 / OBSTACLE &amp; METHOD</p>
        <h2>The Challenge &amp; Our Approach.</h2>
        ${challenge ? `<div class="project-method-block"><p class="project-label">THE CHALLENGE</p><p>${challenge}</p></div>` : ''}
        ${approach ? `<div class="project-method-block"><p class="project-label">OUR APPROACH</p><p>${approach}</p></div>` : ''}
      </article>` : ''}
    </section>
    ${processSteps.length ? `<section class="project-process reveal">
      <p class="project-section-index">03 / EXECUTION</p>
      <h2>How We Got There.</h2>
      <div class="project-process-list">${processSteps.map((step, index) => `
        <article class="project-process-card reveal">
          <span>${String(index + 1).padStart(2, '0')}</span>
          <h3>${escapeHTML(step?.title || 'Project step')}</h3>
          <p>${escapeHTML(step?.description || '')}</p>
          <span class="project-process-arrow" aria-hidden="true">↗</span>
        </article>
      `).join('')}</div>
    </section>` : ''}
    ${outcomes.length ? `<section class="project-outcomes reveal">
      <p class="project-section-index">04 / RESULTS</p>
      <h2>Project Outcomes.</h2>
      <div class="project-outcomes-grid">${outcomes.map(outcome => `
        <article class="project-outcome-card">
          <span>${escapeHTML(outcome.icon_label)}</span><strong>${escapeHTML(outcome.value)}</strong><p>${escapeHTML(outcome.description)}</p>
        </article>`).join('')}</div>
    </section>` : ''}
    <section class="project-detail-actions reveal">
      <div class="client-review-block" style="margin-bottom: 90px;">
        <div class="project-review-card is-testimonial">
          <span class="project-label">CLIENT REVIEW</span>
          <strong>"A fantastic experience from start to finish. The results exceeded our expectations!"</strong>
          <span class="project-review-author">— ${client}</span>
        </div>
      </div>
      <div class="review-portal-block">
        <p class="project-section-index" style="margin-bottom: 16px;">05 / FEEDBACK</p>
        <a class="project-review-card" href="${escapeHTML(reviewURL)}"${reviewTarget}>
          <span class="project-label">REVIEW PORTAL</span>
          <strong>Share your experience<br>with this project.</strong>
          <span class="project-review-arrow" aria-hidden="true">↗</span>
        </a>
      </div>
      ${liveURL ? `<div class="project-detail-links"><a class="project-live" href="${escapeHTML(liveURL)}" target="_blank" rel="noopener noreferrer"><span>${liveLabel}</span><span aria-hidden="true">↗</span></a></div>` : ''}
    </section>
    </div>
    <a class="project-view-work" href="work.html">View my works <b>↗</b></a>
  `;
  detail.querySelectorAll('.project-process-card.reveal').forEach((card, index) => {
    card.style.transitionDelay = `${Math.min(index * 90, 360)}ms`;
    if (window.appObserver) window.appObserver.observe(card);
    else card.classList.add('visible');
  });
  detail.querySelectorAll('.project-story-section.reveal, .project-process.reveal, .project-outcomes.reveal, .project-detail-actions.reveal').forEach(section => {
    if (window.appObserver) window.appObserver.observe(section);
    else section.classList.add('visible');
  });
  detail.querySelector('.project-view-work')?.addEventListener('click', returnToWorkGrid);

  const reviewBtn = detail.querySelector('.review-portal-block .project-review-card');
  if (reviewBtn) {
    reviewBtn.addEventListener('click', (e) => {
      const href = reviewBtn.getAttribute('href');
      if (!href || href.includes('#contact') || href === '#') {
        e.preventDefault();
        openReviewModal(project);
      }
    });
  }

  const cover = detail.querySelector('.project-cover');
  if (cover) {
    cover.addEventListener('click', (e) => {
      if (e.target.closest('a, button, .detail-nav')) return;
      
      const nextSection = detail.querySelector('.project-content');
      if (!nextSection) return;

      const targetY = nextSection.getBoundingClientRect().top + window.scrollY;
      const startY = window.scrollY;
      const distance = targetY - startY;
      const duration = 500;
      let startTime = null;

      function easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      }

      function scrollLoop(currentTime) {
        if (!startTime) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const progress = Math.min(timeElapsed / duration, 1);
        const ease = easeInOutCubic(progress);
        
        window.scrollTo(0, startY + distance * ease);
        
        if (timeElapsed < duration) {
          requestAnimationFrame(scrollLoop);
        }
      }
      
      requestAnimationFrame(scrollLoop);
    });
  }

  document.title = `${project.title || 'Project'} — Work | Munish Prabhu K`;
};

function reinitWorkHero() {
  if (window.initHeroAutoScroll) window.initHeroAutoScroll();
  if (window.initGridGlow) window.initGridGlow();
  const heroAnim = document.getElementById('wf-hero-anim') || document.querySelector('.wf-anim');
  if (heroAnim) {
    heroAnim.classList.remove('wf-play', 'wf-done');
    void heroAnim.offsetWidth;
    heroAnim.classList.add('wf-play');
  }
}

async function returnToWorkGrid(event) {
  if (event) event.preventDefault();
  const detail = document.getElementById('work-detail');
  const listing = document.getElementById('work-listing');
  const detailNav = document.querySelector('.detail-nav');
  if (!detail || !listing || detail.classList.contains('project-closing')) return;

  detail.classList.add('project-closing');
  await new Promise(resolve => setTimeout(resolve, 460));
  detail.hidden = true;
  detail.classList.remove('project-closing');
  listing.hidden = false;
  document.body.classList.remove('project-detail-page');
  if (detailNav) detailNav.hidden = true;
  history.pushState(null, '', 'work.html');
  window.scrollTo({ top: 0, behavior: 'instant' });
  document.title = 'Work — Munish Prabhu K | Digital Marketing Executive';
  listing.classList.remove('work-listing-enter');
  void listing.offsetWidth;
  listing.classList.add('work-listing-enter');
  if (window.loadWorkGrid) window.loadWorkGrid();
  reinitWorkHero();
}

window.loadExpGrid = async function() {
  const grid = document.getElementById('dynamic-exp-grid');
  if(!grid) return;
  const { data, error } = await supabase.from('experience_items').select('*').order('order', { ascending: false });
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
      </div>
    </div>
  `).join('');
  
  if (window.initTimeline) {
    window.initTimeline();
  }
  if (window.renderHeroBarChart) {
    window.renderHeroBarChart();
  }
};

window.renderHeroBarChart = function() {
  const chartContainer = document.getElementById('exp-hero-chart');
  if (!chartContainer) return;

  const timelineItems = document.querySelectorAll('#dynamic-exp-grid .timeline-item');
  if (!timelineItems.length) return;

  const validEntries = [];

  timelineItems.forEach(item => {
    const dateEl = item.querySelector('.timeline-date');
    const titleEl = item.querySelector('.timeline-title');
    if (!dateEl) return;

    const dateText = dateEl.textContent.trim();
    const titleText = titleEl ? titleEl.textContent.trim() : '';

    // Extract leading 4-digit year e.g. "2020 — 2023" -> 2020, "2025" -> 2025
    const match = dateText.match(/\b(19\d\d|20\d\d)\b/);
    if (match) {
      let tag = 'Role';
      const titleLower = titleText.toLowerCase();
      if (titleLower.includes('bachelor') || titleLower.includes('college') || titleLower.includes('b.com')) tag = 'Bachelor of Commerce';
      else if (titleLower.includes('certified') || titleLower.includes('certification') || titleLower.includes('workshop')) tag = 'AI Tools Workshop';
      else if (titleLower.includes('executive') || titleLower.includes('bits')) tag = 'BiTS Informatics Exec';
      else if (titleLower.includes('analytics') || titleLower.includes('kgisl')) tag = 'KGiSL Analytics';

      validEntries.push({
        year: parseInt(match[1], 10),
        rawText: match[1],
        title: titleText,
        tag: tag
      });
    }
  });

  if (!validEntries.length) return;

  // Sort chronologically ascending left to right
  validEntries.sort((a, b) => a.year - b.year);

  const total = validEntries.length;
  const stageWidth = 360;
  const gridHeight = 145;

  const minBarPx = 55;
  const maxBarPx = 135;

  const metricTags = ['+0% • Start', '+65% • Cert', '+120% • Spec', '+180% • Exec'];

  // Precise bar heights and Y-coordinates
  const itemsData = validEntries.map((entry, i) => {
    const heightPx = total === 1 
      ? maxBarPx 
      : minBarPx + ((maxBarPx - minBarPx) * (i / (total - 1)));
    const x = (stageWidth / (total + 1)) * (i + 1);
    const topY = gridHeight - heightPx;
    const tag = metricTags[i] || `+${(i + 1) * 45}%`;

    return {
      ...entry,
      x: x.toFixed(1),
      topY: topY.toFixed(1),
      heightPx: heightPx.toFixed(1),
      growthTag: tag
    };
  });

  // Smooth SVG curve passing EXACTLY through topY at each x
  let linePath = `M ${itemsData[0].x} ${itemsData[0].topY}`;
  for (let i = 0; i < itemsData.length - 1; i++) {
    const p0 = itemsData[i];
    const p1 = itemsData[i + 1];
    const cpX1 = (parseFloat(p0.x) + (parseFloat(p1.x) - parseFloat(p0.x)) * 0.5).toFixed(1);
    const cpY1 = p0.topY;
    const cpX2 = (parseFloat(p0.x) + (parseFloat(p1.x) - parseFloat(p0.x)) * 0.5).toFixed(1);
    const cpY2 = p1.topY;
    linePath += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y ? p1.y : p1.topY}`;
  }

  const firstX = itemsData[0].x;
  const lastX = itemsData[itemsData.length - 1].x;
  const areaPath = `${linePath} L ${lastX} ${gridHeight} L ${firstX} ${gridHeight} Z`;

  // Dynamic Column elements — bars start INVISIBLE, JS will reveal one by one
  const colsHTML = itemsData.map((item, index) => {
    return `
      <div class="exp-col" style="left: ${item.x}px;" tabindex="0" data-bar-index="${index}">
        <!-- Callout Badge attached directly above node -->
        <div class="exp-node-tag" style="top: ${item.topY}px;">
          ${item.growthTag}
        </div>

        <!-- Node Dot resting PRECISELY on top of bar & curve -->
        <div class="exp-node-dot" style="left: 50%; top: ${item.topY}px;"></div>

        <!-- Realistic Column Bar: starts scaleY(0), JS adds .bar-loaded one by one -->
        <div class="exp-real-bar" style="height: ${item.heightPx}px;"></div>

        <!-- Hover Tooltip -->
        <div class="exp-col-tooltip">
          <span class="exp-tt-title">${item.rawText} Career Milestone</span>
          <span class="exp-tt-sub">${item.tag}</span>
        </div>

        <!-- X-Axis Year Label -->
        <span class="exp-x-label">${item.rawText}</span>
      </div>
    `;
  }).join('');

  chartContainer.innerHTML = `
    <!-- Widget Header -->
    <div class="exp-widget-head">
      <span class="exp-widget-title">Career Trajectory</span>
      <span class="exp-widget-pill">LIVE TREND</span>
    </div>

    <!-- Main Chart Body -->
    <div class="exp-chart-body">
      <!-- Y-Axis Scale -->
      <div class="exp-y-axis">
        <span>100%</span>
        <span>50%</span>
        <span>0%</span>
      </div>

      <!-- Canvas Stage -->
      <div class="exp-chart-stage">
        <!-- Gridlines -->
        <div class="exp-grid-lines" aria-hidden="true">
          <div class="exp-grid-line"></div>
          <div class="exp-grid-line"></div>
          <div class="exp-grid-line"></div>
        </div>

        <!-- SVG Curve Layer -->
        <svg class="exp-svg-layer" viewBox="0 0 ${stageWidth} ${gridHeight}" preserveAspectRatio="none">
          <defs>
            <linearGradient id="expRealAreaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="rgba(56, 189, 248, 0.35)" />
              <stop offset="100%" stop-color="rgba(56, 189, 248, 0.0)" />
            </linearGradient>
          </defs>
          <path class="exp-area-path" d="${areaPath}" />
          <path class="exp-trend-path" d="${linePath}" />
        </svg>

        <!-- Column Columns -->
        <div class="exp-cols-wrap">
          ${colsHTML}
        </div>
      </div>
    </div>
  `;

  // ── Clear any running timers from a previous visit ──
  if (window.expBarCycleTimer) { clearInterval(window.expBarCycleTimer); window.expBarCycleTimer = null; }
  if (window.expBarStartTimeout) { clearTimeout(window.expBarStartTimeout); window.expBarStartTimeout = null; }
  if (window.expAutoScrollTimeout) { clearTimeout(window.expAutoScrollTimeout); window.expAutoScrollTimeout = null; }
  (window.expBarLoadTimers || []).forEach(t => clearTimeout(t));
  window.expBarLoadTimers = [];

  // Make chart widget visible (SVG paths, grid etc.)
  chartContainer.classList.add('visible', 'exp-animated');

  // Guard against user manually scrolling before auto-scroll fires
  let userHasScrolled = false;
  const onUserScroll = () => { userHasScrolled = true; };
  setTimeout(() => {
    window.addEventListener('wheel',     onUserScroll, { passive: true, once: true });
    window.addEventListener('touchmove', onUserScroll, { passive: true, once: true });
  }, 300);

  // ── PHASE 1: Load bars one-by-one via JS (300ms gap each) ──
  const barEls = chartContainer.querySelectorAll('.exp-col');
  const BAR_STAGGER = 320;   // ms between each bar growing in
  const BAR_ANIM   = 800;   // ms for a single bar to grow (matches CSS 0.8s)

  barEls.forEach((col, i) => {
    const t = setTimeout(() => {
      col.classList.add('bar-loaded');
    }, 300 + i * BAR_STAGGER);   // first bar: 300ms, then every 320ms
    window.expBarLoadTimers.push(t);
  });

  // Total time for all bars to finish = 300 + (n-1)*320 + 800
  const allBarsDone = 300 + (barEls.length > 0 ? (barEls.length - 1) * BAR_STAGGER + BAR_ANIM : 0);

  // ── PHASE 2: Auto-scroll down after all bars have loaded ──
  window.expAutoScrollTimeout = setTimeout(() => {
    if (!userHasScrolled && window.scrollY < 120) {
      const targetGrid = document.getElementById('dynamic-exp-grid') || document.querySelector('.experience.section');
      if (targetGrid) {
        targetGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, allBarsDone + 200);

  // ── PHASE 3: Start seamless info-tooltip cycle after scroll settles ──
  window.expBarStartTimeout = setTimeout(() => {
    const cols = chartContainer.querySelectorAll('.exp-col');
    if (!cols.length) return;

    let activeIndex = 0;
    const highlightNextBar = () => {
      cols.forEach((col, idx) => {
        col.classList.toggle('active', idx === activeIndex);
      });
      activeIndex = (activeIndex + 1) % cols.length;
    };

    highlightNextBar();
    window.expBarCycleTimer = setInterval(highlightNextBar, 2000);

    chartContainer.addEventListener('mouseenter', () => {
      if (window.expBarCycleTimer) { clearInterval(window.expBarCycleTimer); window.expBarCycleTimer = null; }
    }, { passive: true });
    chartContainer.addEventListener('mouseleave', () => {
      if (!window.expBarCycleTimer) { window.expBarCycleTimer = setInterval(highlightNextBar, 2000); }
    }, { passive: true });
  }, allBarsDone + 1800);
};

function handleWorkRoute() {
  const detail = document.getElementById('work-detail');
  const listing = document.getElementById('work-listing');
  const detailNav = document.querySelector('.detail-nav');
  if (new URLSearchParams(window.location.search).has('project')) {
    if (window.loadWorkDetail) window.loadWorkDetail();
  } else {
    if (detail) detail.hidden = true;
    if (listing) {
      listing.hidden = false;
      listing.classList.remove('work-listing-enter');
      void listing.offsetWidth;
      listing.classList.add('work-listing-enter');
    }
    if (detailNav) detailNav.hidden = true;
    document.body.classList.remove('project-detail-page');
    document.title = 'Work — Munish Prabhu K | Digital Marketing Executive';
    if (window.loadWorkGrid) window.loadWorkGrid();
    reinitWorkHero();
  }
}

function initDataLoad() {
  if (window.location.pathname.includes('work.html')) {
    handleWorkRoute();
  } else if (window.location.pathname.includes('experience.html')) {
    if (window.loadExpGrid) window.loadExpGrid();
    if (window.renderHeroBarChart) window.renderHeroBarChart();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDataLoad);
} else {
  initDataLoad();
}

window.addEventListener('popstate', initDataLoad);

initGlobe();

window.openReviewModal = function(project) {
  let modal = document.querySelector('.review-modal-backdrop');
  if (!modal) {
    modal = document.createElement('div');
    modal.className = 'review-modal-backdrop';
    document.body.appendChild(modal);
  }

  const projectTitle = escapeHTML(project?.title || 'this project');
  let selectedRating = 5;

  modal.innerHTML = `
    <div class="review-modal-card">
      <button class="review-modal-close" aria-label="Close review modal">&times;</button>
      <h3 class="review-modal-title">Review Portal</h3>
      <p class="review-modal-subtitle">Share your experience & feedback for <strong>${projectTitle}</strong></p>

      <form id="review-modal-form">
        <div class="review-form-field">
          <label>Your Rating</label>
          <div class="review-stars">
            <span class="review-star is-selected" data-star="1">★</span>
            <span class="review-star is-selected" data-star="2">★</span>
            <span class="review-star is-selected" data-star="3">★</span>
            <span class="review-star is-selected" data-star="4">★</span>
            <span class="review-star is-selected" data-star="5">★</span>
          </div>
        </div>

        <div class="review-form-field">
          <label>Your Name</label>
          <input type="text" id="reviewer-name" placeholder="e.g. John Doe" required />
        </div>

        <div class="review-form-field">
          <label>Role / Organization</label>
          <input type="text" id="reviewer-role" placeholder="e.g. Client / CEO at Acme Corp" />
        </div>

        <div class="review-form-field">
          <label>Your Feedback / Testimonial</label>
          <textarea id="reviewer-text" rows="4" placeholder="Write your thoughts about working on this project..." required></textarea>
        </div>

        <button type="submit" class="review-submit-btn">Submit Review ↗</button>
      </form>
    </div>
  `;

  requestAnimationFrame(() => modal.classList.add('is-open'));

  const closeModal = () => {
    modal.classList.remove('is-open');
    setTimeout(() => modal.remove(), 300);
  };

  modal.querySelector('.review-modal-close').addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  const stars = modal.querySelectorAll('.review-star');
  stars.forEach(star => {
    star.addEventListener('mouseenter', () => {
      const val = parseInt(star.dataset.star, 10);
      stars.forEach(s => s.classList.toggle('is-hovered', parseInt(s.dataset.star, 10) <= val));
    });

    star.addEventListener('mouseleave', () => {
      stars.forEach(s => s.classList.remove('is-hovered'));
    });

    star.addEventListener('click', () => {
      selectedRating = parseInt(star.dataset.star, 10);
      stars.forEach(s => s.classList.toggle('is-selected', parseInt(s.dataset.star, 10) <= selectedRating));
    });
  });

  const form = modal.querySelector('#review-modal-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = modal.querySelector('#reviewer-name').value.trim();
    const role = modal.querySelector('#reviewer-role').value.trim();
    const text = modal.querySelector('#reviewer-text').value.trim();

    try {
      await supabase.from('reviews').insert([
        { project_id: project?.id, reviewer_name: name, reviewer_role: role, rating: selectedRating, review_text: text }
      ]);
    } catch (err) {
      console.log('Review logged:', { name, role, selectedRating, text });
    }

    const card = modal.querySelector('.review-modal-card');
    card.innerHTML = `
      <button class="review-modal-close" aria-label="Close review modal">&times;</button>
      <div class="review-success-msg">
        <h3>Thank You for Your Review!</h3>
        <p>Your feedback for <strong>${projectTitle}</strong> has been submitted successfully.</p>
      </div>
    `;
    card.querySelector('.review-modal-close').addEventListener('click', closeModal);
  });
};


window.initWorkAnim = function() {
  const animContainer = document.getElementById('wf-hero-anim');
  const folderBtn = document.getElementById('wf-folder-btn');
  if (!animContainer || !folderBtn) return;
  const playAnimation = (isInitial = false) => {
    
    animContainer.classList.remove('wf-play', 'wf-done');
    void animContainer.offsetWidth; // Force DOM reflow
    animContainer.classList.add('wf-play');
    
    if (isInitial) {
      setTimeout(() => {
        const grid = document.getElementById('dynamic-work-grid');
        if (grid) {
          const y = grid.getBoundingClientRect().top + window.scrollY - 80;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }, 2100);
    }
  };
  
  folderBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    playAnimation(false);
  });
  
  folderBtn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      playAnimation(false);
    }
  });

  // Always forcefully trigger the animation sequence after a tiny delay
  setTimeout(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        // Automatically scroll down only on the initial page load trigger
        playAnimation(true); 
      });
    });
  }, 100);
};
