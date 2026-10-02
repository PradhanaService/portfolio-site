// Services Page Hero: Search & Content Scroll Animation
// 1. Search icon appears, glows, and zooms out to form the search bar
// 2. Query is typed out smoothly with cursor
// 3. Simulated search result cards scroll upward continuously
// 4. Robust, self-healing continuous loop that never freezes or gets stuck

const SERVICES_DATA = [
  {
    category: 'SEO Strategy',
    url: 'munishprabhu.com › services › seo-aeo',
    title: 'SEO (Search Engine Optimization)',
    snippet: 'Rank higher on Google with on-page SEO, technical website audits, Answer Engine Optimization (AEO), and high-intent keyword strategies.',
    tags: ['Organic Growth', 'Rank #1', 'AEO / GEO']
  },
  {
    category: 'Paid Advertising',
    url: 'munishprabhu.com › services › sem-meta-ads',
    title: 'SEM & Meta Ads Campaign Optimization',
    snippet: 'Precision PPC campaigns and Meta Ads designed for peak ROI, audience retargeting, and performance marketing scalability.',
    tags: ['Meta Ads', 'Google Ads', 'High ROI']
  },
  {
    category: 'Social Media',
    url: 'munishprabhu.com › services › smm-growth',
    title: 'SMM (Social Media Marketing)',
    snippet: 'Multi-platform audience growth, engaging video/post creation, and community frameworks that convert followers into customers.',
    tags: ['Brand Reach', 'Audience Growth']
  },
  {
    category: 'Data & Analytics',
    url: 'munishprabhu.com › services › audits-analytics',
    title: 'Website Audits & Conversion Analytics',
    snippet: 'Deep website health diagnostics using Google Analytics 4, Search Console, and SEMrush for data-backed growth decisions.',
    tags: ['GA4 Insights', 'SEMrush Audits']
  },
  {
    category: 'AI Automation',
    url: 'munishprabhu.com › services › ai-marketing',
    title: 'AI Tools & Content Workflows',
    snippet: 'Streamlined generative AI prompt systems and automated research pipelines to scale content velocity and marketing impact.',
    tags: ['AI Workflows', 'Content Scale']
  }
];

// Module-level reference to the cleanup function of the CURRENT running animation.
// When initServicesSearchAnimation() is called again (SPA navigation),
// it kills the previous instance's timers before starting fresh.
let _ssaCleanup = null;

function initServicesSearchAnimation() {
  // Kill any previously running animation instance
  if (_ssaCleanup) {
    _ssaCleanup();
    _ssaCleanup = null;
  }

  const container = document.getElementById('searchHeroAnim');
  if (!container) return;

  const searchBar = container.querySelector('.search-anim-bar');
  const searchText = container.querySelector('.search-anim-query');
  const metaBar = container.querySelector('.search-anim-meta');
  const scrollTrack = container.querySelector('.search-scroll-track');
  if (!searchBar || !searchText || !scrollTrack) return;

  // Render cards for infinite scroll
  const renderCards = [...SERVICES_DATA, ...SERVICES_DATA];
  scrollTrack.innerHTML = renderCards.map(item => `
    <div class="search-serp-card">
      <div class="serp-card-top">
        <span class="serp-card-favicon"></span>
        <span class="serp-card-url">${item.url}</span>
      </div>
      <h4 class="serp-card-title">${item.title}</h4>
      <p class="serp-card-desc">${item.snippet}</p>
      <div class="serp-card-tags">
        ${item.tags.map(t => `<span class="serp-card-tag">${t}</span>`).join('')}
      </div>
    </div>
  `).join('');

  const SEARCH_QUERY = 'top digital marketing & seo services';
  let activeTimers = [];
  let typeInterval = null;
  let isRunning = false;

  function clearAll() {
    isRunning = false;
    activeTimers.forEach(t => clearTimeout(t));
    activeTimers = [];
    if (typeInterval) {
      clearInterval(typeInterval);
      typeInterval = null;
    }
  }

  // Register this instance's cleanup so the next call can cancel it
  _ssaCleanup = clearAll;

  function schedule(fn, delay) {
    const id = setTimeout(fn, delay);
    activeTimers.push(id);
    return id;
  }

  function startAnimation() {
    clearAll();
    isRunning = true;
    // Re-register after clearAll resets isRunning
    _ssaCleanup = clearAll;

    // Phase 0: Intro Center Icon
    container.style.opacity = '1';
    container.classList.remove('is-zoomed', 'is-typing', 'is-scrolling');
    container.classList.add('is-intro');
    searchText.textContent = '';
    metaBar.style.opacity = '0';
    scrollTrack.style.transform = 'translateY(0px)';

    // Phase 1: Zoom into Search Bar (after 350ms)
    schedule(() => {
      container.classList.remove('is-intro');
      container.classList.add('is-zoomed');

      // Phase 2: Start typing query (after 250ms)
      schedule(() => {
        container.classList.add('is-typing');
        let charIdx = 0;

        typeInterval = setInterval(() => {
          if (charIdx < SEARCH_QUERY.length) {
            searchText.textContent += SEARCH_QUERY[charIdx];
            charIdx++;
          } else {
            clearInterval(typeInterval);
            typeInterval = null;
            container.classList.remove('is-typing');
            metaBar.style.opacity = '1';

            // Phase 3: Start Scrolling SERP Cards (after 250ms)
            schedule(() => {
              container.classList.add('is-scrolling');

              // Phase 4: Loop Restart after 6.5s
              schedule(() => {
                window.dispatchEvent(new CustomEvent('searchAnimationComplete'));
                container.style.opacity = '0';
                schedule(() => {
                  startAnimation();
                }, 300);
              }, 6500);
            }, 250);
          }
        }, 20);
      }, 250);
    }, 350);
  }

  // Initial trigger
  startAnimation();

  // Page lifecycle safeguards
  window.addEventListener('pageshow', () => {
    if (!isRunning) startAnimation();
  });
}

window.initServicesSearchAnimation = initServicesSearchAnimation;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initServicesSearchAnimation);
} else {
  initServicesSearchAnimation();
}
