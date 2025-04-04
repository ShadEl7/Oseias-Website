/* --- START OF FILE script.js --- */

(() => {
    'use strict';

    // --- Selectors ---
    const SELECTORS = {
        menuToggle: '.menu-toggle',
        sidebar: '.sidebar',
        sidebarOverlay: '.sidebar-overlay',
        themeSwitch: '.theme-switch', // Selects all theme switches
        backToTop: '.back-to-top',
        scrollIndicator: '.scroll-indicator',
        currentYear: '#current-year',
        // Combine ripple targets from both examples for broader use
        interactiveRipple: '.service-card, .testimonial-card, .nav-link, .back-to-top, .menu-toggle, .theme-switch, .cta-btn, .feature-card',
        // Selectors for elements animated on scroll, primarily based on services.html + common ones
        animatedElements: '.service-card, .testimonial-card, .cta-section, .page-header-card, .intro-text, .section-heading, .hero-title, .hero-subtitle, .hero-logo, .hero-cta-button, .feature-card',
        sidebarNav: '#sidebarNav', // Specific ID for the sidebar nav container
        navLinks: '.sidebar .nav-link', // Target nav links specifically within the sidebar for active state
        siteHeader: '.site-header'
    };

    // --- Classes ---
    const CLASSES = {
        open: 'open',
        active: 'active', // Used for overlay and nav links
        visible: 'visible', // Used for back-to-top button
        isActive: 'is-active', // Used for menu toggle icon state
        scrolled: 'scrolled', // Used for header state on scroll
        // Animation class added by Intersection Observer (matches CSS)
        animationClass: 'fade-in-up-animation' // Class defined in CSS for fadeInUp
    };

    // --- Constants ---
    const THEME_KEY = 'theme';
    const LIGHT_THEME = 'light';
    const DARK_THEME = 'dark';

    // --- Element References ---
    const menuToggle = document.querySelector(SELECTORS.menuToggle);
    const sidebar = document.querySelector(SELECTORS.sidebar);
    const sidebarOverlay = document.querySelector(SELECTORS.sidebarOverlay);
    const themeSwitches = document.querySelectorAll(SELECTORS.themeSwitch); // Get all switches
    const backToTopBtn = document.querySelector(SELECTORS.backToTop);
    const scrollIndicator = document.querySelector(SELECTORS.scrollIndicator);
    const htmlElement = document.documentElement;
    const currentYearSpan = document.getElementById(SELECTORS.currentYear.substring(1));
    const sidebarNav = document.getElementById(SELECTORS.sidebarNav.substring(1)); // Get sidebar nav by ID
    const siteHeader = document.querySelector(SELECTORS.siteHeader);

    // --- State ---
    let isSidebarOpen = false;
    let removeFocusTrapListener = null; // Stores the function to remove the focus trap listener
    let activeAnimationObserver = null; // Stores the Intersection Observer instance

    // --- Theme Management ---
    const getPreferredTheme = () => localStorage.getItem(THEME_KEY) || (window.matchMedia('(prefers-color-scheme: dark)').matches ? DARK_THEME : LIGHT_THEME);

    const setTheme = (theme) => {
        htmlElement.setAttribute('data-bs-theme', theme);
        // Update all theme switches
        themeSwitches.forEach(ts => ts?.setAttribute('aria-checked', theme === DARK_THEME));
        localStorage.setItem(THEME_KEY, theme);
    };

    // --- Accessibility: Focus Trap ---
    const trapFocus = (element) => {
        if (!element) return null; // Return null if no element
        // Select focusable elements within the provided element
        const focusableEls = element.querySelectorAll('a[href]:not([disabled]), button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])');
        if (!focusableEls?.length) return null; // Return null if no focusable elements

        const firstFocusableEl = focusableEls[0];
        const lastFocusableEl = focusableEls[focusableEls.length - 1];

        const handleKeyDown = (e) => {
            if (e.key !== 'Tab') return;

            if (e.shiftKey) { // Shift + Tab
                if (document.activeElement === firstFocusableEl) {
                    lastFocusableEl.focus();
                    e.preventDefault();
                }
            } else { // Tab
                if (document.activeElement === lastFocusableEl) {
                    firstFocusableEl.focus();
                    e.preventDefault();
                }
            }
        };

        element.addEventListener('keydown', handleKeyDown);
        // Return the cleanup function
        return () => element.removeEventListener('keydown', handleKeyDown);
    };

    // --- Sidebar Toggle ---
    const toggleMenu = () => {
        isSidebarOpen = !isSidebarOpen;
        sidebar?.classList.toggle(CLASSES.open, isSidebarOpen);
        sidebarOverlay?.classList.toggle(CLASSES.active, isSidebarOpen);
        menuToggle?.classList.toggle(CLASSES.isActive, isSidebarOpen);
        menuToggle?.setAttribute('aria-expanded', isSidebarOpen);
        // Prevent body scroll when sidebar is open
        document.body.style.overflow = isSidebarOpen ? 'hidden' : '';

        if (isSidebarOpen && sidebarNav) {
            // Remove previous listener if it exists
            if (removeFocusTrapListener) removeFocusTrapListener();
            // Setup new focus trap and store the cleanup function
            removeFocusTrapListener = trapFocus(sidebarNav);
            // Focus the first element after transition (slight delay)
            setTimeout(() => {
                const firstFocusable = sidebarNav.querySelector('a[href]:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])');
                firstFocusable?.focus();
            }, 100);
        } else {
            // Remove listener when closing
            if (removeFocusTrapListener) {
                removeFocusTrapListener();
                removeFocusTrapListener = null;
            }
            // Return focus to the toggle button
            menuToggle?.focus();
        }
    };

    // --- Scroll Handling ---
    const handleScroll = () => {
        const scrollY = window.scrollY;
        const docHeight = document.documentElement.scrollHeight;
        const viewportHeight = window.innerHeight;
        const totalScrollable = docHeight - viewportHeight;
        const scrolledPercent = totalScrollable > 0 ? Math.min(100, (scrollY / totalScrollable) * 100) : 0;

        // Update scroll indicator width
        if(scrollIndicator) scrollIndicator.style.width = `${scrolledPercent}%`;
        // Toggle back-to-top button visibility
        backToTopBtn?.classList.toggle(CLASSES.visible, scrollY > 300);
        // Toggle header scrolled state
        siteHeader?.classList.toggle(CLASSES.scrolled, scrollY > 50);
    };

    // --- Ripple Effect ---
    const createRipple = (event) => {
        const element = event.currentTarget;
         // Prevent ripple on disabled elements
         if (element.disabled || element.classList.contains('no-ripple')) return;

        const ripple = document.createElement('span');
        const rect = element.getBoundingClientRect();
        // Calculate size based on diagonal for full coverage
        const size = Math.sqrt(rect.width ** 2 + rect.height ** 2) * 2;
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;

        ripple.style.width = ripple.style.height = `${size}px`;
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        ripple.classList.add('ripple'); // Add ripple class defined in CSS

        // Append and self-remove ripple
        element.appendChild(ripple);
        ripple.addEventListener('animationend', () => ripple.remove());
    };

    // --- Update Active Navigation Link ---
    // (Adapted from original script for modularity)
    const updateActiveNavLinks = () => {
        let currentPath = window.location.pathname;
        // Normalize path (remove trailing slash if not root, handle index.html)
        if (currentPath !== '/' && currentPath.endsWith('/')) {
            currentPath = currentPath.slice(0, -1);
        }
        if (currentPath.endsWith('/index.html')) {
            currentPath = currentPath.slice(0, -'/index.html'.length) || '/'; // Treat index.html as root path
        }
        if (currentPath === '') { // Handle case where pathname might be empty for root
             currentPath = '/';
        }

        document.querySelectorAll(SELECTORS.navLinks).forEach(link => {
            try {
                const linkUrl = new URL(link.href);
                let linkPath = linkUrl.pathname;
                 // Normalize link path
                 if (linkPath !== '/' && linkPath.endsWith('/')) {
                    linkPath = linkPath.slice(0, -1);
                 }
                 if (linkPath.endsWith('/index.html')) {
                    linkPath = linkPath.slice(0, -'/index.html'.length) || '/';
                 }
                 if (linkPath === '') {
                    linkPath = '/';
                 }

                // Check for match (exact path or root match for index)
                 if (linkPath === currentPath || (currentPath === '/' && linkPath === '/')) {
                    link.classList.add(CLASSES.active);
                } else {
                    link.classList.remove(CLASSES.active);
                }
            } catch (e) {
                console.error("Error parsing link href:", link.href, e);
                 link.classList.remove(CLASSES.active); // Ensure inactive on error
            }
        });
    };


    // --- Intersection Observer for Animations ---
    // (Adapted to match services.html logic: relies on CSS for initial state)
    const initAnimations = () => {
         // Disconnect previous observer if re-initializing (safety measure)
         if (activeAnimationObserver) {
            activeAnimationObserver.disconnect();
         }

        const animatedElements = document.querySelectorAll(SELECTORS.animatedElements);
        if (!animatedElements.length || !('IntersectionObserver' in window)) {
            // Fallback or simply skip if observer not supported/no elements
            console.warn("Intersection Observer not supported or no elements found for animation.");
             animatedElements.forEach(el => {
                 // If fallback needed, directly trigger animation if CSS provides it
                 if (window.getComputedStyle(el).animationName !== 'none') {
                     el.style.animationPlayState = 'running';
                     el.classList.add(CLASSES.animationClass); // Add class if needed for trigger
                 }
             });
            return;
        }

        const observerOptions = {
            root: null, // Use viewport
            rootMargin: '0px 0px -10% 0px', // Trigger slightly before fully in view
            threshold: 0.1 // 10% visibility needed
        };

        const observerCallback = (entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Add the animation class defined in CSS
                     entry.target.classList.add(CLASSES.animationClass);
                     // Set animation play state to running (CSS should define the animation itself)
                     entry.target.style.animationPlayState = 'running';
                     // Stop observing this element once animation is triggered
                     observer.unobserve(entry.target);
                }
            });
        };

        // Create and store the observer instance
        activeAnimationObserver = new IntersectionObserver(observerCallback, observerOptions);

        // Observe each targeted element
        // CSS is expected to set 'animation-play-state: paused;' initially
        animatedElements.forEach(el => {
            activeAnimationObserver.observe(el);
        });
    };

    // --- Initialization Functions ---
    const initTheme = () => {
        setTheme(getPreferredTheme());
        // Initial check for header scroll state on load
        handleScroll();
    };

    const initEventListeners = () => {
        // Menu Toggle
        menuToggle?.addEventListener('click', toggleMenu);
        // Sidebar Overlay Click
        sidebarOverlay?.addEventListener('click', toggleMenu);

        // Theme Switches (handle multiple)
        themeSwitches.forEach(ts => {
            if(ts) {
                ts.addEventListener('click', () => setTheme(htmlElement.getAttribute('data-bs-theme') === DARK_THEME ? LIGHT_THEME : DARK_THEME));
                // Keyboard accessibility for switch
                ts.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        ts.click();
                    }
                });
            }
        });

        // Back to Top Button
        backToTopBtn?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

        // Ripple Effect Listeners
        document.querySelectorAll(SELECTORS.interactiveRipple).forEach(el => el.addEventListener('mousedown', createRipple));

        // Scroll & Resize Listeners
        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('resize', handleScroll, { passive: true });

        // Escape Key to close Sidebar
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && isSidebarOpen) {
                toggleMenu();
            }
        });

        // Update active nav link on history navigation (back/forward buttons)
        window.addEventListener('popstate', updateActiveNavLinks);
    };

    const initContent = () => {
        // Set Current Year in Footer
        if (currentYearSpan) currentYearSpan.textContent = new Date().getFullYear();
        // Initial check for scroll position effects
        handleScroll();
        // Set initial active nav link state
        updateActiveNavLinks();
        // Initialize scroll-triggered animations
        initAnimations();
    };

    // --- DOM Ready Execution ---
    if (document.readyState === 'loading') {
        // Wait for DOM content to load before initializing
        document.addEventListener('DOMContentLoaded', () => {
            initTheme();
            initEventListeners();
            initContent();
        });
    } else {
        // DOM is already loaded, initialize immediately
        initTheme();
        initEventListeners();
        initContent();
    }

})();

/* --- END OF FILE script.js --- */