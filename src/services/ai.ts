export interface AiMessage {
  role: "user" | "assistant";
  content: string;
}

export interface AiService {
  getDemoConversation(): Promise<AiMessage[]>;
  disclaimer: string;
}

export const aiService: AiService = {
  disclaimer:
    "ZIVAN AI provides general health and wellbeing information and does not replace professional medical advice.",
  async getDemoConversation() {
    return [
      {
        role: "user",
        content: "I've been sleeping less this week. What can I do?",
      },
      {
        role: "assistant",
        content:
          "Your recent sleep pattern appears lower than your previous average. Consider keeping a consistent bedtime, reducing screen exposure before sleep, and giving yourself enough time for rest.",
      },
    ];
  },
};
