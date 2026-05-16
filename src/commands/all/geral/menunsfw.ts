/**
 * @author Hiudy · github.com/hiudyy
 * @project Misa Bot
 */
import { WAMessage } from "baileys";
import { Command } from "../../../types/Command.js";
import { getBotConfig } from "../../../config.js";

const menunsfwCommand: Command = {
  name: "menunsfw",
  aliases: ["menuhot"],
  description: "Mostra o menu nsfw",
  category: "geral",
  async execute({ misa, message, from, prefix }) {
    const config = await getBotConfig();

    const menuText = [
      `‧₊˚ ✿ ── ${config.botName} ──✿ ˚₊‧`,
      "│",
      `│  👤 *Dono:* ${config.ownerName}`,
      "│",
      `│  ♡ ${prefix}porn <text>`,
      `│  ♡ ${prefix}pornvid`,
      `│  ♡ ${prefix}loli`,
      `│  ♡ ${prefix}yuri`,
      `│  ♡ ${prefix}hentai`,
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

export default menunsfwCommand;
