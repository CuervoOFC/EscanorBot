import { WAMessage } from "baileys";
import { Command } from "../../../types/Command.js";
import { getBotConfig, saveBotConfig } from "../../../config.js";

const setBotCommand: Command = {
  name: "setbot",
  aliases: ["configbot", "botset"],
  description: "Edita as configurações do bot",
  category: "owner",
  ownerOnly: true,
  async execute({ misa, message, from, args }) {
    const config = await getBotConfig();
    const type = args[0]?.toLowerCase();
    const value = args.slice(1).join(" ");

    if (!type || !value) {
      return await misa.sendMessage(from, { 
        text: "❌ *Uso incorreto!*\n\nExemplo:\n!setbot nome NovoNome\n!setbot dono NovoDono\n!setbot imagem http://url.jpg" 
      }, { quoted: message as WAMessage });
    }

    switch (type) {
      case "nome":
      case "name":
        config.botName = value;
        break;
      case "dono":
      case "owner":
        config.ownerName = value;
        break;
      case "imagem":
      case "img":
        config.botImage = value;
        break;
      default:
        return await misa.sendMessage(from, { text: "❌ Opção inválida! Use: nome, dono ou imagem." });
    }

    await saveBotConfig(config);
    
    await misa.sendMessage(from, { 
      text: `✅ *Configuração atualizada!*\n\nA alteração de *${type}* foi salva com sucesso.` 
    }, { quoted: message as WAMessage });
  },
};

export default setBotCommand;
