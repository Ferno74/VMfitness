/* ==========================================================================
   VM FITNESS GYM - SIGNUP HANDLERS (SIGNUP.JS)
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const signupForm = document.getElementById("signupForm");
  
  if (signupForm) {
    const regName = document.getElementById("regName");
    const regEmail = document.getElementById("regEmail");
    const regPassword = document.getElementById("regPassword");
    const regConfirmPassword = document.getElementById("regConfirmPassword");

    const nameError = document.getElementById("nameError");
    const emailError = document.getElementById("emailError");
    const passwordError = document.getElementById("passwordError");
    const confirmError = document.getElementById("confirmError");

    signupForm.addEventListener("submit", (e) => {
      e.preventDefault();
      
      // Reset errors
      let isValid = true;
      nameError.style.display = "none";
      emailError.style.display = "none";
      passwordError.style.display = "none";
      confirmError.style.display = "none";

      // 1. Validate Name
      if (regName.value.trim().length < 3) {
        nameError.style.display = "block";
        isValid = false;
      }

      // 2. Validate Email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(regEmail.value.trim())) {
        emailError.style.display = "block";
        isValid = false;
      }

      // 3. Validate Password
      if (regPassword.value.length < 6) {
        passwordError.style.display = "block";
        isValid = false;
      }

      // 4. Validate Confirm Password
      if (regPassword.value !== regConfirmPassword.value) {
        confirmError.style.display = "block";
        isValid = false;
      }

      if (!isValid) return;

      // 5. Store users in LocalStorage
      const users = JSON.parse(localStorage.getItem("gymUsers") || "[]");
      const targetEmail = regEmail.value.trim().toLowerCase();

      // Check if user already exists
      const userExists = users.some(u => u.email === targetEmail);
      if (userExists) {
        alert("This email address is already registered. Please login or use a different email.");
        return;
      }

      // Get any plan pre-selected in the plans.html page
      const preSelectedPlan = localStorage.getItem("selectedPlan") || "None";
      localStorage.removeItem("selectedPlan"); // Clean up

      // Construct a new user object with clean profile fields
      const newUser = {
        name: regName.value.trim(),
        email: targetEmail,
        password: regPassword.value, // Simple hash/storage for front-end demo
        age: 24,
        gender: "Male",
        height: 175, // in cm
        weight: 70,  // in kg
        fitnessGoal: "Muscle Gain",
        currentPlan: preSelectedPlan,
        workoutProgress: 15 // default progress percentage
      };

      // Add to array and save to local storage
      users.push(newUser);
      localStorage.setItem("gymUsers", JSON.stringify(users));

      // Remember / Log in current user
      localStorage.setItem("currentUser", JSON.stringify(newUser));

      // Visual confirmation and redirect to user dashboard
      alert("Registration Successful! Welcome to VM Fitness Gym.");
      window.location.href = "dashboard.html";
    });
  }
});