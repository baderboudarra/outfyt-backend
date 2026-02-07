const OpenAI = require("openai");
const fs = require("fs");

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY no definida en .env");
}

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function generateOutfit({ style, imagePath }) {
  try {
    // Por ahora SOLO TEXTO (seguro y estable)
    const prompt = `
Eres un estilista profesional.
El usuario quiere un outfit con estilo "${style}".

Sugiere un outfit completo (top, bottom, shoes).
Responde en JSON.
`;

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "user", content: prompt }
      ],
      temperature: 0.5,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("❌ OpenAI error:", error.message);
    throw error;
  }
}

module.exports = {
  generateOutfit,
};


