/**
 * @author Hiudy · github.com/hiudyy
 * @project Misa Bot
 */
import { WAMessage } from "baileys";
import { Command } from "../../../types/Command.js";
import { misakaAPI } from "../../../helpers/misakaAPI.js";

// Estructura de respuesta para la API
type YoutubeAudioResponse = {
  title?: string;
  url: string; // Enlace directo al archivo MP3
  thumbnail?: string;
};

const ytmp3Command: Command = {
  name: "ytmp3",
  aliases: ["playaudio", "audio"],
  description: "Baixa áudio (MP3) do YouTube",
  category: "all",
  async execute({ misa, message, from, args }) {
    if (args.length === 0) {
      await misa.sendMessage(from, {
        text: [
          "╭─「 *YOUTUBE MP3* 」",
          "│",
          "│ ✦ Download:",
          "│   ytmp3 <url>",
          "│",
          "╰─ Exemplo:",
          "   ytmp3 https://youtu.be/YVkUvmDQ3HY",
        ].join("\n"),
      });
      return;
    }

    const url = args[0];

    if (!url.includes("youtube.com") && !url.includes("youtu.be")) {
      await misa.sendMessage(from, { text: "❌ URL inválida." }, { quoted: message as WAMessage });
      return;
    }

    await misa.sendMessage(from, { text: "🎧 Convertendo para MP3..." }, { quoted: message as WAMessage });

    try {
      // Usamos el parámetro format: "mp3"
      const data = await misakaAPI<YoutubeAudioResponse>("/youtube/download", { 
        url: url,
        format: "mp3" 
      });

      if (!data || !data.url) {
        await misa.sendMessage(from, { text: "❌ Não foi possível obter o áudio." }, { quoted: message as WAMessage });
        return;
      }

      // Enviamos como audio
      await misa.sendMessage(
        from,
        {
          audio: { url: data.url },
          mimetype: "audio/mp4", // O "audio/mpeg" según prefieras
          ptt: false, // Cambia a true si quieres que se envíe como nota de voz
        },
        { quoted: message as WAMessage },
      );

      // Opcional: Enviar mensaje de confirmación con el título
      await misa.sendMessage(from, { text: `✅ Áudio enviado: *${data.title || "YouTube Audio"}*` });

    } catch (error) {
      await misa.sendMessage(
        from,
        {
          text: `❌ Erro: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
        },
        { quoted: message as WAMessage },
      );
    }
  },
};

export default ytmp3Command;
