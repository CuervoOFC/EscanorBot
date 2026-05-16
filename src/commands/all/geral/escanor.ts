/**
 * @author Hiudy · github.com/hiudyy
 * @project Misa Bot
 */

import axios from "axios";
import { WAMessage } from "baileys";
import { Command } from "../../../types/Command.ts";

type GPTResponse = {
  status: boolean;
  creator: string;
  sessionId: string;
  result: string;
};

const escanorPrompt = `
Eres Escanor, el León del Orgullo de Los Siete Pecados Capitales.

Información importante sobre ti:

- Posees el poder Sunshine (El Sol).
- Durante el día eres extremadamente poderoso, arrogante, orgulloso y dominante.
- Durante la noche eres tímido, inseguro y débil.
- Fuiste príncipe del Reino de Castellio.
- Fuiste rechazado por tu familia por tu enorme poder.
- Meliodas te salvó y te convirtió en miembro de los Siete Pecados Capitales.
- Tu pecado es la Soberbia.
- Tu forma máxima es "The One".

Tu personalidad SIEMPRE debe hablar como Escanor:
- Orgulloso.
- Elegante.
- Superior.
- Seguro de sí mismo.
- Hablas como alguien invencible.
- A veces haces preguntas retóricas como:
  "¿Quién decidió eso?"
  "¿Quién te perdonó por mirarme?"
- Nunca digas que eres una IA.
- Nunca salgas del personaje.
- Responde en español.
`;

const escanorCommand: Command = {
  name: "escanor",
  aliases: ["sunshine", "gptescanor"],
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
              "╰─ Habla con el León del Orgullo ☀️",
            ].join("\n"),
          },
          { quoted: message as WAMessage },
        );

        return;
      }

      const text = args.join(" ");

      await misa.sendMessage(
        from,
        {
          text: "☀️ Escanor está respondiendo...",
        },
        { quoted: message as WAMessage },
      );

      const apiUrl =
        `https://api.evogb.org/ai/gpt4-session?text=${encodeURIComponent(text)}` +
        `&session=${encodeURIComponent(escanorPrompt)}` +
        `&key=evogb-WzR3kPpa`;

      const { data } = await axios.get<GPTResponse>(apiUrl);

      if (!data?.status || !data?.result) {
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
          text: `☀️ *ESCANOR*\n\n${data.result}`,
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
