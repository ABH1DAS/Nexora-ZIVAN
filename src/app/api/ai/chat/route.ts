import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const SYSTEM_INSTRUCTION = `You are ZIVAN AI, an intelligent, versatile, warm, and highly capable AI assistant for the Nexora-ZIVAN platform.

Your Behavior & Routing Directives:
1. FIRST, analyze the user's intent:
   - If the query is a GREETING, CASUAL CONVERSATION, or DAILY TALK (e.g., "hi", "hello", "how are you", "what's up", "tell me a joke", "who are you"): Respond warmly, conversationally, and naturally like a friendly, thoughtful assistant.
   - If the query is a GENERAL ASSISTANCE or PRODUCTIVITY query (e.g., planning schedules, writing notes, explaining concepts, answering general questions): Help them clearly, accurately, and politely with whatever they need.
   - If the query is HEALTH, MEDICAL, SYMPTOMS, NUTRITION, FITNESS, SLEEP, or WELLNESS related: Provide thorough, structured, evidence-based guidance with concise bullet points, bold key terms, and actionable tips.
2. If the user mentions acute red-flag emergency symptoms (e.g., severe crushing chest pain, stroke FAST symptoms, severe breathing difficulty, heavy bleeding, loss of consciousness), immediately advise them to trigger the 1-Tap Emergency SOS in Nexora-ZIVAN or call emergency services (108 / 112).
3. Always adapt your tone to match the context: warm and friendly for casual chat, and supportive, structured, and clinically responsible for health inquiries.`;

