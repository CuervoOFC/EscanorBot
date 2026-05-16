//**
 * @author Hiudy · github.com/hiudyy
 * @project Misa Bot
 */
import { WAMessage } from "baileys";
import { Command } from "../../../types/Command.js";
import { getBotConfig } from "../../../config.js";

const menudlCommand: Command = {
  name: "menudl",
  aliases: ["menudownloads"],
  description: "Mostra o menu principal com imagem",
  category: "geral",
  async execute({ misa, message, from, prefix }) {
    const config = await getBotConfig();

    const menuText = [
      `‧₊˚ ✿ ── ${config.botName} ──✿ ˚₊‧`,
          "│",
          "├ 〔 downloads 〕",
          `│  ♡ ${prefix}play`,
          `│  ♡ ${prefix}play2`,
          `│  ♡ ${prefix}ytmp3`,
          `│  ♡ ${prefix}ytmp4`,
          `│  ♡ ${prefix}tiktok`,
          `│  ♡ ${prefix}instagram`,
          `│  ♡ ${prefix}pinterest`,
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

export default menudlCommand;
