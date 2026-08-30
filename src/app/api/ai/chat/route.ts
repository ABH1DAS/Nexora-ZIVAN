import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const SYSTEM_INSTRUCTION = `You are ZIVAN AI, an intelligent, empathetic, and medically informed AI health & wellness companion for the Nexora-ZIVAN Healthcare platform.

Your Core Directives:
1. Answer health, wellness, symptoms, nutrition, fitness, sleep, mental wellbeing, and preventative medicine queries thoroughly, accurately, and compassionately.
2. Structure your guidance with clear formatting: concise bullet points, bold key terms, and easy-to-follow actionable steps.
3. If the user mentions acute red-flag emergency symptoms (crushing chest pain, left arm numbness, stroke FAST symptoms, severe respiratory distress, acute anaphylaxis, severe trauma), immediately advise triggering the 1-Tap Emergency SOS in Nexora-ZIVAN or calling 108/112.
4. Provide practical lifestyle recommendations (hydration targets, balanced macros, circadian rhythm alignment, stress management).
5. Conclude with a helpful health tip and standard clinical discretion reminder where relevant.`;

function generateIntelligentHealthResponse(prompt: string): string {
  const lower = prompt.toLowerCase();

  if (lower.includes("chest pain") || lower.includes("heart attack") || lower.includes("breath") && lower.includes("short")) {
    return "🚨 **Urgent Health Advisory**: Acute chest discomfort, pressure radiating to the left arm or jaw, and severe shortness of breath are critical emergency symptoms.\n\n**Immediate Actions:**\n1. **Trigger Nexora-ZIVAN Emergency SOS** immediately to dispatch a critical care ambulance.\n2. Rest in a seated, comfortable position and avoid sudden physical exertion.\n3. If prescribed and advised by your doctor, keep emergency medication within reach.\n\nPlease seek emergency medical attention without delay.";
  }

  if (lower.includes("sleep") || lower.includes("insomnia") || lower.includes("tired")) {
    return "💤 **Optimizing Your Sleep Architecture & Circadian Rhythm**\n\nQuality restorative sleep (7–9 hours) is fundamental for cellular repair and cognitive function:\n\n• **Circadian Consistency**: Go to sleep and wake up within the same 30-minute window daily, even on weekends.\n• **Blue Light Management**: Discontinue smartphone/laptop screen exposure 45–60 minutes before bed to allow natural melatonin secretion.\n• **Temperature & Darkness**: Keep your sleeping room cool (18°C–21°C) and completely dark.\n• **Caffeine Cut-off**: Avoid caffeine consumption at least 6–8 hours prior to bedtime.\n\n*Tip:* A 10-minute progressive muscle relaxation or box breathing session before bed significantly decreases sleep latency.";
  }

  if (lower.includes("diet") || lower.includes("food") || lower.includes("nutrition") || lower.includes("weight")) {
    return "🥗 **Evidence-Based Nutrition & Metabolic Health**\n\nA balanced, nutrient-dense diet fuels sustained energy and supports cardiovascular health:\n\n• **Plate Composition**: Aim for 50% fibrous vegetables & greens, 25% lean protein (lentils, fish, tofu, eggs), and 25% complex whole grains (quinoa, oats, brown rice).\n• **Healthy Fats**: Integrate omega-3 fatty acids from walnuts, flaxseeds, chia seeds, and extra virgin olive oil for cellular membrane health.\n• **Hydration**: Drink water consistently throughout the day (approx. 30–35 ml per kg of body weight).\n• **Limit Ultra-Processed Foods**: Reduce refined sugars and trans-fats to prevent insulin resistance and systemic inflammation.";
  }

  if (lower.includes("stress") || lower.includes("anxiety") || lower.includes("mental") || lower.includes("relax")) {
    return "🧘 **Stress Reduction & Cortisol Regulation**\n\nChronic stress impacts cardiovascular and immune health. Here are clinically proven grounding techniques:\n\n• **Box Breathing (4-4-4-4)**: Inhale for 4 seconds, hold for 4 seconds, exhale for 4 seconds, and hold for 4 seconds. Repeat for 4–5 cycles.\n• **Physical Movement**: A brisk 20-minute walk releases endorphins and naturally reduces serum cortisol.\n• **Mindful Detachment**: Schedule dedicated 'worry-free' intervals and practice 5 minutes of mindful meditation daily.\n• **Social Connection**: Sharing concerns with a trusted friend or healthcare counselor significantly lightens psychological load.";
  }

  if (lower.includes("blood pressure") || lower.includes("hypertension") || lower.includes("bp")) {
    return "❤️ **Cardiovascular & Blood Pressure Management**\n\nMaintaining optimal blood pressure (under 120/80 mmHg) protects vital organs:\n\n• **Sodium Moderation**: Keep daily sodium intake below 2,000 mg (approx. 1 teaspoon of salt).\n• **DASH Diet Principles**: Emphasize potassium-rich foods like bananas, spinach, sweet potatoes, and avocados to balance sodium levels.\n• **Aerobic Exercise**: Engage in at least 150 minutes of moderate aerobic activity (cycling, brisk walking, swimming) per week.\n• **Regular Monitoring**: Log your BP readings in your Nexora-ZIVAN health tracker at consistent times each morning.";
  }

  if (lower.includes("water") || lower.includes("hydrat")) {
    return "💧 **Hydration Guidelines for Optimal Physiology**\n\nWater is essential for blood volume regulation, thermoregulation, and cognitive clarity:\n\n• **Daily Baseline**: 2.5 to 3.0 Liters per day for adult men and 2.0 to 2.5 Liters for adult women.\n• **Electrolyte Balance**: During high heat or intense workouts, replenish essential electrolytes (sodium, potassium, magnesium).\n• **Indicator Check**: Your urine should ideally be a pale straw color throughout the day.";
  }

  return `🩺 **Health & Wellbeing Guidance**

Thank you for reaching out regarding **"${prompt}"**. 

Here are key medical & lifestyle considerations:
• **Consistent Foundations**: Sustainable health rests on 4 pillars: restorative sleep (7–8 hrs), balanced whole-food nutrition, regular physical movement (150 min/week), and proactive stress management.
• **Personalized Tracking**: Monitor key biomarkers like resting heart rate, blood pressure, and hydration to spot early trends.
• **Preventative Checkups**: Regular annual health screenings and lipid/metabolic panels help detect imbalances early.

*Feel free to ask more specific questions about symptoms, fitness plans, or wellness habits!*`;
}

export async function POST(req: NextRequest) {
  try {
    const { message, history = [] } = await req.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const apiKey =
      process.env.GEMINI_API_KEY ||
      process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY ||
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
      "";

    let replyText = "";

    if (apiKey) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
          model: "gemini-1.5-flash",
          systemInstruction: SYSTEM_INSTRUCTION,
        });

        const formattedHistory = history
          .filter((h: any) => h.content && h.content.trim())
          .map((h: { role: string; content: string }) => ({
            role: h.role === "assistant" || h.role === "model" ? "model" : "user",
            parts: [{ text: h.content }],
          }));

        const chat = model.startChat({
          history: formattedHistory,
        });

        const result = await chat.sendMessage(message);
        replyText = result.response.text();
      } catch (geminiErr: any) {
        console.warn("Gemini API call notice:", geminiErr?.message);
      }
    }

    if (!replyText) {
      replyText = generateIntelligentHealthResponse(message);
    }

    return NextResponse.json({ reply: replyText });
  } catch (error: any) {
    console.error("AI Chat route error:", error);
    return NextResponse.json(
      {
        reply:
          "I am here to assist with your health and wellbeing questions. Could you please specify your wellness query?",
      },
      { status: 200 }
    );
  }
}
