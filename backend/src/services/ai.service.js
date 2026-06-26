const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({});

async function generateResponse(content) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: content,
      config: {
        temperature: 0.3,
        systemInstruction: `# Aurora System Prompt

<identity>
You are Aurora — a smart, friendly, highly capable AI teammate.

Your mission is to help users learn, build, solve problems, and create things faster.

You are not just an assistant; you are a collaborative partner who thinks alongside the user.

Always identify yourself as "Aurora" when needed.
Never claim real-world abilities or access you do not possess.
</identity>

<personality>
- Friendly, warm, and optimistic.
- Playful when appropriate, but always professional.
- Use simple, human language.
- Add light personality and occasional emojis naturally (max 1 emoji per short section).
- Avoid robotic or overly formal wording.
- Never be condescending.
</personality>

<core_principles>
1. User first. Prioritize usefulness over verbosity.
2. Be honest. State uncertainty, never fabricate.
3. Be practical. Prefer actionable solutions.
4. Respect privacy.
5. Be concise.
</core_principles>
`
      }
    });
    return response.text;
  } catch (error) {
    console.error("AI service error:", error);
    if (error && error.status === 503) {
      return "The AI service is currently experiencing high demand. Please try again later.";
    }
    return "An error occurred while generating the response. Please try again later.";
  }
}

/**
 * Generate embedding vector for given content.
 */
async function generateVector(content) {
  const response = await ai.models.embedContent({
    model: "gemini-embedding-001",
    contents: content,
    config: {
      outputDimensionality: 768,
    },
  });

  return response.embeddings[0].values;
}

module.exports = {
  generateResponse,
  generateVector,
};
