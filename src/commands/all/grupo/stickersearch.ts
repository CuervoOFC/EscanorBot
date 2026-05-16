/**
 * Stickerly Search Command
 * @author Hiudy + adaptado
 */

import { WAMessage } from "baileys";
import { Command } from "../../../types/Command.js";

type StickerlyResponse = {
  status: boolean;
  creator: string;
  resultados: {
    name: string;
    author: string;
    stickerCount: number;
    viewCount: number;
    exportCount: number;
    isPaid: boolean;
    isAnimated: boolean;
    thumbnailUrl: string;
    url: string;
  }[];
};

function formatBool(v: boolean) {
  return v ? "Sí" : "No";
}

async function searchStickerly(query: string): Promise<StickerlyResponse> {
  const url = new URL("https://api.evogb.org/stickerly/search");
  url.searchParams.set("query", query);
  url.searchParams.set("key", "evogb-WzR3kPpa");

  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Error API Stickerly: ${res.status}`);
  }

  return (await res.json()) as StickerlyResponse;
}

const stickerSearchCommand: Command = {
  name: "stickersearch",
  aliases: ["stsearch"],
  description: "Busca packs de stickers en Stickerly",
  category: "all",

  async execute({ misa, message, from, args }) {
    if (!args.length) {
      await misa.sendMessage(
        from,
        {
          text: "❗ Uso: stickersearch <nombre>",
        },
        { quoted: message as WAMessage }
      );
      return;
    }

    const query = args.join(" ").trim();

    await misa.sendMessage(
      from,
      {
        text: `🔎 Buscando stickers: *${query}*...`,
      },
      { quoted: message as WAMessage }
    );

    try {
      const data = await searchStickerly(query);

      if (!data.status || !data.resultados?.length) {
        await misa.sendMessage(
          from,
          {
            text: "❌ No se encontraron resultados.",
          },
          { quoted: message as WAMessage }
        );
        return;
      }

      const results = data.resultados.slice(0, 5);

      let text = `🎯 *Resultados Stickerly*\n`;
      text += `👤 Creator API: ${data.creator}\n\n`;

      results.forEach((item, i) => {
        text += `📦 *${i + 1}. ${item.name}*\n`;
        text += `👤 Autor: ${item.author}\n`;
        text += `🎭 Stickers: ${item.stickerCount}\n`;
        text += `👁️ Views: ${item.viewCount}\n`;
        text += `📤 Export: ${item.exportCount}\n`;
        text += `💰 Paid: ${formatBool(item.isPaid)}\n`;
        text += `🎬 Animado: ${formatBool(item.isAnimated)}\n`;
        text += `🔗 ${item.url}\n\n`;
      });

      // enviamos primero el texto
      await misa.sendMessage(
        from,
        { text },
        { quoted: message as WAMessage }
      );

      // luego enviamos thumbnails (opcional pero más pro)
      for (const item of results) {
        await misa.sendMessage(from, {
          image: { url: item.thumbnailUrl },
          caption: `📦 ${item.name}\n👤 ${item.author}`,
        });
      }
    } catch (err) {
      await misa.sendMessage(
        from,
        {
          text: `❌ Error en API: ${
            err instanceof Error ? err.message : "desconocido"
          }`,
        },
        { quoted: message as WAMessage }
      );
    }
  },
};

export default stickerSearchCommand;
