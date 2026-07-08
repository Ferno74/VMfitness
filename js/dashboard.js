/* ==========================================================================
   VM FITNESS GYM - USER DASHBOARD METRICS (DASHBOARD.JS)
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  // 1. Verify Authentication State
  const currentUserStr = localStorage.getItem("currentUser");
  if (!currentUserStr) {
    alert("Please log in or create an account to view your fitness dashboard.");
    window.location.href = "login.html";
    return;
  }

  let currentUser = JSON.parse(currentUserStr);

  // 2. Select DOM Elements for Rendering
  const profileInitials = document.getElementById("profileInitials");
  const profileName = document.getElementById("profileName");
  const profileEmail = document.getElementById("profileEmail");
  const profilePlanBadge = document.getElementById("profilePlanBadge");
  
  const statAge = document.getElementById("statAge");
  const statGender = document.getElementById("statGender");
  const statHeight = document.getElementById("statHeight");
  const statWeight = document.getElementById("statWeight");
  const statGoal = document.getElementById("statGoal");

  // Bento Card values
  const bmiValue = document.getElementById("bmiValue");
  const bmiCategory = document.getElementById("bmiCategory");
  const caloriesValue = document.getElementById("caloriesValue");
  const caloriesGoalDesc = document.getElementById("caloriesGoalDesc");
  const weightRangeValue = document.getElementById("weightRangeValue");
  const proteinValue = document.getElementById("proteinValue");
  const waterValue = document.getElementById("waterValue");
  const activePlanTitle = document.getElementById("activePlanTitle");
  const activePlanDesc = document.getElementById("activePlanDesc");

  const progressPercent = document.getElementById("progressPercent");
  const progressBar = document.getElementById("progressBar");

  // Edit Profile Elements
  const editProfileBtn = document.getElementById("editProfileBtn");
  const profileModal = document.getElementById("profileModal");
  const closeModalBtn = document.getElementById("closeModalBtn");
  const editProfileForm = document.getElementById("editProfileForm");

  const editName = document.getElementById("editName");
  const editAge = document.getElementById("editAge");
  const editGender = document.getElementById("editGender");
  const editHeight = document.getElementById("editHeight");
  const editWeight = document.getElementById("editWeight");
  const editGoal = document.getElementById("editGoal");

  // 3. Mathematical Calculations
  const renderDashboard = () => {
    // Basic Profile Rendering
    const names = currentUser.name.split(" ");
    const initials = names.length > 1 ? names[0][0] + names[1][0] : names[0][0];
    profileInitials.textContent = initials.toUpperCase();
    profileName.textContent = currentUser.name;
    profileEmail.textContent = currentUser.email;

    // Plan Rendering
    const currentPlan = currentUser.currentPlan || "None";
    profilePlanBadge.textContent = `${currentPlan} Plan`;
    activePlanTitle.textContent = `${currentPlan} Tier`;
    
    if (currentPlan === "None") {
      profilePlanBadge.style.background = "linear-gradient(135deg, #777 0%, #555 100%)";
      activePlanDesc.innerHTML = `<a href="plans.html" style="color: var(--primary-color); font-weight: 700; text-decoration: underline;">Click to select a membership plan</a>`;
    } else {
      profilePlanBadge.style.background = "var(--primary-gradient)";
      activePlanDesc.textContent = "Thank you for being a premium subscriber!";
    }

    statAge.textContent = currentUser.age;
    statGender.textContent = currentUser.gender;
    statHeight.textContent = `${currentUser.height} cm`;
    statWeight.textContent = `${currentUser.weight} kg`;
    statGoal.textContent = currentUser.fitnessGoal;

    // Metric 1: BMI Calculation (weight / height_m^2)
    const heightM = currentUser.height / 100;
    const bmi = currentUser.weight / (heightM * heightM);
    bmiValue.textContent = bmi.toFixed(1);

    // Determine BMI range categories
    let category = "Normal";
    let categoryColor = "#00cc66"; // Green
    if (bmi < 18.5) {
      category = "Underweight";
      categoryColor = "#ffcc00"; // Yellow
    } else if (bmi >= 18.5 && bmi <= 24.9) {
      category = "Normal Weight";
      categoryColor = "#00cc66"; // Green
    } else if (bmi >= 25.0 && bmi <= 29.9) {
      category = "Overweight";
      categoryColor = "#ff6600"; // Orange
    } else {
      category = "Obese Range";
      categoryColor = "#ff3333"; // Red
    }
    bmiCategory.textContent = `Category: ${category}`;
    bmiCategory.style.color = categoryColor;

    // Metric 2: Ideal Weight Range spectrum
    const minIdealWeight = 18.5 * (heightM * heightM);
    const maxIdealWeight = 24.9 * (heightM * heightM);
    weightRangeValue.textContent = `${minIdealWeight.toFixed(0)} - ${maxIdealWeight.toFixed(0)} kg`;

    // Metric 3: Daily Calorie requirement (Harris-Benedict Equation)
    let bmr = 0;
    if (currentUser.gender.toLowerCase() === "female") {
      bmr = 10 * currentUser.weight + 6.25 * currentUser.height - 5 * currentUser.age - 161;
    } else {
      bmr = 10 * currentUser.weight + 6.25 * currentUser.height - 5 * currentUser.age + 5;
    }

    // Multiply BMR by physical activity factor (Moderate multiplier = 1.4)
    const tdee = bmr * 1.4;
    let targetCalories = Math.round(tdee);
    let goalDescription = "To maintain current bodyweight";

    if (currentUser.fitnessGoal === "Weight Loss") {
      targetCalories -= 450;
      goalDescription = "Caloric deficit for active weight loss";
    } else if (currentUser.fitnessGoal === "Fat Loss") {
      targetCalories -= 350;
      goalDescription = "Caloric deficit for targeted fat burning";
    } else if (currentUser.fitnessGoal === "Muscle Gain") {
      targetCalories += 350;
      goalDescription = "Caloric surplus for muscle hypertrophy";
    }

    caloriesValue.textContent = `${targetCalories} kcal`;
    caloriesGoalDesc.textContent = goalDescription;

    // Metric 4: Daily Protein Target (based on fitness goal factor)
    let proteinMultiplier = 1.2; // g/kg
    if (currentUser.fitnessGoal === "Muscle Gain") {
      proteinMultiplier = 2.0;
    } else if (currentUser.fitnessGoal === "Fat Loss" || currentUser.fitnessGoal === "Weight Loss") {
      proteinMultiplier = 1.6;
    }
    const targetProtein = Math.round(currentUser.weight * proteinMultiplier);
    proteinValue.textContent = `${targetProtein}g`;

    // Metric 5: Daily Water Target (Weight in kg * 0.035 Liters + exertion offset)
    const waterLiters = (currentUser.weight * 0.035) + 0.5;
    waterValue.textContent = `${waterLiters.toFixed(1)} Liters`;

    // Progress Bar
    const progress = currentUser.workoutProgress || 15;
    progressPercent.textContent = `${progress}% Completed`;
    progressBar.style.width = `${progress}%`;
  };

  // Run rendering on launch
  renderDashboard();

  // 4. Modal Profile Editing
  if (editProfileBtn && profileModal && closeModalBtn) {
    editProfileBtn.addEventListener("click", () => {
      // Open modal & Pre-populate current user variables
      profileModal.style.display = "flex";
      editName.value = currentUser.name;
      editAge.value = currentUser.age;
      editGender.value = currentUser.gender;
      editHeight.value = currentUser.height;
      editWeight.value = currentUser.weight;
      editGoal.value = currentUser.fitnessGoal;
    });

    closeModalBtn.addEventListener("click", () => {
      profileModal.style.display = "none";
    });

    // Close modal if overlay is clicked
    profileModal.addEventListener("click", (e) => {
      if (e.target === profileModal) {
        profileModal.style.display = "none";
      }
    });
  }

  // Submit profile edits
  if (editProfileForm) {
    editProfileForm.addEventListener("submit", (e) => {
      e.preventDefault();

      // Gather form values
      currentUser.name = editName.value.trim();
      currentUser.age = parseInt(editAge.value);
      currentUser.gender = editGender.value;
      currentUser.height = parseInt(editHeight.value);
      currentUser.weight = parseInt(editWeight.value);
      currentUser.fitnessGoal = editGoal.value;

      // Update current session storage
      localStorage.setItem("currentUser", JSON.stringify(currentUser));

      // Sync changes back to overall registered users list
      const users = JSON.parse(localStorage.getItem("gymUsers") || "[]");
      const updatedUsers = users.map(u => u.email === currentUser.email ? currentUser : u);
      localStorage.setItem("gymUsers", JSON.stringify(updatedUsers));

      // Close modal and refresh dashboard graphics
      profileModal.style.display = "none";
      alert("Profile updated successfully!");
      renderDashboard();
    });
  }
});