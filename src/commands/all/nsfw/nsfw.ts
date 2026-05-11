/**
 * @author Hiudy · github.com/hiudyy
 * @project Misa Bot
 */

import { WAMessage } from "baileys";
import { Command } from "../../../types/Command.js";
import { getGroup, saveGroup } from "../../../database/groupDB.js";

const nsfwCommand: Command = {
  name: "nsfw",
  aliases: ["+18"],
  description: "Ativa ou desativa os comandos NSFW",
  category: "nsfw",
  groupOnly: true,
  adminOnly: true,

  async execute({ misa, message, from }) {
    const config = await getGroup(from);

    const novoEstado = !config.nsfw.ativo;

    await saveGroup(from, {
      nsfw: {
        ...config.nsfw,
        ativo: novoEstado,
      },
    });

    await misa.sendMessage(
      from,
      {
        text: novoEstado
          ? "🔞 NSFW *ativado* neste grupo!"
          : "❌ NSFW *desativado* neste grupo.",
      },
      { quoted: message as WAMessage },
    );
  },
};

export default nsfwCommand;
