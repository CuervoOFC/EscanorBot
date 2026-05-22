import { WAMessage } from "baileys";
import { Command } from "../../../types/Command.js";

type Mp4Response = {
  status: boolean;
  creator: string;
  data: {
    title: string;
    thumbnail: string;
    duration: string;
    views: string;
    quality: string;
    quality_context: string;
    size: string;
    dl: string;
    url: string;
    type: string;
    format: string;
    videoId: string;
    author?: {
      name?: string;
    };
  };
};

async function downloadMp4(urlInput: string): Promise<Mp4Response> {
  const url = new URL("https://api.evogb.org/dl/ytmp4");

  url.searchParams.set("url", urlInput);
  url.searchParams.set("quality", "auto");
  url.searchParams.set("key", "evogb-WzR3kPpa");

  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Error API MP4: ${res.status}`);
  }

  return (await res.json()) as Mp4Response;
}

const mp4Command: Command = {
  name: "mp4",
  aliases: ["video2"],
  description: "Descarga videos de YouTube",
  category: "downloads",

  async execute({ misa, message, from, args }) {
    if (!args.length) {
      await misa.sendMessage(
        from,
        {
          text: "❗ Uso: mp4 <link youtube>",
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
        text: "⏳ Descargando video...",
      },
      { quoted: message as WAMessage }
    );

    try {
      const data = await downloadMp4(query);

      if (!data.status || !data.data) {
        await misa.sendMessage(
          from,
          {
            text: "❌ No se pudo descargar el video",
          },
          { quoted: message as WAMessage }
        );
        return;
      }

      const res = data.data;

      const caption = `
╭━━━〔 MP4 DOWNLOADER 〕━━━⬣
┃ 🎬 Título: ${res.title}
┃ 🎥 Calidad: ${res.quality}
┃ 📦 Formato: ${res.format}
┃ 🆔 Video ID: ${res.videoId}
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

      // Video MP4
      await misa.sendMessage(
        from,
        {
          video: { url: res.dl },
          mimetype: "video/mp4",
          fileName: res.title,
          caption: `🎬 ${res.title}`,
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

export default mp4Command;
