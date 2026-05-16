/**
 * @author Hiudy · github.com/hiudyy
 * @project Misa Bot
 */
import { WAMessage } from "baileys";
import { Command } from "../../../types/Command.js";
import { getBotConfig } from "../../../config.js";

const menuadmCommand: Command = {
  name: "menuadm",
  aliases: ["menuadmin"],
  description: "Mostra o menu admin",
  category: "geral",
  async execute({ misa, message, from, prefix }) {
    const config = await getBotConfig();

    const menuText = [
      `‧₊˚ ✿ ── ${config.botName} ──✿ ˚₊‧`,
          "│",
          "├ 〔 grupo 〕",
          `│  ♡ ${prefix}gp`,
          `│  ♡ ${prefix}kick`,
          `│  ♡ ${prefix}promote`,
          `│  ♡ ${prefix}demote`,
          `│  ♡ ${prefix}nomegp`,
          `│  ♡ ${prefix}descgp`,
          `│  ♡ ${prefix}tag`,
          `│  ♡ ${prefix}del`,
          "│",
          "├ 〔 bem-vindo 〕",
          `│  ♡ ${prefix}bemvindo`,
          `│  ♡ ${prefix}legendabv`,
          `│  ♡ ${prefix}midiabv`,
          "│",
          "‧₊˚ ────────────────˚₊‧",
    ].join("\n");

    await misa.sendMessage(
      from,
      {
        image: { url: config.botImage },
        caption: menuText,
      },
      { quoted: message as WAMessage },
    );
  },
};

export default menuadmCommand;
