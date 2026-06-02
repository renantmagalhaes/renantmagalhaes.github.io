document.addEventListener('DOMContentLoaded', () => {
  
  /* ==========================================
     1. Theme Toggle Management (3-way: light, dark, cyber)
     ========================================== */
  const themeToggle = document.getElementById('theme-toggle');
  const themeIcon = themeToggle.querySelector('i');
  
  // Available themes
  const themes = ['light', 'dark', 'cyber'];
  
  // Check local storage or system preference
  let currentTheme = localStorage.getItem('rtm-theme');
  
  if (!currentTheme) {
    const systemPrefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
    currentTheme = systemPrefersLight ? 'light' : 'dark';
  }

  // Helper to apply the current theme to body and update icon
  function applyTheme(theme) {
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
    
    localStorage.setItem('rtm-theme', theme);
  }
  
  // Initial apply
  applyTheme(currentTheme);

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
      
      const matchesSearch = searchQuery === '' || fullText.includes(searchQuery);

      if (matchesTags && matchesSearch) {
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
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
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
});
