/**
 * @author Hiudy · github.com/hiudyy
 * @project Misa Bot
 */
import { WAMessage } from "baileys";
import { Command } from "../../../types/Command.js";

const linkCommand: Command = {
  name: "link",
  aliases: ["enlace"],
  description: "Muestra el enlace del grupo",
  category: "all",
  groupOnly: true,
  botAdmin: true,

  async execute({ misa, message, from, t }) {
    try {
      // Obtener código del enlace
      const inviteCode = await misa.groupInviteCode(from);

      const groupLink = `https://chat.whatsapp.com/${inviteCode}`;

      const fallbackMessage =
        `*➭ Aquí tienes el enlace del grupo:*\n\n` +
        `> \`Link:\` ${groupLink}`;

      await misa.sendMessage(
        from,
        { text: fallbackMessage },
        { quoted: message as WAMessage },
      );
    } catch (error) {
      await misa.sendMessage(
        from,
        {
          text: `❌ Error al obtener el enlace del grupo.\n\n${String(error)}`,
        },
        { quoted: message as WAMessage },
      );
    }
  },
};

export default linkCommand;
