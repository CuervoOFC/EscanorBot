import { Command } from "../../../types/Command.ts";
import { createSubBot } from "../../../types/subBotManager.ts";
import { WAMessage } from "baileys";
import fs from "fs";

const addsubCommand: Command = {
  name: "addsubbot",
  category: "dono",

  async execute({ misa, from, args, message }) {
    const phone = args[0];

    if (!phone) {
      return misa.sendMessage(from, {
        text: "Uso: !addsubbot 5214421234567",
      }, { quoted: message as WAMessage });
    }

    await misa.sendMessage(from, {
      text: "⏳ Creando subbot...",
    });

    const res = await createSubBot(phone, async (filePath: string, botId: string) => {
      await misa.sendMessage(from, {
        image: fs.readFileSync(filePath),
        caption: `📲 QR del SubBot\n🆔 ${botId}`,
      }, { quoted: message as WAMessage });
    });

    let text = `🤖 SUBBOT CREADO\n\n`;
    text += `🆔 ID: ${res.botId}\n`;

    if (res.code) {
      text += `🔑 CÓDIGO:\n${res.code}\n\n`;
    } else {
      text += `📲 QR enviado en imagen\n\n`;
    }

    await misa.sendMessage(from, { text });
  },
};

export default addsubCommand;
