/**
 * @author Hiudy · github.com/hiudyy
 * @project Misa Bot
 */

import axios from "axios";
import { WAMessage } from "baileys";
import { Command } from "../../../types/Command.ts";
import { getGroup } from "../../../database/groupDB.ts";

const yuriCommand: Command = {
  name: "girls",
  aliases: ["nsfwgirls"],
  description: "Envia imagens NSFW",
  category: "nsfw",
  groupOnly: true,

  async execute({ misa, message, from }) {
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
      // API
      // =========================
      const { data } = await axios.get(
        "https://api.evogb.org/nsfw/random/yuri",
      );

      if (!data.status) {
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
      // PEGAR IMAGEM
      // =========================
      const image =
        data.data?.url ||
        data.data ||
        data.url;

      if (!image) {
        await misa.sendMessage(
          from,
          {
            text:
              "❌ A API não retornou nenhuma imagem.",
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
          image: { url: image },
          caption: "🔞 NSFW",
        },
        { quoted: message as WAMessage },
      );
    } catch (error) {
      console.error(error);

      await misa.sendMessage(
        from,
        {
          text: `❌ Ocorreu um erro.\n\n${String(error)}`,
        },
        { quoted: message as WAMessage },
      );
    }
  },
};

export default yuriCommand;
