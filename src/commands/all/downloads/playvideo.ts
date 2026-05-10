/**
 * @author Hiudy · github.com/hiudyy
 * @project Misa Bot
 */

import { WAMessage } from "baileys";
import { Command } from "../../../types/Command.js";

// Respuesta de la API Delirius
type DeliriusVideoResponse = {
  creator: string;
  status: boolean;
  data: {
    title: string;
    author: string;
    channel: string;
    views: string;
    likes: string;
    image: string;
    format: string;
    download: string;
  };
};

const ytmp4Command: Command = {
  name: "youtube2",
  aliases: ["yt2", "ytdl2"],
  description: "Descarga videos de YouTube",
  category: "all",

  async execute({ misa, message, from, args }) {
    if (args.length === 0) {
      await misa.sendMessage(from, {
        text: [
          "╭─「 *YOUTUBE VIDEO* 」",
          "│",
          "│ ✦ Descargar:",
          "│   youtube2 <url>",
          "│",
          "╰─ Ejemplo:",
          "   youtube2 https://youtu.be/YVkUvmDQ3HY",
        ].join("\n"),
      });
      return;
    }

    const url = args[0];

    // Validar URL
    if (!url.includes("youtube.com") && !url.includes("youtu.be")) {
      await misa.sendMessage(
        from,
        { text: "❌ URL inválida. Usa un link de YouTube." },
        { quoted: message as WAMessage }
      );
      return;
    }

    await misa.sendMessage(
      from,
      { text: "⏳ Descargando video..." },
      { quoted: message as WAMessage }
    );

    try {
      // Calidad del video
      const quality = "360p";

      // API Delirius
      const response = await fetch(
        `https://api.delirius.store/download/ytmp4?url=${encodeURIComponent(
          url
        )}&format=${quality}`
      );

      const result: DeliriusVideoResponse = await response.json();

      if (!result.status || !result.data?.download) {
        await misa.sendMessage(
          from,
          { text: "❌ No se pudo obtener el video." },
          { quoted: message as WAMessage }
        );
        return;
      }

      // Enviar video
      await misa.sendMessage(
        from,
        {
          video: { url: result.data.download },
          caption: [
            "✅ *Video enviado correctamente*",
            "",
            `🎬 *Título:* ${result.data.title}`,
            `👤 *Autor:* ${result.data.author}`,
            `📺 *Calidad:* ${result.data.format}`,
            `👀 *Vistas:* ${result.data.views}`,
          ].join("\n"),
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

export default ytmp4Command;
