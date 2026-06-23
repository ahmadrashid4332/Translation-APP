import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post("/api/translate", async (req, res) => {
    try {
      const { text, sourceLanguage = 'ru', targetLanguage = 'en' } = req.body;
      if (!text) {
        return res.status(400).json({ error: "Text is required" });
      }

      let prompt = `Translate the following Roman Urdu text to English.
INTELLIGENT SENSING REQUIRED: Natively align all phonetic variants of Roman Urdu negatives (e.g., 'ni', 'nhi', 'nahi', 'nahe', 'nh') as context-appropriate English negatives ('no' / 'not'). 
Apply internal semantic context mapping so phonetic variations translate accurately.
Ensure high fidelity translation that sounds natural in English.

Roman Urdu Text: "${text}"`;
      
      let systemInstruction = "You are an expert Roman Urdu to English translator.";

      if (sourceLanguage === 'en' && targetLanguage === 'ru') {
        prompt = `Translate the following English text to Roman Urdu.
Ensure the Roman Urdu translation uses natural, conversational phonetic spelling common in everyday chat.
Maintain the semantic intent and tone of the original English text perfectly.

English Text: "${text}"`;
        systemInstruction = "You are an expert English to Roman Urdu translator.";
      }

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.1,
        },
      });

      res.json({ translation: response.text });
    } catch (error: any) {
      let errorMessage = "Translation failed";
      let statusCode = 500;

      const isQuotaError = error?.message?.includes("exceeded your current quota") || error?.status === "RESOURCE_EXHAUSTED" || error?.status === 429;
      const isUnavailable = error?.message?.includes("experiencing high demand") || error?.status === "UNAVAILABLE" || error?.status === 503;

      if (isQuotaError) {
        errorMessage = "API quota exceeded. Please wait a moment and try again.";
        statusCode = 429;
        console.warn("Translation API quota exceeded. Returning 429.");
      } else if (isUnavailable) {
        errorMessage = "The translation service is currently experiencing high demand. Please try again in a few moments.";
        statusCode = 503;
        console.warn("Translation API 503 Unavailable.");
      } else {
        console.error("Translation error:", error);
        if (error?.message) {
          try {
            // Attempt to parse JSON error message if the API returns a stringified JSON object
            const parsed = JSON.parse(error.message);
            if (parsed.error && parsed.error.message) {
              errorMessage = parsed.error.message;
            } else {
              errorMessage = error.message;
            }
          } catch (e) {
            errorMessage = error.message;
          }
        }
      }
      
      res.status(statusCode).json({ error: errorMessage });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
