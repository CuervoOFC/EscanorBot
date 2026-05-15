/**
 * @author Hiudy · github.com/hiudyy
 * @project Misa Bot
 */

import { WAMessage } from "baileys";
import { Command } from "../../../types/Command.js";
import axios from "axios";

const spotifyCommand: Command = {
  name: "spotify",
  aliases: ["sp", "spoti"],
  description: "Descarga canciones de Spotify",
  category: "descargas",

  async execute({ misa, message, from, args }) {
    const text = args.join(" ");

    if (!text) {
      await misa.sendMessage(
        from,
        {
          text:
            "❌ Debes escribir el nombre de una canción o una URL de Spotify.",
        },
        { quoted: message as WAMessage },
      );
      return;
    }

    try {
      // =========================
      // SI ES URL DE SPOTIFY
      // =========================
      if (
        text.includes("open.spotify.com/track/")
      ) {
        const api = `https://api.delirius.store/download/spotifydl?url=${encodeURIComponent(text)}`;

        const { data } = await axios.get(api);

        if (!data.status) {
          await misa.sendMessage(
            from,
            { text: "❌ No se pudo descargar la canción." },
            { quoted: message as WAMessage },
          );
          return;
        }

        const song = data.data;

        await misa.sendMessage(
          from,
          {
            image: { url: song.image },
            caption:
              `🎵 *Spotify Downloader*\n\n` +
              `> *Título:* ${song.title}\n` +
              `> *Autor:* ${song.author}`,
          },
          { quoted: message as WAMessage },
        );

        await misa.sendMessage(
          from,
          {
            audio: { url: song.download },
            mimetype: "audio/mpeg",
            fileName: `${song.title}.mp3`,
          },
          { quoted: message as WAMessage },
        );

        return;
      }

      // =========================
      // BUSCAR CANCIONES
      // =========================
      const searchApi =
        `https://api.delirius.store/search/spotifysearchweb?q=${encodeURIComponent(text)}&limit=3`;

      const { data } = await axios.get(searchApi);

      if (!data.status || !data.data.length) {
        await misa.sendMessage(
          from,
          { text: "❌ No encontré resultados." },
          { quoted: message as WAMessage },
        );
        return;
      }

      const results = data.data.slice(0, 3);

      let listText = "🎵 *Resultados encontrados:*\n\n";

      results.forEach((song: any, index: number) => {
        listText +=
          `*${index + 1}.* ${song.title}\n` +
          `> 👤 ${song.artist}\n` +
          `> ✨️ ${song.url}` +
          `> 💿 ${song.album}\n\n`;
      });

      listText += "✍️ Responde con *1*, *2* o *3* para descargar.";

      // Enviar lista
      await misa.sendMessage(
        from,
        { text: listText },
        { quoted: message as WAMessage },
      );

      // =========================
      // ESPERAR RESPUESTA
      // =========================
      const response = await misa.waitForMessage({
        chatJid: from,
        sender: message.key.participant || from,
        timeout: 30000,
      });

      const choice = response?.message?.conversation?.trim();

      if (!["1", "2", "3"].includes(choice || "")) {
        await misa.sendMessage(
          from,
          { text: "❌ Opción inválida." },
          { quoted: message as WAMessage },
        );
        return;
      }

      const selected = results[Number(choice) - 1];

      // =========================
      // DESCARGAR SELECCIÓN
      // =========================
      const downloadApi =
        `https://api.delirius.store/download/spotifydl?url=${encodeURIComponent(selected.url)}`;

      const downloadRes = await axios.get(downloadApi);

      if (!downloadRes.data.status) {
        await misa.sendMessage(
          from,
          { text: "❌ Error al descargar." },
          { quoted: message as WAMessage },
        );
        return;
      }

      const song = downloadRes.data.data;

      await misa.sendMessage(
        from,
        {
          image: { url: song.image },
          caption:
            `🎵 *Spotify Downloader*\n\n` +
            `> *Título:* ${song.title}\n` +
            `> *Autor:* ${song.author}`,
        },
        { quoted: message as WAMessage },
      );

      await misa.sendMessage(
        from,
        {
          audio: { url: song.download },
          mimetype: "audio/mpeg",
          fileName: `${song.title}.mp3`,
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

export default spotifyCommand;
