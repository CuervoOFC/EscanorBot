import { WAMessage } from "baileys";
import { Command } from "../../../types/Command.js";
import { getBotConfig } from "../../../config.js";

const restartCommand: Command = {
  name: "restart",
  aliases: ["reiniciar", "reset"],
  description: "Força o reinício do processo do bot",
  category: "owner",
  ownerOnly: true,
  async execute({ misa, message, from }) {
    await misa.sendMessage(
      from,
      { text: "✎ *Reiniciando Misa Bot...*\n> O socket será fechado e reconectado em breve." },
      { quoted: message as WAMessage }
    );

    // Pequeno delay para garantir que a mensagem seja enviada
    setTimeout(() => {
      process.exit(0);
    }, 2500);
  },
};

export default restartCommand;
