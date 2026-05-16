/**
 * @author Hiudy · github.com/hiudyy
 * @project Misa Bot
 */

import { WAMessage } from "baileys";
import { Command } from "../../../types/Command.js";

// Respuesta de la API Delirius
type DeliriusResponse = {
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

const ytmp3Command: Command = {
  name: "ytmp3",
  aliases: ["audio"],
  description: "Descarga audio MP3 de YouTube",
  category: "all",

  async execute({ misa, message, from, args }) {
    if (args.length === 0) {
      await misa.sendMessage(from, {
        text: [
          "╭─「 *YOUTUBE MP3* 」",
          "│",
          "│ ✦ Descargar:",
          "│   ytmp3 <url>",
          "│",
          "╰─ Ejemplo:",
          "   ytmp3 https://youtu.be/YVkUvmDQ3HY",
        ].join("\n"),
      });
      return;
    }

    const url = args[0];

    // Validar URL
    if (!url.includes("youtube.com") && !url.includes("youtu.be")) {
      await misa.sendMessage(
        from,
        { text: "❌ URL inválida." },
        { quoted: message as WAMessage }
      );
      return;
    }

    await misa.sendMessage(
      from,
      { text: "🎧 Convirtiendo a MP3..." },
      { quoted: message as WAMessage }
    );

    try {
      // API Delirius
      const response = await fetch(
        `https://api.delirius.store/download/ytmp3?url=${encodeURIComponent(url)}`
      );

      const result: DeliriusResponse = await response.json();

      if (!result.status || !result.data?.download) {
        await misa.sendMessage(
          from,
          { text: "❌ No se pudo obtener el audio." },
          { quoted: message as WAMessage }
        );
        return;
      }

      // Enviar audio
      await misa.sendMessage(
        from,
        {
          audio: { url: result.data.download },
          mimetype: "audio/mpeg",
          ptt: false,
        },
        { quoted: message as WAMessage }
      );

      // Confirmación
      await misa.sendMessage(from, {
        text: [
          "✅ *Audio enviado correctamente*",
          "",
          `🎵 *Título:* ${result.data.title}`,
          `👤 *Autor:* ${result.data.author}`,
          `👀 *Vistas:* ${result.data.views}`,
        ].join("\n"),
      });

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

export default ytmp3Command;
