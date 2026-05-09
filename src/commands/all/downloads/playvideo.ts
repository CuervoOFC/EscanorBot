/**
 * @author Hiudy · github.com/hiudyy
 * @project Misa Bot
 */
import { WAMessage } from "baileys";
import { Command } from "../../../types/Command.js";
import { misakaAPI } from "../../../helpers/misakaAPI.js";

// Estructura de respuesta para la API de YouTube de Misaka
type YoutubeResponse = {
  title?: string;
  url: string; // Enlace directo al video generado
  thumbnail?: string;
};

const ytmp4Command: Command = {
  name: "youtube2", // Nombre del comando
  aliases: ["yt2", "ytdl2"],
  description: "Baixa vídeos do YouTube usando a API Misaka v1",
  category: "all",
  async execute({ misa, message, from, args }) {
    if (args.length === 0) {
      await misa.sendMessage(from, {
        text: [
          "╭─「 *YOUTUBE 2* 」",
          "│",
          "│ ✦ Download:",
          "│   youtube2 <url>",
          "│",
          "╰─ Exemplo:",
          "   youtube2 https://youtu.be/YVkUvmDQ3HY",
        ].join("\n"),
      });
      return;
    }

    const url = args[0];

    // Validación de link de YouTube
    if (!url.includes("youtube.com") && !url.includes("youtu.be")) {
      await misa.sendMessage(from, { text: "❌ URL inválida. Use uma URL do YouTube." }, { quoted: message as WAMessage });
      return;
    }

    await misa.sendMessage(from, { text: "⏳ Buscando vídeo no YouTube (V2)..." }, { quoted: message as WAMessage });

    try {
      // Llamada a la API usando el helper existente
      // Se pasan url y format como parámetros
      const data = await misakaAPI<YoutubeResponse>("/youtube/download", { 
        url: url,
        format: "mp4" 
      });

      if (!data || !data.url) {
        await misa.sendMessage(from, { text: "❌ Não foi possível encontrar o vídeo ou o formato é inválido." }, { quoted: message as WAMessage });
        return;
      }

      // Enviamos el video directamente
      await misa.sendMessage(
        from,
        {
          video: { url: data.url },
          caption: `🎥 *${data.title || "YouTube Video"}*\n\n✅ Download concluído via Misaka API!`,
        },
        { quoted: message as WAMessage },
      );

    } catch (error) {
      await misa.sendMessage(
        from,
        {
          text: `❌ Erro na API YouTube2: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
        },
        { quoted: message as WAMessage },
      );
    }
  },
};

export default ytmp4Command;
