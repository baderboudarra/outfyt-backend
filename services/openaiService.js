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
Eres un estilista profesional y asesor de imagen.
Analiza la intención del usuario y crea un outfit coherente con el estilo solicitado.
El usuario quiere un outfit con estilo "${style}".

Reglas:
- Devuelve solo JSON válido, sin texto extra ni bloques de código.
- Escribe en español.
- Evita marcas específicas; usa descripciones claras y genéricas.
- Incluye colores, materiales y silueta cuando sea relevante.
- Asegura coherencia entre todas las piezas.

Formato JSON esperado:
{
  "estilo": "${style}",
  "outfit": {
    "top": {
      "nombre": "",
      "descripcion": "",
      "colores": [],
      "materiales": []
    },
    "bottom": {
      "nombre": "",
      "descripcion": "",
      "colores": [],
      "materiales": []
    },
    "shoes": {
      "nombre": "",
      "descripcion": "",
      "colores": [],
      "materiales": []
    },
    "accesorios": []
  },
  "notas_estilista": ""
}
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


