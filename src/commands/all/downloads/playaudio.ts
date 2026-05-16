/**
 * @author Hiudy · github.com/hiudyy
 * @project Misa Bot
 */

import { WAMessage } from "baileys";
import { getBotConfig } from "../../../config.js";
import { misakaAPI } from "../../../helpers/misakaAPI.js";
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
  const s = Math.max(0, seconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;

  return h > 0
    ? `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`
    : `${m}:${String(sec).padStart(2, "0")}`;
}

function formatViews(views: number): string {
  return new Intl.NumberFormat("es-MX").format(views);
}

function sanitizeFileName(input: string): string {
  return input
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120) || "audio";
}

async function downloadYouTubeAudio(url: string) {
  const config = await getBotConfig();

  if (!config.apiKey) {
    throw new Error("API key no configurada");
  }

  const requestUrl = new URL(
    "https://misaka.com.br/api/v1/youtube/download",
  );

  requestUrl.searchParams.set("url", url);
  requestUrl.searchParams.set("format", "mp3");

  const res = await fetch(requestUrl, {
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Error API: ${res.status}`);
  }

  const buffer = Buffer.from(await res.arrayBuffer());

  const title = res.headers.get("X-Title") || "Audio";
  const author = res.headers.get("X-Author") || "Desconocido";
  const duration = Number(res.headers.get("X-Duration") || "0");

  return { buffer, title, author, duration };
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
            text: "❌ Usa: .play nombre de la canción",
          },
          { quoted: message as WAMessage },
        );
        return;
      }

      const query = args.join(" ");

      await misa.sendMessage(
        from,
        { text: "🔎 Buscando..." },
        { quoted: message as WAMessage },
      );

      const result = await misakaAPI<YouTubeSearchResponse>(
        "/youtube/search",
        { q: query },
      );

      if (!result) {
        await misa.sendMessage(
          from,
          { text: "❌ No se encontraron resultados." },
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
            `👤 ${result.author}`,
            `⏱️ ${formatDuration(result.duration)}`,
            `👀 ${formatViews(result.views)}`,
            "",
            "⬇️ Descargando...",
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

export default playCommand;
