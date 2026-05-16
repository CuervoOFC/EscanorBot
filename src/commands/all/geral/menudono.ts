/**
 * @author Hiudy · github.com/hiudyy
 * @project Misa Bot
 */
import { WAMessage } from "baileys";
import { Command } from "../../../types/Command.js";
import { getBotConfig } from "../../../config.js";

const menudonoCommand: Command = {
  name: "menudono",
  aliases: ["menuowner"],
  description: "Mostra o menu principal com imagem",
  category: "geral",
  ownerOnly: true,
  async execute({ misa, message, from, prefix }) {
    const config = await getBotConfig();

    const menuText = [
      `‧₊˚ ✿ ── ${config.botName} ──✿ ˚₊‧`,
          "│",
          "├ 〔 dono 〕",
          `│  ♡ ${prefix}eval`,
          `│  ♡ ${prefix}setbot [config]`,
          `│  ♡ ${prefix}update`,
          `│  ♡ ${prefix}restart`,
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

export default menudonoCommand;
