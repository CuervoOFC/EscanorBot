/**
 * @author Hiudy · github.com/hiudyy
 * @project Misa Bot
 */

import { WAMessage } from "baileys";
import { Command } from "../../../types/Command.js";

// Tipado de la API
type GoogleImageResult = {
  title: string;
  url: string;
  image: string;
};

type GoogleImageResponse = {
  status: boolean;
  creator: string;
  result: GoogleImageResult[];
};

const googleImageCommand: Command = {
  name: "gimage",
  aliases: ["googleimg", "imagen", "img"],
  description: "Busca imágenes en Google",
  category: "search",

  async execute({ misa, message, from, args }) {
    if (args.length === 0) {
      await misa.sendMessage(from, {
        text: [
          "╭─「 *GOOGLE IMAGES* 」",
          "│",
          "│ ✦ Buscar imágenes:",
          "│   gimage <texto>",
          "│",
          "╰─ Ejemplo:",
          "   gimage BMW",
        ].join("\n"),
      });
      return;
    }

    const query = args.join(" ");

    await misa.sendMessage(
      from,
      {
        text: `🔎 Buscando imágenes de: *${query}*`,
      },
      { quoted: message as WAMessage }
    );

    try {
      // API
      const response = await fetch(
        `https://api.evogb.org/search/googleimage?query=${encodeURIComponent(
          query
        )}&key=evogb-WzR3kPpa`
      );

      const result: GoogleImageResponse = await response.json();

      if (
        !result.status ||
        !result.result ||
        result.result.length === 0
      ) {
        await misa.sendMessage(
          from,
          {
            text: "❌ No se encontraron imágenes.",
          },
          { quoted: message as WAMessage }
        );
        return;
      }

      // Primeras 5 imágenes
      const images = result.result.slice(0, 5);

      // Enviar imágenes una por una
      for (const img of images) {
        if (!img.image) continue;

        await misa.sendMessage(
          from,
          {
            image: { url: img.image },
            caption: [
              "🖼️ *Google Imagen*",
              "",
              `📌 *Título:* ${img.title || "Sin título"}`,
              `🔗 ${img.url}`,
            ].join("\n"),
          },
          { quoted: message as WAMessage }
        );
      }

      // Mensaje final
      await misa.sendMessage(
        from,
        {
          text: `✅ Se enviaron ${images.length} imágenes.`,
        },
        { quoted: message as WAMessage }
      );

    } catch (error) {
      await misa.sendMessage(
        from,
        {
          text: `❌ Error: ${
            error instanceof Error
              ? error.message
              : "Error desconocido"
          }`,
        },
        { quoted: message as WAMessage }
      );
    }
  },
};

export default googleImageCommand;
