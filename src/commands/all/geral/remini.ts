/**
 * @author Hiudy · github.com/hiudyy
 * @project Misa Bot
 */

import axios from "axios";
import FormData from "form-data";
import { downloadContentFromMessage, WAMessage } from "baileys";
import { Command } from "../../../types/Command.ts";

const reminiCommand: Command = {
  name: "hd",
  aliases: ["remini", "upscale"],
  description: "Mejora la calidad de imágenes",
  category: "tools",
  groupOnly: true,

  async execute({ misa, message, from }) {
    try {
      // =========================
      // VERIFICAR IMAGEN
      // =========================
      const quoted =
        message.message?.extendedTextMessage?.contextInfo?.quotedMessage;

      const imageMessage =
        quoted?.imageMessage ||
        message.message?.imageMessage;

      if (!imageMessage) {
        await misa.sendMessage(
          from,
          {
            text:
              "❌ Responde a una imagen o envía una imagen con el comando.",
          },
          { quoted: message as WAMessage },
        );

        return;
      }

      await misa.sendMessage(
        from,
        {
          text: "🪄 Mejorando calidad de la imagen...",
        },
        { quoted: message as WAMessage },
      );

      // =========================
      // DESCARGAR IMAGEN
      // =========================
      const stream = await downloadContentFromMessage(
        imageMessage,
        "image",
      );

      let buffer = Buffer.from([]);

      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
      }

      // =========================
      // SUBIR IMAGEN A EVOGB
      // =========================
      const form = new FormData();

      form.append("file", buffer, {
        filename: "image.jpg",
        contentType: "image/jpeg",
      });

      const uploadResponse = await axios.post(
        "https://api.evogb.org/tools/upload?key=evogb-WzR3kPpa",
        form,
        {
          headers: form.getHeaders(),
        },
      );

      const uploadData = uploadResponse.data;

      if (!uploadData.status || !uploadData.url) {
        await misa.sendMessage(
          from,
          {
            text: "❌ Error subiendo la imagen.",
          },
          { quoted: message as WAMessage },
        );

        return;
      }

      const imageUrl = uploadData.url;

      // =========================
      // API UPSCALE
      // =========================
      const upscaleResponse = await axios.get(
        `https://api.evogb.org/tools/upscale?url=${encodeURIComponent(
          imageUrl,
        )}&key=evogb-WzR3kPpa`,
      );

      const data = upscaleResponse.data;

      if (!data.status) {
        await misa.sendMessage(
          from,
          {
            text: "❌ No se pudo mejorar la imagen.",
          },
          { quoted: message as WAMessage },
        );

        return;
      }

      // =========================
      // OBTENER IMAGEN MEJORADA
      // =========================
      const upscaleImage =
        data.data?.url ||
        data.data ||
        data.url;

      if (!upscaleImage) {
        await misa.sendMessage(
          from,
          {
            text: "❌ La API no devolvió ninguna imagen.",
          },
          { quoted: message as WAMessage },
        );

        return;
      }

      // =========================
      // ENVIAR IMAGEN
      // =========================
      await misa.sendMessage(
        from,
        {
          image: { url: upscaleImage },
          caption: "✨ Imagen mejorada con éxito",
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

export default reminiCommand;
