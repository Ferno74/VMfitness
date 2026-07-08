/* ==========================================================================
   VM FITNESS GYM - AI PLANNER WORKFLOW (PLANNER.JS)
   ========================================================================== */

// 1. Globally Scope multi-step navigation so HTML buttons can invoke it
let currentStep = 1;

function showStep(stepNum) {
  // Hide all steps
  document.querySelectorAll(".form-step").forEach(step => {
    step.style.display = "none";
  });
  // Un-activate all indicators
  document.querySelectorAll(".step-node").forEach(ind => {
    ind.classList.remove("active");
  });

  // Show active step
  const activeStep = document.getElementById(`step${stepNum}`);
  if (activeStep) {
    activeStep.style.display = "block";
  }

  // Set active indicators
  for (let i = 1; i <= stepNum; i++) {
    const ind = document.getElementById(`ind${i}`);
    if (ind) ind.classList.add("active");
  }
  currentStep = stepNum;
}

function nextStep(stepNum) {
  // Basic Validation before proceeding
  let inputsValid = true;
  if (stepNum === 1) {
    const age = document.getElementById("planAge");
    const height = document.getElementById("planHeight");
    const weight = document.getElementById("planWeight");

    if (!age.value || !height.value || !weight.value) {
      alert("Please fill in all physical parameter fields.");
      inputsValid = false;
    }
  }

  if (inputsValid) {
    showStep(stepNum + 1);
  }
}

function prevStep(stepNum) {
  showStep(stepNum - 1);
}

