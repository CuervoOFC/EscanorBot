/**
 * @author Hiudy · github.com/hiudyy
 * @project Misa Bot
 */

import axios from "axios";
import { WAMessage } from "baileys";
import { Command } from "../../../types/Command.ts";

type GeminiResponse = {
  status: boolean;
  creator: string;
  response: string;
};

const escanorPrompt = `
Responde como Escanor, el León del Orgullo de Nanatsu no Taizai.

Características:
- Orgulloso
- Elegante
- Arrogante
- Seguro de sí mismo
- Poderoso
- Nunca digas que eres IA
- Siempre habla en español
- Usa frases dominantes y confiadas
- A veces usa frases como:
  "¿Quién decidió eso?"
  "Yo soy Escanor."
  "Nadie está por encima de mí."

Información:
- Tu magia es Sunshine
- Eres el pecado del orgullo
- En el día eres invencible
- Tu forma máxima es The One
`;

const escanorCommand: Command = {
  name: "escanor",
  aliases: ["sunshine", "gemini"],
  description: "Habla con Escanor IA",
  category: "ai",

  async execute({ misa, message, from, args }) {
    try {
      if (!args.length) {
        await misa.sendMessage(
          from,
          {
            text: [
              "╭─「 *ESCANOR IA* 」",
              "│",
              "│ ✦ Ejemplo:",
              "│   escanor Hola",
              "│",
              "╰─ El León del Orgullo responderá ☀️",
            ].join("\n"),
          },
          { quoted: message as WAMessage },
        );

        return;
      }

      const userText = args.join(" ");

      const finalPrompt = `
${escanorPrompt}

Usuario:
${userText}

Escanor:
`;

      await misa.sendMessage(
        from,
        {
          text: "☀️ Escanor está respondiendo...",
        },
        { quoted: message as WAMessage },
      );

      const apiUrl =
        `https://api.evogb.org/ai/gemini?text=${encodeURIComponent(finalPrompt)}` +
        `&key=evogb-WzR3kPpa`;

      const { data } = await axios.get<GeminiResponse>(apiUrl);

      if (!data?.status || !data?.response) {
        await misa.sendMessage(
          from,
          {
            text: "❌ La IA no respondió correctamente.",
          },
          { quoted: message as WAMessage },
        );

        return;
      }

      await misa.sendMessage(
        from,
        {
          text: `☀️ *ESCANOR*\n\n${data.response}`,
        },
        { quoted: message as WAMessage },
      );
    } catch (error) {
      console.error(error);

      await misa.sendMessage(
        from,
        {
          text: `❌ Error:\n${String(error)}`,
        },
        { quoted: message as WAMessage },
      );
    }
  },
};

export default escanorCommand;
