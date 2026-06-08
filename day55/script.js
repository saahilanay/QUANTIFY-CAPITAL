document.addEventListener('DOMContentLoaded', () => {

  // ==========================================
  // 1. PAGE TRANSITIONS (SPA ROUTING)
  // ==========================================
  const navLinks = document.querySelectorAll('[data-page]');
  const pageSections = document.querySelectorAll('.page-section');
  const luxuryHeader = document.getElementById('luxuryHeader');
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const navLinksContainer = document.getElementById('navLinks');

  // Navigate to specific page
  function navigateTo(targetId) {
    const currentPage = document.querySelector('.page-section.active');
    const targetPage = document.getElementById(targetId);

    if (!targetPage) return;
    
    // Close mobile menu if open
    mobileMenuBtn.classList.remove('active');
    navLinksContainer.classList.remove('mobile-active');

    // If already on the page, do nothing
    if (currentPage && currentPage.id === targetId) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // 1. Fade out current page
    if (currentPage) {
      currentPage.classList.remove('show');
      
      setTimeout(() => {
        currentPage.classList.remove('active');
        
        // 2. Prepare and fade in target page
        targetPage.classList.add('active');
        // Force reflow
        targetPage.offsetWidth;
        targetPage.classList.add('show');
        
        // Custom events for page entry
        if (targetId === 'about') {
          initChartAnimation();
        }
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 300); // Matches CSS transition delay
    } else {
      targetPage.classList.add('active');
      targetPage.classList.add('show');
      if (targetId === 'about') initChartAnimation();
    }

    // Update active nav links
    navLinks.forEach(link => {
      if (link.getAttribute('data-page') === targetId) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Update URL hash without jumping
    history.pushState(null, null, `#${targetId}`);
  }

  // Bind clicks to navigation elements
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetPage = link.getAttribute('data-page');
      navigateTo(targetPage);
    });
  });

  // Handle browser back/forward and initial loads
  function handleHashRoute() {
    const hash = window.location.hash.replace('#', '');
    if (hash && ['home', 'about', 'reviews', 'contact'].includes(hash)) {
      navigateTo(hash);
    } else {
      navigateTo('home');
    }
  }

  window.addEventListener('popstate', handleHashRoute);
  
  // Header scroll appearance
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      luxuryHeader.classList.add('scrolled');
    } else {
      luxuryHeader.classList.remove('scrolled');
    }
  });


  // ==========================================
  // 2. MOBILE MENU HAMBURGER NAVIGATION
  // ==========================================
  mobileMenuBtn.addEventListener('click', () => {
    mobileMenuBtn.classList.toggle('active');
    navLinksContainer.classList.toggle('mobile-active');
  });


  // ==========================================
  // 3. REVIEWS SLIDER (10 TESTIMONIALS CAROUSEL)
  // ==========================================
  const reviewsTrack = document.getElementById('reviewsTrack');
  const reviewSlides = document.querySelectorAll('.review-slide');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const carouselDotsContainer = document.getElementById('carouselDots');
  
  let currentReviewIndex = 0;
  const totalReviews = reviewSlides.length;
  let carouselInterval;

  // Generate indicator dots dynamically
  for (let i = 0; i < totalReviews; i++) {
    const dot = document.createElement('div');
    dot.classList.add('carousel-dot');
    if (i === 0) dot.classList.add('active');
    dot.addEventListener('click', () => {
      goToReview(i);
      resetAutoplay();
    });
    carouselDotsContainer.appendChild(dot);
  }
  const dots = document.querySelectorAll('.carousel-dot');

  function updateReviewCarousel() {
    // Shift track
    reviewsTrack.style.transform = `translateX(-${currentReviewIndex * 100}%)`;
    
    // Manage active states
    reviewSlides.forEach((slide, idx) => {
      if (idx === currentReviewIndex) {
        slide.classList.add('active');
      } else {
        slide.classList.remove('active');
      }
    });

    // Manage dots
    dots.forEach((dot, idx) => {
      if (idx === currentReviewIndex) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });
  }

  function nextReview() {
    currentReviewIndex = (currentReviewIndex + 1) % totalReviews;
    updateReviewCarousel();
  }

  function prevReview() {
    currentReviewIndex = (currentReviewIndex - 1 + totalReviews) % totalReviews;
    updateReviewCarousel();
  }

  function goToReview(index) {
    currentReviewIndex = index;
    updateReviewCarousel();
  }

  // Navigation handlers
  nextBtn.addEventListener('click', () => {
    nextReview();
    resetAutoplay();
  });

  prevBtn.addEventListener('click', () => {
    prevReview();
    resetAutoplay();
  });

  // Autoplay functionality
  function startAutoplay() {
    carouselInterval = setInterval(nextReview, 6000);
  }

  function resetAutoplay() {
    clearInterval(carouselInterval);
    startAutoplay();
  }

  // Pause on hover
  const carouselWrapper = document.querySelector('.reviews-carousel-wrapper');
  carouselWrapper.addEventListener('mouseenter', () => clearInterval(carouselInterval));
  carouselWrapper.addEventListener('mouseleave', startAutoplay);

  // Initialize carousel autoplay
  startAutoplay();


  // ==========================================
  // 4. PORTFOLIO DIVERSIFIED PERFORMANCE CHART
  // ==========================================
  const canvas = document.getElementById('performanceChart');
  let chartAnimationProgress = 0;
  let chartAnimationFrameId = null;

  // Chart Data: Cumulative value from $100 starting value
  const chartLabels = ['2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025'];
  const quantifyData = [100, 116, 134, 151, 178, 208, 222, 258, 298, 344]; // Steady CAGR
  const spData =       [100, 112, 107, 138, 160, 194, 159, 196, 243, 276]; // Volatile index

  function initChartAnimation() {
    chartAnimationProgress = 0;
    if (chartAnimationFrameId) {
      cancelAnimationFrame(chartAnimationFrameId);
    }
    animateChart();
  }

  function resizeCanvas() {
    const rect = canvas.parentNode.getBoundingClientRect();
    // Support high DPI screens
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
  }

  function drawPerformanceChart(progress) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.width;
    const h = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, w, h);
    
    // Padding and layout settings
    const paddingLeft = 50 * dpr;
    const paddingRight = 20 * dpr;
    const paddingTop = 20 * dpr;
    const paddingBottom = 40 * dpr;
    
    const chartW = w - paddingLeft - paddingRight;
    const chartH = h - paddingTop - paddingBottom;
    
    // Drawing Grid Lines & Y-Axis Scale
    const yMax = 400;
    const yMin = 50;
    const yRange = yMax - yMin;
    const gridLines = 5;
    
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.05)';
    ctx.lineWidth = 1 * dpr;
    ctx.font = `${10 * dpr}px 'Inter', sans-serif`;
    ctx.fillStyle = '#62626e';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    
    for (let i = 0; i < gridLines; i++) {
      const yValue = yMin + (yRange / (gridLines - 1)) * i;
      const yPos = h - paddingBottom - ((yValue - yMin) / yRange) * chartH;
      
      // Draw Grid Line
      ctx.beginPath();
      ctx.moveTo(paddingLeft, yPos);
      ctx.lineTo(w - paddingRight, yPos);
      ctx.stroke();
      
      // Draw Y Label
      ctx.fillText(`$${yValue}`, paddingLeft - 10 * dpr, yPos);
    }
    
    // Draw X-Axis Labels (Years)
    const pointsCount = chartLabels.length;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    
    for (let i = 0; i < pointsCount; i++) {
      const xPos = paddingLeft + (i / (pointsCount - 1)) * chartW;
      
      // Draw X Label
      ctx.fillText(chartLabels[i], xPos, h - paddingBottom + 12 * dpr);
    }
    
    // Helper to get coordinates
    const getCoords = (val, idx) => {
      const x = paddingLeft + (idx / (pointsCount - 1)) * chartW;
      const y = h - paddingBottom - ((val - yMin) / yRange) * chartH;
      return { x, y };
    };

    // Draw S&P 500 line (dashed grey)
    ctx.strokeStyle = '#62626e';
    ctx.lineWidth = 2 * dpr;
    ctx.setLineDash([5 * dpr, 5 * dpr]);
    ctx.beginPath();
    
    const firstSP = getCoords(spData[0], 0);
    ctx.moveTo(firstSP.x, firstSP.y);
    
    const limitSP = Math.floor(progress * pointsCount);
    for (let i = 1; i < pointsCount; i++) {
      const coords = getCoords(spData[i], i);
      if (i <= limitSP) {
        ctx.lineTo(coords.x, coords.y);
      } else if (i === limitSP + 1) {
        // Interpolate extra point for smooth animation growth
        const prev = getCoords(spData[i - 1], i - 1);
        const subProgress = (progress * pointsCount) - limitSP;
        const interpX = prev.x + (coords.x - prev.x) * subProgress;
        const interpY = prev.y + (coords.y - prev.y) * subProgress;
        ctx.lineTo(interpX, interpY);
      }
    }
    ctx.stroke();
    ctx.setLineDash([]); // Reset dash

    // Draw Quantify Capital Line (Solid glowing gold)
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 3 * dpr;
    ctx.beginPath();
    
    const firstQC = getCoords(quantifyData[0], 0);
    ctx.moveTo(firstQC.x, firstQC.y);
    
    const limitQC = Math.floor(progress * pointsCount);
    const goldPoints = [];
    goldPoints.push(firstQC);
    
    for (let i = 1; i < pointsCount; i++) {
      const coords = getCoords(quantifyData[i], i);
      if (i <= limitQC) {
        ctx.lineTo(coords.x, coords.y);
        goldPoints.push(coords);
      } else if (i === limitQC + 1) {
        const prev = getCoords(quantifyData[i - 1], i - 1);
        const subProgress = (progress * pointsCount) - limitQC;
        const interpX = prev.x + (coords.x - prev.x) * subProgress;
        const interpY = prev.y + (coords.y - prev.y) * subProgress;
        const interpCoords = { x: interpX, y: interpY };
        ctx.lineTo(interpX, interpY);
        goldPoints.push(interpCoords);
      }
    }
    ctx.stroke();

    // Draw luxury gold gradient fill under the Quantify line
    if (goldPoints.length > 1) {
      const grad = ctx.createLinearGradient(0, paddingTop, 0, h - paddingBottom);
      grad.addColorStop(0, 'rgba(212, 175, 55, 0.18)');
      grad.addColorStop(1, 'rgba(212, 175, 55, 0)');
      
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(firstQC.x, h - paddingBottom);
      
      goldPoints.forEach(pt => {
        ctx.lineTo(pt.x, pt.y);
      });
      
      ctx.lineTo(goldPoints[goldPoints.length - 1].x, h - paddingBottom);
      ctx.closePath();
      ctx.fill();
    }
    
    // Draw dots and glows at endpoints
    if (goldPoints.length > 0 && progress > 0.05) {
      const lastQCPoint = goldPoints[goldPoints.length - 1];
      
      ctx.fillStyle = '#fff';
      ctx.strokeStyle = '#d4af37';
      ctx.lineWidth = 2 * dpr;
      
      // Draw outer glowing halo
      ctx.beginPath();
      ctx.arc(lastQCPoint.x, lastQCPoint.y, 8 * dpr, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(212, 175, 55, 0.3)';
      ctx.fill();
      
      // Draw inner point
      ctx.beginPath();
      ctx.arc(lastQCPoint.x, lastQCPoint.y, 4 * dpr, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.fill();
      ctx.stroke();
    }
  }

  function animateChart() {
    chartAnimationProgress += 0.015;
    if (chartAnimationProgress > 1) {
      chartAnimationProgress = 1;
    }
    
    drawPerformanceChart(chartAnimationProgress);
    
    if (chartAnimationProgress < 1) {
      chartAnimationFrameId = requestAnimationFrame(animateChart);
    }
  }

  // Handle canvas sizing and redraw on page load and window resize
  if (canvas) {
    resizeCanvas();
    window.addEventListener('resize', () => {
      resizeCanvas();
      drawPerformanceChart(chartAnimationProgress);
    });
  }


  // ==========================================
  // 5. SECURE INQUIRY FORM & TOAST NOTIFICATION
  // ==========================================
  const inquiryForm = document.getElementById('inquiryForm');
  const toastMessage = document.getElementById('toastMessage');
  const toastText = document.getElementById('toastText');

  if (inquiryForm) {
    inquiryForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      // Mock submit loading
      const submitBtn = inquiryForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerText;
      submitBtn.disabled = true;
      submitBtn.innerText = "TRANSMITTING SECURELY...";

      setTimeout(() => {
        // Clear form
        inquiryForm.reset();
        
        // Restore button state
        submitBtn.disabled = false;
        submitBtn.innerText = originalText;
        
        // Trigger premium toast
        toastText.innerText = "SECURE PORTAL: Transmission Successful. A Private Banker will contact you shortly.";
        toastMessage.classList.add('show');
        
        setTimeout(() => {
          toastMessage.classList.remove('show');
        }, 5000);
      }, 1500);
    });
  }


  // ==========================================
  // 6. INITIALIZATION & ROUTING HOOKS
  // ==========================================
  // Trigger hash route to show correct page initially
  handleHashRoute();

});
