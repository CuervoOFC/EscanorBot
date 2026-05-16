/**
 * @author Hiudy · github.com/hiudyy
 * @project Misa Bot
 */
import { WAMessage } from "baileys";
import { Command } from "../../../types/Command.js";
import { getBotConfig } from "../../../config.js";

const menugeralCommand: Command = {
  name: "menugeral",
  aliases: ["mgeral"],
  description: "Mostra o menu geral",
  category: "geral",
  async execute({ misa, message, from, prefix }) {
    const config = await getBotConfig();

    const menuText = [
          `‧₊˚ ✿ ── ${config.botName} ──✿ ˚₊‧`,
          "│",
          `│  👤 *Dono:* ${config.ownerName}`,
          `│`,
          "├ 〔 geral 〕",
          `│  ♡ ${prefix}ping`,
          `│  ♡ ${prefix}escanor`,
          `│  ♡ ${prefix}imagen`,
          `│  ♡ ${prefix}pinvid`,
          `│  ♡ ${prefix}link`,
          `│  ♡ ${prefix}remini`,
          `│  ♡ ${prefix}tourl`,
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

export default menugeralCommand;
