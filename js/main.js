/* ==========================================================================
   VM FITNESS GYM - CORE INTERACTIVITY (MAIN.JS)
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  // 1. Hide Preloader screen after assets and page loads
  const preloader = document.getElementById("preloader");
  if (preloader) {
    // Add a small delay for a smoother visual transition
    setTimeout(() => {
      preloader.classList.add("hide");
    }, 400);
  }

  // 2. Mobile Burger Navigation Menu Toggle
  const menuBtn = document.getElementById("menuBtn");
  const navLinks = document.getElementById("navLinks");
  if (menuBtn && navLinks) {
    menuBtn.addEventListener("click", () => {
      navLinks.classList.toggle("show");
      // Animate the burger icon if desired
      menuBtn.textContent = navLinks.classList.contains("show") ? "✕" : "☰";
    });

    // Close the drawer if a user clicks on any nav link
    navLinks.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("show");
        menuBtn.textContent = "☰";
      });
    });
  }

  // 3. Premium Button Ripple Effect
  const initRipples = () => {
    document.querySelectorAll(".btn-ripple").forEach(button => {
      // Remove any existing listener to prevent duplicates
      button.style.position = "relative";
      button.style.overflow = "hidden";
      
      button.addEventListener("click", function (e) {
        const ripple = document.createElement("span");
        const rect = this.getBoundingClientRect();
        
        // Calculate coordinate positions relative to the button
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        ripple.style.position = "absolute";
        ripple.style.transform = "translate(-50%, -50%)";
        ripple.style.backgroundColor = "rgba(255, 255, 255, 0.4)";
        ripple.style.borderRadius = "50%";
        ripple.style.pointerEvents = "none";
        ripple.style.width = "0px";
        ripple.style.height = "0px";
        ripple.style.animation = "ripple 0.6s linear";
        
        this.appendChild(ripple);
        
        setTimeout(() => {
          ripple.remove();
        }, 600);
      });
    });
  };
  initRipples();

  // 4. Scroll-based Fade-In & Reveal Effects (Intersection Observer)
  const revealElements = document.querySelectorAll(".reveal, .reveal-left, .reveal-right");
  if (revealElements.length > 0) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          revealObserver.unobserve(entry.target); // Trigger only once for cleaner performance
        }
      });
    }, {
      threshold: 0.15 // Trigger when 15% of the element is visible
    });

    revealElements.forEach((el) => {
      revealObserver.observe(el);
    });
  }

  // 5. Animated Count-up Stats Counters (Intersection Observer)
  const counters = document.querySelectorAll(".counter");
  if (counters.length > 0) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        
        const counter = entry.target;
        const target = +counter.getAttribute("data-target");
        let current = 0;
        
        // Dynamic stepping based on the target value
        const step = Math.ceil(target / 80); 
        
        const updateCounter = () => {
          current += step;
          if (current < target) {
            counter.textContent = current;
            requestAnimationFrame(updateCounter);
          } else {
            counter.textContent = target + "+";
          }
        };
        
        updateCounter();
        counterObserver.unobserve(counter); // Animate once on scroll
      });
    }, {
      threshold: 0.5 // Trigger when half of the counter section is visible
    });

    counters.forEach(counter => {
      counterObserver.observe(counter);
    });
  }

  // 6. Check Auth State to Update Navbar Buttons Dynamically
  const checkNavbarAuth = () => {
    const navActions = document.querySelector(".nav-actions");
    const currentUser = localStorage.getItem("currentUser");
    
    if (navActions && currentUser) {
      const userObj = JSON.parse(currentUser);
      // Rewrite navbar actions to show "Dashboard" and "Logout"
      navActions.innerHTML = `
        <span class="user-welcome muted" style="font-size: 14px; font-weight: 500; margin-right: 10px; display: inline-block;">
          Hi, <strong style="color: #fff;">${userObj.name.split(' ')[0]}</strong>
        </span>
        <a href="dashboard.html" class="btn btn-outline btn-ripple" style="padding: 8px 18px; font-size: 13px;">Dashboard</a>
        <button id="logoutBtn" class="btn btn-primary btn-ripple" style="padding: 8px 18px; font-size: 13px;">Logout</button>
        <button class="menu-btn" id="menuBtn" aria-label="Toggle menu">☰</button>
      `;
      
      // Re-initialize menuBtn for the mobile view
      const newMenuBtn = document.getElementById("menuBtn");
      if (newMenuBtn && navLinks) {
        newMenuBtn.addEventListener("click", () => {
          navLinks.classList.toggle("show");
          newMenuBtn.textContent = navLinks.classList.contains("show") ? "✕" : "☰";
        });
      }

      // Logout handler
      const logoutBtn = document.getElementById("logoutBtn");
      if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
          localStorage.removeItem("currentUser");
          alert("Logged out successfully!");
          window.location.href = "index.html";
        });
      }
      
      // Re-initialize ripples on new buttons
      initRipples();
    }
  };
  checkNavbarAuth();
});