document.addEventListener('DOMContentLoaded', () => {
  
  /* ==========================================
     1. Theme Toggle Management (3-way: light, dark, cyber)
     ========================================== */
  const themeToggle = document.getElementById('theme-toggle');
  const themeIcon = themeToggle.querySelector('i');
  
  // Available themes
  const themes = ['light', 'dark', 'cyber'];
  
  // Check URL parameters or hash to force a specific theme (useful for embeds/links)
  const urlParams = new URLSearchParams(window.location.search);
  let forcedTheme = urlParams.get('theme');
  
  if (!forcedTheme) {
    const hash = window.location.hash.toLowerCase();
    if (hash === '#light' || hash === '#theme-light') forcedTheme = 'light';
    else if (hash === '#dark' || hash === '#theme-dark') forcedTheme = 'dark';
    else if (hash === '#cyber' || hash === '#theme-cyber') forcedTheme = 'cyber';
  }
  
  // Validate forced theme
  if (forcedTheme && !themes.includes(forcedTheme)) {
    forcedTheme = null;
  }
  
  // Check local storage or system preference if not forced
  let currentTheme = forcedTheme || localStorage.getItem('rtm-theme');
  
  if (!currentTheme) {
    const systemPrefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
    currentTheme = systemPrefersLight ? 'light' : 'dark';
  }

  // Helper to apply the current theme to body and update icon
  function applyTheme(theme, save = true) {
    // Remove all theme classes
    themes.forEach(t => document.body.classList.remove(t + '-theme'));
    // Add current theme class
    document.body.classList.add(theme + '-theme');
    
    // Update theme icon
    if (theme === 'light') {
      themeIcon.className = 'fa-solid fa-sun';
      themeToggle.setAttribute('title', 'Switch to Dark Mode');
    } else if (theme === 'dark') {
      themeIcon.className = 'fa-solid fa-moon';
      themeToggle.setAttribute('title', 'Switch to Cyber Mode');
    } else if (theme === 'cyber') {
      themeIcon.className = 'fa-solid fa-terminal';
      themeToggle.setAttribute('title', 'Switch to Light Mode');
    }
    
    if (save) {
      localStorage.setItem('rtm-theme', theme);
    }
  }
  
  // Initial apply (do not save to local storage if it was forced via URL)
  applyTheme(currentTheme, !forcedTheme);

  // Toggle Theme Event (cycles through themes)
  themeToggle.addEventListener('click', () => {
    const currentIndex = themes.indexOf(currentTheme);
    const nextIndex = (currentIndex + 1) % themes.length;
    currentTheme = themes[nextIndex];
    applyTheme(currentTheme);
  });

  /* ==========================================
     2. Combined Search and Tag Filtering
     ========================================== */
  const searchInput = document.getElementById('experience-search');
  const clearFilterBtn = document.getElementById('clear-filter-btn');
  const skillTags = document.querySelectorAll('.skill-tag');
  const activeFiltersBar = document.getElementById('active-filters-bar');
  const activeTagsContainer = document.getElementById('active-tags-container');
  const resetAllFiltersBtn = document.getElementById('reset-all-filters');
  
  const timelineItems = document.querySelectorAll('.timeline-item');
  const projectCards = document.querySelectorAll('.project-card');
  
  let activeFilters = new Set();
  let searchQuery = '';

  // Apply filtering rules to all lists
  function applyFiltering() {
    // 1. Tag checks (if any filters are active, item must match at least one filter tag)
    // 2. Search check (if search query is present, text must contain query)
    
    // Manage active tags bar visibility
    if (activeFilters.size > 0) {
      activeFiltersBar.style.display = 'flex';
      // Sync list of visible tag badges
      activeTagsContainer.innerHTML = '';
      activeFilters.forEach(filter => {
        const badge = document.createElement('div');
        badge.className = 'active-filter-badge';
        badge.innerHTML = `
          <span>${getFilterDisplayName(filter)}</span>
          <i class="fa-solid fa-xmark" data-filter="${filter}"></i>
        `;
        activeTagsContainer.appendChild(badge);
      });
    } else {
      activeFiltersBar.style.display = 'none';
      activeTagsContainer.innerHTML = '';
    }

    // Toggle skill active UI class in the matrix
    skillTags.forEach(tag => {
      const filter = tag.getAttribute('data-filter');
      if (activeFilters.has(filter)) {
        tag.classList.add('filter-active');
      } else {
        tag.classList.remove('filter-active');
      }
    });

    // Toggle clear search button visibility
    if (searchQuery.length > 0) {
      clearFilterBtn.style.display = 'block';
    } else {
      clearFilterBtn.style.display = 'none';
    }

    // Filter Timeline Items (Experiences)
    timelineItems.forEach(item => {
      if (item.classList.contains('company-group')) {
        const companyTitle = item.querySelector('.company-title')?.textContent.toLowerCase() || '';
        const nestedRoles = item.querySelectorAll('.nested-role');
        let anyRoleVisible = false;
        
        nestedRoles.forEach(role => {
          const tagsAttr = role.getAttribute('data-tags') || '';
          const roleTags = tagsAttr.split(',').map(t => t.trim());
          
          const roleTitle = role.querySelector('.role-title')?.textContent.toLowerCase() || '';
          const textDetails = role.querySelector('.timeline-details')?.textContent.toLowerCase() || '';
          const quoteDetails = role.querySelector('.timeline-quote')?.textContent.toLowerCase() || '';
          const fullText = `${roleTitle} ${companyTitle} ${textDetails} ${quoteDetails} ${tagsAttr}`;
          
          const matchesTags = activeFilters.size === 0 || Array.from(activeFilters).some(filter => {
            return roleTags.some(tag => tag.includes(filter) || filter.includes(tag));
          });
          
          const matchesSearch = searchQuery === '' || fullText.includes(searchQuery);
          
          if (matchesTags && matchesSearch) {
            role.classList.remove('filtered-out');
            anyRoleVisible = true;
            
            // Highlight active badges
            role.querySelectorAll('.badge').forEach(badge => {
              const badgeText = badge.textContent.toLowerCase();
              const matchesAnyActiveFilter = Array.from(activeFilters).some(f => badgeText.includes(f) || f.includes(badgeText));
              if (matchesAnyActiveFilter) {
                badge.classList.add('active-glow');
              } else {
                badge.classList.remove('active-glow');
              }
            });
          } else {
            role.classList.add('filtered-out');
          }
        });
        
        if (anyRoleVisible) {
          item.classList.remove('filtered-out');
        } else {
          item.classList.add('filtered-out');
        }
        
      } else {
        // Regular single-role experience item
        const tagsAttr = item.getAttribute('data-tags') || '';
        const itemTags = tagsAttr.split(',').map(t => t.trim());
        
        const roleTitle = item.querySelector('.role-title')?.textContent.toLowerCase() || '';
        const companyTitle = item.querySelector('.company-title')?.textContent.toLowerCase() || '';
        const textDetails = item.querySelector('.timeline-details')?.textContent.toLowerCase() || '';
        const quoteDetails = item.querySelector('.timeline-quote')?.textContent.toLowerCase() || '';
        const fullText = `${roleTitle} ${companyTitle} ${textDetails} ${quoteDetails} ${tagsAttr}`;
        
        const matchesTags = activeFilters.size === 0 || Array.from(activeFilters).some(filter => {
          return itemTags.some(tag => tag.includes(filter) || filter.includes(tag));
        });
        
        const matchesSearch = searchQuery === '' || fullText.includes(searchQuery);

        if (matchesTags && matchesSearch) {
          item.classList.remove('filtered-out');
          
          // Highlight active badges
          item.querySelectorAll('.badge').forEach(badge => {
            const badgeText = badge.textContent.toLowerCase();
            const matchesAnyActiveFilter = Array.from(activeFilters).some(f => badgeText.includes(f) || f.includes(badgeText));
            if (matchesAnyActiveFilter) {
              badge.classList.add('active-glow');
            } else {
              badge.classList.remove('active-glow');
            }
          });
        } else {
          item.classList.add('filtered-out');
        }
      }
    });

    // Filter Project Cards
    projectCards.forEach(card => {
      const tagsAttr = card.getAttribute('data-tags') || '';
      const cardTags = tagsAttr.split(',').map(t => t.trim());
      
      const name = card.querySelector('.project-name')?.textContent.toLowerCase() || '';
      const desc = card.querySelector('.project-desc')?.textContent.toLowerCase() || '';
      const quote = card.querySelector('.project-quote')?.textContent.toLowerCase() || '';
      const fullText = `${name} ${desc} ${quote} ${tagsAttr}`;
      
      const matchesTags = activeFilters.size === 0 || Array.from(activeFilters).some(filter => {
        return cardTags.some(tag => tag.includes(filter) || filter.includes(tag));
      });
      
      if (matchesTags) {
        card.classList.remove('filtered-out');
        // Highlight active badges
        card.querySelectorAll('.badge').forEach(badge => {
          const badgeText = badge.textContent.toLowerCase();
          const matchesAnyActiveFilter = Array.from(activeFilters).some(f => badgeText.includes(f) || f.includes(badgeText));
          if (matchesAnyActiveFilter) {
            badge.classList.add('active-glow');
          } else {
            badge.classList.remove('active-glow');
          }
        });
      } else {
        card.classList.add('filtered-out');
      }
    });
  }

  // Get nice names for filters on display
  function getFilterDisplayName(filter) {
    const matchedTag = Array.from(skillTags).find(tag => tag.getAttribute('data-filter') === filter);
    return matchedTag ? matchedTag.textContent : filter;
  }

  // Event listener for Skill Matrix Badges
  skillTags.forEach(tag => {
    tag.addEventListener('click', () => {
      const filter = tag.getAttribute('data-filter');
      if (activeFilters.has(filter)) {
        activeFilters.delete(filter);
      } else {
        activeFilters.add(filter);
      }
      applyFiltering();
      
      // Auto-scroll down to the experience section to show results if user clicked in about section
      const experienceSection = document.getElementById('experience');
      const rect = experienceSection.getBoundingClientRect();
      if (rect.top > window.innerHeight || rect.bottom < 0) {
        experienceSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // Event listener for removing active filter badges
  activeTagsContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('fa-xmark')) {
      const filter = e.target.getAttribute('data-filter');
      activeFilters.delete(filter);
      applyFiltering();
    }
  });

  // Event listener for search input
  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value.toLowerCase().trim();
    applyFiltering();
  });

  // Event listener for clear search cross button
  clearFilterBtn.addEventListener('click', () => {
    searchInput.value = '';
    searchQuery = '';
    applyFiltering();
    searchInput.focus();
  });

  // Reset all filters button
  function resetAll() {
    activeFilters.clear();
    searchQuery = '';
    searchInput.value = '';
    applyFiltering();
  }
  resetAllFiltersBtn.addEventListener('click', resetAll);

  /* ==========================================
     3. Scroll-Reveal & Active Navbar Link Highlight
     ========================================== */
  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('.nav-link');
  
  // Initial active triggers for scroll-reveal
  const revealCallback = (entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        // Once visible, we can unobserve if we only want animate-once effect
        observer.unobserve(entry.target);
      }
    });
  };

  const revealObserver = new IntersectionObserver(revealCallback, {
    root: null,
    threshold: 0,
    rootMargin: '0px 0px -30px 0px'
  });

  sections.forEach(section => {
    revealObserver.observe(section);
  });

  // Highlight navigation links on scroll
  window.addEventListener('scroll', () => {
    let currentSectionId = '';
    
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      // Triggers when page scroll is at or past 1/3 of the section offset
      if (window.scrollY >= (sectionTop - 250)) {
        currentSectionId = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentSectionId}`) {
        link.classList.add('active');
      }
    });
    
    // Add border shadow style to navbar if page is scrolled
    const navbar = document.getElementById('navbar');
    if (window.scrollY > 20) {
      navbar.style.boxShadow = 'var(--shadow-lg)';
      navbar.style.height = '64px';
    } else {
      navbar.style.boxShadow = 'none';
      navbar.style.height = '70px';
    }
  });

  /* ==========================================
     4. Print Management
     ========================================== */
  const printBtn = document.getElementById('print-btn');
  printBtn.addEventListener('click', () => {
    window.print();
  });

  /* ==========================================
     5. Circuit Board Avatar Animation
     ========================================== */
  const canvas = document.getElementById('circuit-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let cx, cy, R;
    let activePulses = [];
    let colors = getColors();

    function getColors() {
      const styles = getComputedStyle(document.body);
      const accentPrimary = styles.getPropertyValue('--accent-primary').trim() || '#ffffff';
      const accentSecondary = styles.getPropertyValue('--accent-secondary').trim() || '#94a3b8';
      const borderColor = styles.getPropertyValue('--border-color').trim() || 'rgba(255, 255, 255, 0.08)';
      return { accentPrimary, accentSecondary, borderColor };
    }

    // Generate 14 relative paths (orthogonal horizontal/vertical routing with 4 turns, 25% longer)
    const relativePaths = [];
    const numPaths = 14;
    for (let i = 0; i < numPaths; i++) {
      const baseAngle = (i * 2 * Math.PI) / numPaths;
      const jitter = (Math.random() - 0.5) * (2 * Math.PI / numPaths) * 0.35;
      const theta = baseAngle + jitter;
      
      const relPath = [];
      const x0 = Math.cos(theta);
      const y0 = Math.sin(theta);
      relPath.push({ x: x0, y: y0 });
      
      const dirX = x0 >= 0 ? 1 : -1;
      const dirY = y0 >= 0 ? 1 : -1;
      
      // Determine dominant direction (horizontal-first or vertical-first)
      const isHorizontalFirst = Math.abs(x0) > Math.abs(y0);
      
      if (isHorizontalFirst) {
        // Seg 1: Horizontal
        const L1 = 0.08 + Math.random() * 0.04;
        const x1 = x0 + L1 * dirX;
        const y1 = y0;
        relPath.push({ x: x1, y: y1 });
        
        // Seg 2: Vertical
        const L2 = 0.12 + Math.random() * 0.08;
        const x2 = x1;
        const y2 = y1 + L2 * dirY;
        relPath.push({ x: x2, y: y2 });
        
        // Seg 3: Horizontal
        const L3 = 0.12 + Math.random() * 0.08;
        const x3 = x2 + L3 * dirX;
        const y3 = y2;
        relPath.push({ x: x3, y: y3 });

        // Seg 4: Vertical
        const L4 = 0.12 + Math.random() * 0.08;
        const x4 = x3;
        const y4 = y3 + L4 * dirY;
        relPath.push({ x: x4, y: y4 });

        // Seg 5: Horizontal
        const L5 = 0.08 + Math.random() * 0.07;
        const x5 = x4 + L5 * dirX;
        const y5 = y4;
        relPath.push({ x: x5, y: y5 });
      } else {
        // Seg 1: Vertical
        const L1 = 0.08 + Math.random() * 0.04;
        const x1 = x0;
        const y1 = y0 + L1 * dirY;
        relPath.push({ x: x1, y: y1 });
        
        // Seg 2: Horizontal
        const L2 = 0.12 + Math.random() * 0.08;
        const x2 = x1 + L2 * dirX;
        const y2 = y1;
        relPath.push({ x: x2, y: y2 });
        
        // Seg 3: Vertical
        const L3 = 0.12 + Math.random() * 0.08;
        const x3 = x2;
        const y3 = y2 + L3 * dirY;
        relPath.push({ x: x3, y: y3 });

        // Seg 4: Horizontal
        const L4 = 0.12 + Math.random() * 0.08;
        const x4 = x3 + L4 * dirX;
        const y4 = y3;
        relPath.push({ x: x4, y: y4 });

        // Seg 5: Vertical
        const L5 = 0.08 + Math.random() * 0.07;
        const x5 = x4;
        const y5 = y4 + L5 * dirY;
        relPath.push({ x: x5, y: y5 });
      }
      
      relativePaths.push(relPath);
    }

    const pads = relativePaths.map(() => ({ glowIntensity: 0 }));

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      
      cx = rect.width / 2;
      cy = rect.height / 2;
      // The canvas width is 2.0x the avatar container size
      R = rect.width / 4;
    }

    window.addEventListener('resize', resize);
    resize();

    // Re-query colors when theme toggle button is clicked
    const themeToggleBtn = document.getElementById('theme-toggle');
    if (themeToggleBtn) {
      themeToggleBtn.addEventListener('click', () => {
        setTimeout(() => {
          colors = getColors();
        }, 50);
      });
    }

    function getPointOnPath(points, t) {
      if (points.length === 0) return { x: 0, y: 0 };
      if (points.length === 1) return points[0];
      
      let totalLength = 0;
      const segments = [];
      for (let i = 0; i < points.length - 1; i++) {
        const dx = points[i+1].x - points[i].x;
        const dy = points[i+1].y - points[i].y;
        const len = Math.sqrt(dx * dx + dy * dy);
        segments.push({ from: points[i], to: points[i+1], length: len });
        totalLength += len;
      }
      
      const targetLength = t * totalLength;
      let currentLength = 0;
      for (let i = 0; i < segments.length; i++) {
        const seg = segments[i];
        if (currentLength + seg.length >= targetLength || i === segments.length - 1) {
          const segT = (targetLength - currentLength) / (seg.length || 1);
          return {
            x: seg.from.x + (seg.to.x - seg.from.x) * segT,
            y: seg.from.y + (seg.to.y - seg.from.y) * segT
          };
        }
        currentLength += seg.length;
      }
      return points[points.length - 1];
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. Get absolute paths based on current center (cx, cy) and radius (R)
      const absolutePaths = relativePaths.map(relPath => 
        relPath.map(pt => ({
          x: cx + pt.x * R,
          y: cy + pt.y * R
        }))
      );

      // 2. Draw copper tracks (faint background traces)
      absolutePaths.forEach(absPath => {
        ctx.beginPath();
        ctx.moveTo(absPath[0].x, absPath[0].y);
        for (let j = 1; j < absPath.length; j++) {
          ctx.lineTo(absPath[j].x, absPath[j].y);
        }
        ctx.strokeStyle = colors.accentPrimary;
        ctx.lineWidth = 1.2;
        ctx.globalAlpha = 0.12;
        ctx.stroke();
      });

      // 3. Update & Draw pulses
      // Spawn new pulses randomly
      if (Math.random() < 0.015 && activePulses.length < 4) {
        activePulses.push({
          pathIndex: Math.floor(Math.random() * numPaths),
          progress: 0,
          speed: 0.006 + Math.random() * 0.008,
          color: Math.random() < 0.65 ? colors.accentPrimary : colors.accentSecondary
        });
      }

      activePulses.forEach((pulse, idx) => {
        pulse.progress += pulse.speed;
        
        if (pulse.progress >= 1) {
          pads[pulse.pathIndex].glowIntensity = 1.0;
          activePulses.splice(idx, 1);
          return;
        }

        const absPath = absolutePaths[pulse.pathIndex];
        const pt = getPointOnPath(absPath, pulse.progress);

        // Outer glow
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 4.5, 0, 2 * Math.PI);
        ctx.fillStyle = pulse.color;
        ctx.globalAlpha = 0.35;
        ctx.fill();

        // Inner bright core
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 1.8, 0, 2 * Math.PI);
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = 1.0;
        ctx.fill();
      });

      // 4. Update & Draw terminating pads (vias)
      pads.forEach((pad, i) => {
        if (pad.glowIntensity > 0) {
          pad.glowIntensity -= 0.035;
          if (pad.glowIntensity < 0) pad.glowIntensity = 0;
        }

        const absPath = absolutePaths[i];
        const endPt = absPath[absPath.length - 1];

        // Base pad dot
        ctx.beginPath();
        ctx.arc(endPt.x, endPt.y, 3, 0, 2 * Math.PI);
        ctx.fillStyle = colors.accentPrimary;
        ctx.globalAlpha = 0.35 + 0.65 * pad.glowIntensity;
        ctx.fill();

        // Tiny center via hole
        ctx.beginPath();
        ctx.arc(endPt.x, endPt.y, 1, 0, 2 * Math.PI);
        ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--bg-color').trim() || '#000000';
        ctx.globalAlpha = 0.8;
        ctx.fill();

        // Expand ripple glow when hit by a pulse
        if (pad.glowIntensity > 0) {
          ctx.beginPath();
          ctx.arc(endPt.x, endPt.y, 3 + 8 * (1 - pad.glowIntensity), 0, 2 * Math.PI);
          ctx.strokeStyle = colors.accentPrimary;
          ctx.lineWidth = 1.2;
          ctx.globalAlpha = pad.glowIntensity * 0.7;
          ctx.stroke();
        }
      });

      requestAnimationFrame(animate);
    }

    animate();
  }
});
