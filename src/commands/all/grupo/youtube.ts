/**
 * YouTube Search (Evogb API)
 */

import { WAMessage } from "baileys";
import { Command } from "../../../types/Command.js";

type YTResponse = {
  status: boolean;
  creator: string;
  result: {
    title: string;
    autor: string;
    duration: string;
    views: string;
    uploaded: string;
    banner: string;
    url: string;
  }[];
};

async function searchYouTube(query: string): Promise<YTResponse> {
  const url = new URL("https://api.evogb.org/search/yt");
  url.searchParams.set("query", query);
  url.searchParams.set("key", "evogb-WzR3kPpa");

  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Error API YouTube: ${res.status}`);
  }

  return (await res.json()) as YTResponse;
}

const ytSearchCommand: Command = {
  name: "ytsearch",
  aliases: ["yts", "youtube", "searchyt"],
  description: "Buscador de YouTube con API Evogb",
  category: "all",

  async execute({ misa, message, from, args }) {
    if (!args.length) {
      await misa.sendMessage(
        from,
        {
          text: "❗ Uso: ytsearch <búsqueda>",
        },
        { quoted: message as WAMessage }
      );
      return;
    }

    const query = args.join(" ").trim();

    await misa.sendMessage(
      from,
      {
        text: `🔎 Buscando en YouTube: *${query}*...`,
      },
      { quoted: message as WAMessage }
    );

    try {
      const data = await searchYouTube(query);

      if (!data.status || !data.result?.length) {
        await misa.sendMessage(
          from,
          {
            text: "❌ No se encontraron resultados.",
          },
          { quoted: message as WAMessage }
        );
        return;
      }

      const results = data.result.slice(0, 5);

      let text = `🎬 *Resultados de YouTube*\n`;
      text += `👤 API: ${data.creator}\n\n`;

      results.forEach((v, i) => {
        text += `📌 *${i + 1}. ${v.title}*\n`;
        text += `👤 Autor: ${v.autor}\n`;
        text += `⏱️ Duración: ${v.duration}\n`;
        text += `👀 Views: ${v.views}\n`;
        text += `📅 Subido: ${v.uploaded}\n`;
        text += `🔗 ${v.url}\n\n`;
      });

      // enviar texto
      await misa.sendMessage(
        from,
        { text },
        { quoted: message as WAMessage }
      );

      // enviar thumbnails (como imágenes separadas)
      for (const video of results) {
        await misa.sendMessage(from, {
          image: { url: video.banner },
          caption:
            `🎬 ${video.title}\n` +
            `👤 ${video.autor}\n` +
            `⏱️ ${video.duration}\n` +
            `👀 ${video.views}`,
        });
      }
    } catch (err) {
      await misa.sendMessage(
        from,
        {
          text: `❌ Error: ${
            err instanceof Error ? err.message : "desconocido"
          }`,
        },
        { quoted: message as WAMessage }
      );
    }
  },
};

export default ytSearchCommand;
