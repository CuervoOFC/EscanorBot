/**
 * @author Hiudy · github.com/hiudyy
 * @project Misa Bot
 */

import { WAMessage } from "baileys";
import { Command } from "../../../types/Command.ts";

// Tipado de la API
type PinterestVideo = {
  title: string;
  link: string | null;
  duration: string;
  likes: number;
  dl: string;
  thumb: string;
};

type PinterestResponse = {
  status: boolean;
  creator: string;
  data: {
    count: number;
    videos: PinterestVideo[];
  };
};

const pinterestvidCommand: Command = {
  name: "pinterestvideo",
  aliases: ["pinvideo", "pinvid", "pinterestv"],
  description: "Busca videos en Pinterest",
  category: "search",

  async execute({ misa, message, from, args }) {
    if (args.length === 0) {
      await misa.sendMessage(from, {
        text: [
          "╭─「 *PINTEREST VIDEO* 」",
          "│",
          "│ ✦ Buscar videos:",
          "│   pinterestvideo <texto>",
          "│",
          "╰─ Ejemplo:",
          "   pinterestvideo BMW",
        ].join("\n"),
      });
      return;
    }

    const query = args.join(" ");

    await misa.sendMessage(
      from,
      {
        text: `🔎 Buscando videos de Pinterest sobre: *${query}*`,
      },
      { quoted: message as WAMessage }
    );

    try {
      // API
      const response = await fetch(
        `https://api.evogb.org/search/pinterestvideo?query=${encodeURIComponent(
          query
        )}&key=evogb-WzR3kPpa`
      );

      const result: PinterestResponse = await response.json();

      if (
        !result.status ||
        !result.data ||
        !result.data.videos ||
        result.data.videos.length === 0
      ) {
        await misa.sendMessage(
          from,
          {
            text: "❌ No se encontraron videos.",
          },
          { quoted: message as WAMessage }
        );
        return;
      }

      // Primeros 5 videos
      const videos = result.data.videos.slice(0, 5);

      // Enviar uno por uno
      for (const video of videos) {
        if (!video.dl) continue;

        await misa.sendMessage(
          from,
          {
            video: { url: video.dl },
            caption: [
              "📌 *Pinterest Video*",
              "",
              `🎬 *Título:* ${video.title || "Sin título"}`,
              `⏱️ *Duración:* ${video.duration}`,
              `❤️ *Likes:* ${video.likes}`,
            ].join("\n"),
          },
          { quoted: message as WAMessage }
        );
      }

      // Mensaje final
      await misa.sendMessage(
        from,
        {
          text: `✅ Se enviaron ${videos.length} videos de Pinterest.`,
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

export default pinterestvidCommand;
