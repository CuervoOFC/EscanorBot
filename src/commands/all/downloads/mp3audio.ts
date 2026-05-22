import { WAMessage } from "baileys";
import { Command } from "../../../types/Command.js";

type Mp3Response = {
  status: boolean;
  creator: string;
  data: {
    title: string;
    thumbnail: string;
    duration: string;
    views: string;
    quality: string;
    size: string;
    dl: string;
    format: string;
    type: string;
    author: {
      name: string;
    };
  };
};

async function downloadMp3(urlInput: string): Promise<Mp3Response> {
  const url = new URL("https://api.evogb.org/dl/ytmp3");

  url.searchParams.set("url", urlInput);
  url.searchParams.set("key", "evogb-WzR3kPpa");

  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Error API MP3: ${res.status}`);
  }

  return (await res.json()) as Mp3Response;
}

const mp3Command: Command = {
  name: "mp3",
  aliases: ["music"],
  description: "Descarga audio de YouTube",
  category: "downloads",

  async execute({ misa, message, from, args }) {
    if (!args.length) {
      await misa.sendMessage(
        from,
        {
          text: "❗ Uso: mp3 <link youtube>",
        },
        { quoted: message as WAMessage }
      );
      return;
    }

    const query = args[0];

    if (
      !query.includes("youtube.com") &&
      !query.includes("youtu.be")
    ) {
      await misa.sendMessage(
        from,
        {
          text: "❌ Debes ingresar un link válido de YouTube",
        },
        { quoted: message as WAMessage }
      );
      return;
    }

    await misa.sendMessage(
      from,
      {
        text: "⏳ Descargando MP3...",
      },
      { quoted: message as WAMessage }
    );

    try {
      const data = await downloadMp3(query);

      if (!data.status || !data.data) {
        await misa.sendMessage(
          from,
          {
            text: "❌ No se pudo descargar el audio",
          },
          { quoted: message as WAMessage }
        );
        return;
      }

      const res = data.data;

      const caption = `
╭━━━〔 MP3 DOWNLOADER 〕━━━⬣
┃ 🎵 Título: ${res.title}
┃ 👤 Autor: ${res.author?.name || "Desconocido"}
┃ ⏱️ Duración: ${res.duration}
┃ 👀 Views: ${res.views}
┃ 🎧 Calidad: ${res.quality}
┃ 📦 Tamaño: ${res.size}
╰━━━━━━━━━━━━━━━━━━⬣
`;

      // Imagen + info
      await misa.sendMessage(
        from,
        {
          image: { url: res.thumbnail },
          caption,
        },
        { quoted: message as WAMessage }
      );

      // Audio MP3
      await misa.sendMessage(
        from,
        {
          audio: { url: res.dl },
          mimetype: "audio/mpeg",
          fileName: `${res.title}.mp3`,
          ptt: false,
        },
        { quoted: message as WAMessage }
      );
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

export default mp3Command;
