/* ==========================================================================
   VM FITNESS GYM - LOGIN HANDLERS (LOGIN.JS)
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  
  if (loginForm) {
    const logEmail = document.getElementById("logEmail");
    const logPassword = document.getElementById("logPassword");

    const logEmailError = document.getElementById("logEmailError");
    const logPasswordError = document.getElementById("logPasswordError");

    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      
      let isValid = true;
      logEmailError.style.display = "none";
      logPasswordError.style.display = "none";

      // 1. Validate Email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(logEmail.value.trim())) {
        logEmailError.style.display = "block";
        isValid = false;
      }

      // 2. Validate Password
      if (logPassword.value.trim() === "") {
        logPasswordError.style.display = "block";
        isValid = false;
      }

      if (!isValid) return;

      // 3. Match credentials with stored LocalStorage users
      const users = JSON.parse(localStorage.getItem("gymUsers") || "[]");
      const targetEmail = logEmail.value.trim().toLowerCase();
      const targetPassword = logPassword.value;

      const matchedUser = users.find(u => u.email === targetEmail && u.password === targetPassword);

      if (matchedUser) {
        // Remember / log in user session
        localStorage.setItem("currentUser", JSON.stringify(matchedUser));
        
        alert(`Welcome back, ${matchedUser.name}!`);
        window.location.href = "dashboard.html";
      } else {
        alert("Invalid Email or Password. Please try again or create a new account.");
      }
    });
  }
});
