/**
 * @author Hiudy · github.com/hiudyy
 * @project Misa Bot
 */

import axios from "axios";
import { WAMessage } from "baileys";
import { Command } from "../../../types/Command.js";

type YouTubeSearchResponse = {
  video_id: string;
  url: string;
  title: string;
  thumbnail: string;
  duration: number;
  views: number;
  author: string;
};

function formatDuration(seconds: number): string {
  const safeSeconds = Math.max(0, seconds);
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const remainingSeconds = safeSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
  }

  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

function formatViews(views: number): string {
  return new Intl.NumberFormat("es-MX").format(views);
}

function sanitizeFileName(input: string): string {
  return (
    input
      .replace(/[<>:"/\\|?*\u0000-\u001f]/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 120) || "audio"
  );
}

async function searchYouTube(query: string): Promise<YouTubeSearchResponse | null> {
  try {
    const { data } = await axios.get(
      `https://api.evogb.org/search/ytsearch?query=${encodeURIComponent(query)}&key=evogb-WzR3kPpa`,
    );

    if (!data?.status) return null;

    const result = data.result?.[0];

    if (!result) return null;

    return {
      video_id: result.videoId || "",
      url: result.url,
      title: result.title,
      thumbnail: result.thumbnail,
      duration: Number(result.durationSeconds || 0),
      views: Number(result.views || 0),
      author: result.author?.name || "Desconocido",
    };
  } catch {
    return null;
  }
}

async function downloadYouTubeAudio(url: string): Promise<{
  buffer: Buffer;
}> {
  const { data } = await axios.get(
    `https://api.evogb.org/download/ytmp3?url=${encodeURIComponent(url)}&key=evogb-WzR3kPpa`,
  );

  if (!data?.status) {
    throw new Error("No se pudo descargar el audio.");
  }

  const audioUrl =
    data.result?.download ||
    data.result?.url ||
    data.result?.audio;

  if (!audioUrl) {
    throw new Error("La API no devolvió el audio.");
  }

  const audioBuffer = await axios.get(audioUrl, {
    responseType: "arraybuffer",
  });

  return {
    buffer: Buffer.from(audioBuffer.data),
  };
}

const playCommand: Command = {
  name: "play",
  aliases: ["playaudio"],
  description: "Busca música en YouTube y envía el audio",
  category: "all",

  async execute({ misa, message, from, args }) {
    try {
      if (!args.length) {
        await misa.sendMessage(
          from,
          {
            text: "❌ Usa el comando así:\n\n.play nombre de la canción",
          },
          { quoted: message as WAMessage },
        );
        return;
      }

      const query = args.join(" ").trim();

      await misa.sendMessage(
        from,
        {
          text: "🔎 Buscando canción...",
        },
        { quoted: message as WAMessage },
      );

      const result = await searchYouTube(query);

      if (!result) {
        await misa.sendMessage(
          from,
          {
            text: "❌ No encontré resultados.",
          },
          { quoted: message as WAMessage },
        );
        return;
      }

      await misa.sendMessage(
        from,
        {
          image: { url: result.thumbnail },
          caption: [
            `🎵 *${result.title}*`,
            "",
            `👤 Canal: ${result.author}`,
            `⏱️ Duración: ${formatDuration(result.duration)}`,
            `👀 Visitas: ${formatViews(result.views)}`,
            "",
            "⬇️ Descargando audio...",
          ].join("\n"),
        },
        { quoted: message as WAMessage },
      );

      const audio = await downloadYouTubeAudio(result.url);

      await misa.sendMessage(
        from,
        {
          audio: audio.buffer,
          mimetype: "audio/mpeg",
          fileName: `${sanitizeFileName(result.title)}.mp3`,
        },
        { quoted: message as WAMessage },
      );
    } catch (error) {
      console.error(error);

      await misa.sendMessage(
        from,
        {
          text: `❌ Ocurrió un error.\n\n${String(error)}`,
        },
        { quoted: message as WAMessage },
      );
    }
  },
};

export default playCommand;
