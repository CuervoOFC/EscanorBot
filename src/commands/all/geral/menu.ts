/**
 * @author Hiudy · github.com/hiudyy
 * @project Misa Bot
 */
import { WAMessage } from "baileys";
import { Command } from "../../../types/Command.js";
import { getBotConfig } from "../../../config.js";

const menuCommand: Command = {
  name: "menu",
  aliases: ["help", "ajuda", "comandos"],
  description: "Mostra o menu principal com imagem",
  category: "geral",
  async execute({ misa, message, from, prefix }) {
    const config = await getBotConfig();

    const menuText = [
      `‧₊˚ ✿ ── ${config.botName} ──✿ ˚₊‧`,
      "│",
      `│  👤 *Dono:* ${config.ownerName}`,
      "│",
      `│  ♡ ${prefix}menugeral`,
      `│  ♡ ${prefix}menudl`,
      `│  ♡ ${prefix}menugrupo`,
      `│  ♡ ${prefix}menuadm`,
      `│  ♡ ${prefix}menudono`,
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

export default menuCommand;
