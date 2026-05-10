import { WAMessage } from "baileys";
import { Command } from "../../../types/Command.js";
import { exec } from "child_process";

const updateCommand: Command = {
  name: "update",
  aliases: ["fix", "atualizar"],
  description: "Sincroniza o bot com o repositório do GitHub",
  category: "owner",
  ownerOnly: true,
  async execute({ misa, message, from }) {
    await misa.sendMessage(from, { text: "⏳ *Executando git pull...*" }, { quoted: message as WAMessage });

    exec("git pull", async (error, stdout, stderr) => {
      if (error) {
        return await misa.sendMessage(from, { 
          text: `❌ *Erro de execução:*\n\n${error.message}` 
        }, { quoted: message as WAMessage });
      }

      if (stderr && !stdout) {
        return await misa.sendMessage(from, { 
          text: `⚠️ *Aviso:*\n\n${stderr}` 
        }, { quoted: message as WAMessage });
      }

      const isUpdated = stdout.includes("Already up to date.");
      const response = isUpdated 
        ? "✅ *Sistema em dia:* Não há alterações pendentes." 
        : `✅ *Atualizado com sucesso:*\n\n${stdout}`;

      await misa.sendMessage(from, { text: response }, { quoted: message as WAMessage });
    });
  },
};

export default updateCommand;