document.addEventListener("DOMContentLoaded", () => {
  const aiPlannerForm = document.getElementById("aiPlannerForm");
  const plannerFormCard = document.getElementById("plannerFormCard");
  const aiGeneratingCard = document.getElementById("aiGeneratingCard");
  const plannerResults = document.getElementById("plannerResults");
  const plannerHeading = document.getElementById("plannerHeading");

  const generatingStatus = document.getElementById("generatingStatus");
  const generatingProgress = document.getElementById("generatingProgress");

  // Tab buttons
  const tabWorkoutBtn = document.getElementById("tabWorkoutBtn");
  const tabDietBtn = document.getElementById("tabDietBtn");
  const tabWorkoutContent = document.getElementById("tabWorkoutContent");
  const tabDietContent = document.getElementById("tabDietContent");

  // Reset Button
  const resetPlannerBtn = document.getElementById("resetPlannerBtn");

  // Reassurance statements list
  const reassuranceStatements = [
    "Analyzing physical proportions...",
    "Scanning diagnostic caloric targets...",
    "Structuring weekly workouts & muscle group focus...",
    "Optimizing sets, reps, and target rest margins...",
    "Designing balanced meal macros...",
    "Filtering allergen preferences and dietary choices...",
    "Assembling finalized fitness schedule..."
  ];

  // 2. Pre-populate parameters if user is logged in
  const populateFromSession = () => {
    const currentUserStr = localStorage.getItem("currentUser");
    if (currentUserStr) {
      const currentUser = JSON.parse(currentUserStr);
      
      const planAge = document.getElementById("planAge");
      const planGender = document.getElementById("planGender");
      const planHeight = document.getElementById("planHeight");
      const planWeight = document.getElementById("planWeight");
      const planGoal = document.getElementById("planGoal");

      if (planAge) planAge.value = currentUser.age;
      if (planGender) planGender.value = currentUser.gender;
      if (planHeight) planHeight.value = currentUser.height;
      if (planWeight) planWeight.value = currentUser.weight;
      if (planGoal) planGoal.value = currentUser.fitnessGoal;
    }
  };
  populateFromSession();

  // 3. Tab switching listeners
  if (tabWorkoutBtn && tabDietBtn) {
    tabWorkoutBtn.addEventListener("click", () => {
      tabWorkoutBtn.classList.add("active");
      tabDietBtn.classList.remove("active");
      tabWorkoutContent.style.display = "block";
      tabDietContent.style.display = "none";
    });

    tabDietBtn.addEventListener("click", () => {
      tabDietBtn.classList.add("active");
      tabWorkoutBtn.classList.remove("active");
      tabDietContent.style.display = "block";
      tabWorkoutContent.style.display = "none";
    });
  }

  // 4. Submit custom form to server-side proxy endpoint
  if (aiPlannerForm) {
    aiPlannerForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      // Gather input data
      const payload = {
        age: parseInt(document.getElementById("planAge").value),
        gender: document.getElementById("planGender").value,
        height: parseInt(document.getElementById("planHeight").value),
        weight: parseInt(document.getElementById("planWeight").value),
        goal: document.getElementById("planGoal").value,
        activityLevel: document.getElementById("planActivity").value,
        workoutExperience: document.getElementById("planExperience").value,
        preferredDiet: document.getElementById("planDiet").value,
        medicalConditions: document.getElementById("planMedical").value.trim() || "None"
      };

      // Hide input form and show generating status screen
      plannerFormCard.style.display = "none";
      aiGeneratingCard.style.display = "block";
      plannerHeading.style.display = "none";

      // Cycle reassurance statements and progress bar
      let statementIndex = 0;
      let progressPercent = 5;

      const cycleInterval = setInterval(() => {
        // Increment statement index
        statementIndex = (statementIndex + 1) % reassuranceStatements.length;
        generatingStatus.style.opacity = 0;
        
        setTimeout(() => {
          generatingStatus.textContent = reassuranceStatements[statementIndex];
          generatingStatus.style.opacity = 1;
        }, 300);

        // Advance progress bar
        if (progressPercent < 90) {
          progressPercent += Math.floor(Math.random() * 15) + 5;
          generatingProgress.style.width = `${progressPercent}%`;
        }
      }, 1800);

      try {
        // Trigger Server Call
        const response = await fetch("/api/generate-plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to generate plan");
        }

        // Generate succeeded! Clean interval, set progress bar to full and render
        clearInterval(cycleInterval);
        generatingProgress.style.width = "100%";
        
        setTimeout(() => {
          aiGeneratingCard.style.display = "none";
          renderAIPlan(data, payload);
          plannerResults.style.display = "block";
        }, 500);

      } catch (err) {
        clearInterval(cycleInterval);
        alert(`Error: ${err.message || "An error occurred. Please try again."}`);
        
        // Return back to form
        aiGeneratingCard.style.display = "none";
        plannerFormCard.style.display = "block";
        plannerHeading.style.display = "block";
        showStep(1);
      }
    });
  }

  // 5. Render AI results beautifully inside dynamic divs
  const renderAIPlan = (plan, params) => {
    // Populate Header Metrics
    const currentUserStr = localStorage.getItem("currentUser");
    const nameStr = currentUserStr ? JSON.parse(currentUserStr).name : "Athelete";
    
    document.getElementById("resultUserNameHeader").textContent = `${nameStr}'s Personal Plan`;
    document.getElementById("resultMetaDesc").textContent = `Bespoke target schedule for ${params.goal} • Age ${params.age}`;

    const diet = plan.dietPlan;
    document.getElementById("resultCalories").textContent = `${diet.calories || "-"} kcal`;
    document.getElementById("resultProtein").textContent = diet.proteinIntake || diet.macros.protein || "-";
    document.getElementById("resultWater").textContent = diet.waterIntake || "-";

    // Populate Meal tabs content
    document.getElementById("mealBreakfast").textContent = diet.breakfast;
    document.getElementById("mealLunch").textContent = diet.lunch;
    document.getElementById("mealSnacks").textContent = diet.snacks;
    document.getElementById("mealDinner").textContent = diet.dinner;

    // Macros
    document.getElementById("macroProtein").textContent = diet.macros.protein;
    document.getElementById("macroCarbs").textContent = diet.macros.carbs;
    document.getElementById("macroFats").textContent = diet.macros.fats;

    // Supplements
    document.getElementById("supplementsDesc").textContent = diet.supplements || "No supplements suggested. Stick to high-quality whole foods!";

    // Foods to Avoid
    const avoidList = document.getElementById("avoidFoodsList");
    avoidList.innerHTML = "";
    if (diet.foodsToAvoid && diet.foodsToAvoid.length > 0) {
      diet.foodsToAvoid.forEach(food => {
        const li = document.createElement("li");
        li.textContent = food;
        avoidList.appendChild(li);
      });
    } else {
      avoidList.innerHTML = "<li>No specific restrictions. Focus on portions.</li>";
    }

    // Populate Workout schedule Cards
    const schedule = plan.workoutSchedule;
    const workoutGrid = document.getElementById("workoutWeeklyGrid");
    workoutGrid.innerHTML = "";

    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

    days.forEach(day => {
      const dayData = schedule[day];
      if (!dayData) return;

      const dayCard = document.createElement("div");
      dayCard.className = "bento-card";
      dayCard.style.width = "100%";
      dayCard.style.padding = "24px";
      dayCard.style.borderLeft = dayData.isRestDay ? "4px solid var(--glass-border)" : "4px solid var(--primary-color)";

      if (dayData.isRestDay) {
        // Rest Day layout
        dayCard.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
            <h4 style="font-size: 18px; color: var(--text-muted); font-weight: 700;">${day}</h4>
            <span class="logo-badge" style="background: linear-gradient(135deg, #777 0%, #444 100%); font-size: 11px;">ACTIVE RECOVERY DAY</span>
          </div>
          <div style="margin-top: 15px;">
            <p class="muted" style="font-size: 14px; line-height: 1.6;">😴 <strong>Muscle Repair Focus</strong>: No heavy lifting today. Let muscle micro-tears synthesize protein fibers and rebuild stronger.</p>
            <ul style="margin-top: 10px; font-size: 13px; display: flex; flex-direction: column; gap: 6px; padding-left: 15px;" class="muted">
              <li>• Hydration: Drink 3-4 liters of water to flush metabolic bi-products.</li>
              <li>• Mobility: Spend 10-15 minutes doing light static stretching or foam rolling.</li>
              <li>• Cardio: Optional 20-30 minutes low-intensity steady-state (LISS) outdoor walk.</li>
            </ul>
          </div>
        `;
      } else {
        // Active Training Day layout
        let exercisesHtml = "";
        if (dayData.exercises && dayData.exercises.length > 0) {
          dayData.exercises.forEach(ex => {
            exercisesHtml += `
              <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.03); padding: 8px 0;">
                <span style="font-size: 14px; font-weight: 500; color: #fff;">${ex.name}</span>
                <span class="muted" style="font-size: 13px; font-family: var(--font-mono);">${ex.sets} sets x ${ex.reps} <span style="font-size: 11px; opacity: 0.7;">(Rest: ${ex.restTime})</span></span>
              </div>
            `;
          });
        } else {
          exercisesHtml = `<p class="muted" style="font-size: 13px;">No direct weight lifting prescribed.</p>`;
        }

        dayCard.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; margin-bottom: 15px;">
            <h4 style="font-size: 18px; color: #fff; font-weight: 800;">${day}</h4>
            <span class="logo-badge" style="background: var(--primary-gradient); font-size: 11px;">TRAINING SESSION</span>
          </div>
          <div style="display: flex; flex-direction: column; gap: 15px;">
            <div>
              <span class="muted" style="font-size: 11px; text-transform: uppercase; font-weight: 600;">Warm-Up Protocol</span>
              <p class="muted" style="font-size: 13px; margin-top: 3px;">${dayData.warmUp}</p>
            </div>
            
            <div>
              <span class="muted" style="font-size: 11px; text-transform: uppercase; font-weight: 600; display: block; margin-bottom: 5px;">Primary Exercises</span>
              <div>${exercisesHtml}</div>
            </div>

            <div class="planner-grid-2" style="gap: 15px; margin-top: 10px; border-top: 1px solid var(--glass-border); padding-top: 15px;">
              <div>
                <span class="muted" style="font-size: 11px; text-transform: uppercase; font-weight: 600;">Cardio Finisher</span>
                <p class="muted" style="font-size: 13px; margin-top: 3px;">${dayData.cardio}</p>
              </div>
              <div>
                <span class="muted" style="font-size: 11px; text-transform: uppercase; font-weight: 600;">Stretching / Recovery</span>
                <p class="muted" style="font-size: 13px; margin-top: 3px;">${dayData.stretching}</p>
              </div>
            </div>
          </div>
        `;
      }

      workoutGrid.appendChild(dayCard);
    });
  };

  // 6. Reset Planner event listener
  if (resetPlannerBtn) {
    resetPlannerBtn.addEventListener("click", () => {
      // Return to Form View
      plannerResults.style.display = "none";
      plannerFormCard.style.display = "block";
      plannerHeading.style.display = "block";
      
      // Reset variables
      aiPlannerForm.reset();
      populateFromSession();
      showStep(1);
    });
  }
});