import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    })
  : null;

// API Endpoint for AI Fitness Planner
app.post("/api/generate-plan", async (req, res) => {
  try {
    if (!ai) {
      return res.status(500).json({
        error: "Gemini API Key is not configured on the server. Please set GEMINI_API_KEY in Secrets.",
      });
    }

    const {
      age,
      gender,
      height,
      weight,
      goal,
      activityLevel,
      medicalConditions,
      workoutExperience,
      availableDays,
      availableTime,
      preferredWorkoutLocation,
      preferredDiet,
    } = req.body;

    // Validate request parameters
    if (!age || !gender || !height || !weight || !goal) {
      return res.status(400).json({ error: "Missing required profile parameters (age, gender, height, weight, goal)." });
    }

    const prompt = `
      You are an expert fitness coach and nutritionist. Create a highly personalized diet and workout plan for a user with the following profile:
      - Age: ${age} years old
      - Gender: ${gender}
      - Height: ${height} cm
      - Weight: ${weight} kg
      - Goal: ${goal}
      - Activity Level: ${activityLevel || "Moderate"}
      - Medical Conditions / Injuries: ${medicalConditions || "None"}
      - Workout Experience: ${workoutExperience || "Beginner"}
      - Available Workout Days: ${availableDays ? availableDays.join(", ") : "4 days a week"}
      - Available Workout Time: ${availableTime || "45-60 mins"} per session
      - Preferred Workout Location: ${preferredWorkoutLocation || "Gym"}
      - Diet Preference: ${preferredDiet || "Standard/Any"}

      Make sure that the diet and workout plans are realistic, healthy, and tailored specifically to the goal of ${goal}.
    `;

    // Define the exact schemas to guarantee a structure that the frontend can parse effortlessly
    const workoutDaySchema = {
      type: Type.OBJECT,
      properties: {
        isRestDay: { type: Type.BOOLEAN, description: "Whether this day is a rest day" },
        warmUp: { type: Type.STRING, description: "Warm-up instructions" },
        exercises: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: "Exercise name" },
              sets: { type: Type.INTEGER, description: "Number of sets" },
              reps: { type: Type.STRING, description: "Reps range (e.g. '10-12 reps') or duration" },
              restTime: { type: Type.STRING, description: "Rest time between sets (e.g. '60s')" }
            },
            required: ["name", "sets", "reps", "restTime"]
          },
          description: "List of exercises for this day"
        },
        cardio: { type: Type.STRING, description: "Cardio instructions (e.g., '15 mins incline treadmill walk')" },
        stretching: { type: Type.STRING, description: "Stretching instructions" },
        cooldown: { type: Type.STRING, description: "Cooldown instructions" }
      },
      required: ["isRestDay", "warmUp", "exercises", "cardio", "stretching", "cooldown"]
    };

    const fitnessPlanSchema = {
      type: Type.OBJECT,
      properties: {
        dietPlan: {
          type: Type.OBJECT,
          properties: {
            breakfast: { type: Type.STRING, description: "Breakfast meals and options" },
            lunch: { type: Type.STRING, description: "Lunch meals and options" },
            dinner: { type: Type.STRING, description: "Dinner meals and options" },
            snacks: { type: Type.STRING, description: "Healthy snacks options" },
            proteinIntake: { type: Type.STRING, description: "Daily protein target, e.g. '120g'" },
            waterIntake: { type: Type.STRING, description: "Daily water target, e.g. '3.5 Liters'" },
            calories: { type: Type.INTEGER, description: "Recommended daily caloric intake" },
            macros: {
              type: Type.OBJECT,
              properties: {
                protein: { type: Type.STRING, description: "Protein amount, e.g. '120g'" },
                carbs: { type: Type.STRING, description: "Carbs amount, e.g. '200g'" },
                fats: { type: Type.STRING, description: "Fats amount, e.g. '65g'" }
              },
              required: ["protein", "carbs", "fats"]
            },
            foodsToAvoid: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of foods to avoid" },
            supplements: { type: Type.STRING, description: "Optional suggested supplements or None" }
          },
          required: ["breakfast", "lunch", "dinner", "snacks", "proteinIntake", "waterIntake", "calories", "macros", "foodsToAvoid"]
        },
        workoutSchedule: {
          type: Type.OBJECT,
          properties: {
            Monday: workoutDaySchema,
            Tuesday: workoutDaySchema,
            Wednesday: workoutDaySchema,
            Thursday: workoutDaySchema,
            Friday: workoutDaySchema,
            Saturday: workoutDaySchema,
            Sunday: workoutDaySchema
          },
          required: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
        }
      },
      required: ["dietPlan", "workoutSchedule"]
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are a professional personal trainer and sports nutritionist. Provide highly precise, realistic and structured guides in strict JSON format.",
        responseMimeType: "application/json",
        responseSchema: fitnessPlanSchema,
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("Empty response from Gemini API");
    }

    const planData = JSON.parse(text.trim());
    res.json(planData);
  } catch (error: any) {
    console.error("Error generating plan:", error);
    res.status(500).json({ error: error.message || "Failed to generate plan due to an internal error." });
  }
});

// Setup Vite Dev Server in Development or Static Files in Production
async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in DEVELOPMENT mode with Vite Middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in PRODUCTION mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    
    // Serve HTML files at root
    app.get("/:page.html", (req, res) => {
      res.sendFile(path.join(distPath, `${req.params.page}.html`));
    });

    app.get("/", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });

    // Catch-all route to serve index.html for undefined pages
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

setupServer();