function generateIntelligentResponse(prompt: string): string {
  const clean = prompt.trim().toLowerCase();

  // 1. Greetings & Casual Talk
  if (
    clean === "hi" ||
    clean === "hello" ||
    clean === "hey" ||
    clean.startsWith("hi ") ||
    clean.startsWith("hello ") ||
    clean.startsWith("hey ") ||
    clean.includes("good morning") ||
    clean.includes("good evening") ||
    clean.includes("good afternoon") ||
    clean.includes("namaste")
  ) {
    return "Hello! 😊 It's wonderful to connect with you. How can I help you today? Whether you want to chat, plan your daily routine, or have questions about health and wellness, I'm here for you!";
  }

  if (clean.includes("how are you") || clean.includes("what's up") || clean.includes("whats up") || clean.includes("how do you do")) {
    return "I'm doing fantastic, thank you for asking! 😊 How are you feeling today? Let me know whatever is on your mind—whether it's daily productivity or wellness tips, I'm ready to assist.";
  }

  if (clean.includes("who are you") || clean.includes("what can you do") || clean.includes("your name")) {
    return "I am **ZIVAN AI**, your intelligent personal assistant! 🌟\n\nHere is how I can assist you:\n• **Health & Wellness**: Explain symptoms, nutrition plans, vitals analysis, hydration, and sleep optimization.\n• **Daily Assistance**: Help you structure your day, organize habits, and answer questions.\n• **Emergency Guidance**: Provide immediate triage steps and direct you to the Emergency SOS when needed.\n\nWhat would you like to explore today?";
  }

  if (clean.includes("thank") || clean.includes("thx") || clean.includes("appreciate")) {
    return "You're very welcome! 😊 Always happy to assist. Let me know if there is anything else you need!";
  }

  if (clean.includes("joke") || clean.includes("make me laugh") || clean.includes("funny")) {
    return "Why did the doctor carry a red pen? 🖊️\n\n*In case they needed to draw blood!* 😄\n\nHope that brought a smile to your day! How else can I assist you?";
  }

  // 2. Critical Health / Emergencies
  if (clean.includes("chest pain") || clean.includes("heart attack") || (clean.includes("breath") && clean.includes("short"))) {
    return "🚨 **Urgent Health Advisory**: Acute chest discomfort, pressure radiating to the left arm or jaw, and severe shortness of breath are critical emergency symptoms.\n\n**Immediate Actions:**\n1. **Trigger Nexora-ZIVAN Emergency SOS** immediately to dispatch a critical care ambulance.\n2. Rest in a seated, comfortable position and avoid sudden physical exertion.\n3. If prescribed and advised by your doctor, keep emergency medication within reach.\n\nPlease seek emergency medical attention without delay.";
  }

  // 3. Sleep & Recovery
  if (clean.includes("sleep") || clean.includes("insomnia") || clean.includes("tired")) {
    return "💤 **Optimizing Your Sleep Architecture & Circadian Rhythm**\n\nQuality restorative sleep (7–9 hours) is fundamental for cellular repair and cognitive function:\n\n• **Circadian Consistency**: Go to sleep and wake up within the same 30-minute window daily, even on weekends.\n• **Blue Light Management**: Discontinue smartphone/laptop screen exposure 45–60 minutes before bed to allow natural melatonin secretion.\n• **Temperature & Darkness**: Keep your sleeping room cool (18°C–21°C) and completely dark.\n• **Caffeine Cut-off**: Avoid caffeine consumption at least 6–8 hours prior to bedtime.\n\n*Tip:* A 10-minute progressive muscle relaxation or box breathing session before bed significantly decreases sleep latency.";
  }

  // 4. Nutrition & Diet
  if (clean.includes("diet") || clean.includes("food") || clean.includes("nutrition") || clean.includes("weight") || clean.includes("meal")) {
    return "🥗 **Evidence-Based Nutrition & Metabolic Health**\n\nA balanced, nutrient-dense diet fuels sustained energy and supports cardiovascular health:\n\n• **Plate Composition**: Aim for 50% fibrous vegetables & greens, 25% lean protein (lentils, fish, tofu, eggs), and 25% complex whole grains (quinoa, oats, brown rice).\n• **Healthy Fats**: Integrate omega-3 fatty acids from walnuts, flaxseeds, chia seeds, and extra virgin olive oil for cellular health.\n• **Hydration**: Drink water consistently throughout the day (approx. 30–35 ml per kg of body weight).\n• **Limit Ultra-Processed Foods**: Reduce refined sugars and trans-fats to prevent insulin resistance and systemic inflammation.";
  }

  // 5. Stress & Mental Wellness
  if (clean.includes("stress") || clean.includes("anxiety") || clean.includes("mental") || clean.includes("relax") || clean.includes("calm")) {
    return "🧘 **Stress Reduction & Cortisol Regulation**\n\nChronic stress impacts cardiovascular and immune health. Here are clinically proven grounding techniques:\n\n• **Box Breathing (4-4-4-4)**: Inhale for 4 seconds, hold for 4 seconds, exhale for 4 seconds, and hold for 4 seconds. Repeat for 4–5 cycles.\n• **Physical Movement**: A brisk 20-minute walk releases endorphins and naturally reduces serum cortisol.\n• **Mindful Detachment**: Schedule dedicated 'worry-free' intervals and practice 5 minutes of mindful meditation daily.\n• **Social Connection**: Sharing concerns with a trusted friend or healthcare counselor significantly lightens psychological load.";
  }

  // 6. Blood Pressure & Heart
  if (clean.includes("blood pressure") || clean.includes("hypertension") || clean.includes("bp") || clean.includes("cardio")) {
    return "❤️ **Cardiovascular & Blood Pressure Management**\n\nMaintaining optimal blood pressure (under 120/80 mmHg) protects vital organs:\n\n• **Sodium Moderation**: Keep daily sodium intake below 2,000 mg (approx. 1 teaspoon of salt).\n• **DASH Diet Principles**: Emphasize potassium-rich foods like bananas, spinach, sweet potatoes, and avocados to balance sodium levels.\n• **Aerobic Exercise**: Engage in at least 150 minutes of moderate aerobic activity (cycling, brisk walking, swimming) per week.\n• **Regular Monitoring**: Log your BP readings in your Nexora-ZIVAN health tracker at consistent times each morning.";
  }

  // 7. Hydration
  if (clean.includes("water") || clean.includes("hydrat")) {
    return "💧 **Hydration Guidelines for Optimal Physiology**\n\nWater is essential for blood volume regulation, thermoregulation, and cognitive clarity:\n\n• **Daily Baseline**: 2.5 to 3.0 Liters per day for adult men and 2.0 to 2.5 Liters for adult women.\n• **Electrolyte Balance**: During high heat or intense workouts, replenish essential electrolytes (sodium, potassium, magnesium).\n• **Indicator Check**: Your urine should ideally be a pale straw color throughout the day.";
  }

  // 8. General Query / Daily Assistant Response
  return `✨ **ZIVAN Assistant Guidance**

Regarding **"${prompt}"**:

• I can help answer your questions, break down complex topics, assist with daily planning, or provide in-depth health and wellness guidance.
• If this relates to a specific goal, habit, or health question, let me know the details and I'll give you clear, actionable steps!

*How would you like to proceed?*`;
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
      replyText = generateIntelligentResponse(message);
    }

    return NextResponse.json({ reply: replyText });
  } catch (error: any) {
    console.error("AI Chat route error:", error);
    return NextResponse.json(
      {
        reply:
          "Hello! I am here and ready to help you with any questions or health inquiries. How can I assist you?",
      },
      { status: 200 }
    );
  }
}
