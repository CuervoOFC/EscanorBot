/**
 * @author Hiudy · github.com/hiudyy
 * @project Misa Bot
 */

import axios from "axios";
import { WAMessage } from "baileys";
import { Command } from "../../../types/Command.js";
import { getGroup } from "../../../database/groupDB.js";

const pornCommand: Command = {
  name: "porn",
  aliases: ["nsfw"],
  description: "Envia imagens NSFW",
  category: "nsfw",
  groupOnly: true,

  async execute({ misa, message, from, args }) {
    try {
      // =========================
      // VERIFICAR NSFW
      // =========================
      const group = await getGroup(from);

      if (!group.nsfw.ativo) {
        await misa.sendMessage(
          from,
          {
            text:
              "❌ O sistema NSFW está desativado neste grupo.",
          },
          { quoted: message as WAMessage },
        );

        return;
      }

      // =========================
      // TIPOS DISPONÍVEIS
      // =========================
      const types = [
        "random",
        "general",
        "cumshot",
        "hentai",
        "boobs",
      ];

      const type =
        args[0]?.toLowerCase() || "random";

      if (!types.includes(type)) {
        await misa.sendMessage(
          from,
          {
            text:
              `❌ Tipo inválido.\n\n` +
              `📌 Tipos disponíveis:\n` +
              types.map((v) => `> ${v}`).join("\n"),
          },
          { quoted: message as WAMessage },
        );

        return;
      }

      // =========================
      // API
      // =========================
      const api =
        `https://api.evogb.org/porn/image/straight?type=${type}&key=evogb-WzR3kPpa`;

      const { data } = await axios.get(api);

      if (!data.status || !data.result) {
        await misa.sendMessage(
          from,
          {
            text:
              "❌ Não foi possível obter a imagem.",
          },
          { quoted: message as WAMessage },
        );

        return;
      }

      // =========================
      // ENVIAR IMAGEM
      // =========================
      await misa.sendMessage(
        from,
        {
          image: { url: data.result },
          caption:
            `🔞 *NSFW - ${type.toUpperCase()}*\n\n` +
            `> ${data.description || "Sem descrição."}`,
        },
        { quoted: message as WAMessage },
      );
    } catch (error) {
      console.error(error);

      await misa.sendMessage(
        from,
        {
          text:
            `❌ Ocorreu um erro.\n\n` +
            `${String(error)}`,
        },
        { quoted: message as WAMessage },
      );
    }
  },
};

export default pornCommand;
