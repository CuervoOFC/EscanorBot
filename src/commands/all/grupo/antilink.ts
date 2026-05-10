/**
 * @author Hiudy · github.com/hiudyy
 * @project Misa Bot
 */
import { WAMessage, proto } from "baileys";
import { Command } from "../../../types/Command.js";

//--- BASE DE DATOS VOLÁTIL (Se reinicia al apagar el bot) ---
// Si prefieres que sea permanente, tendrías que usar el FS como te mostré antes.
const antilinkStatus: Record<string, boolean> = {};

const antilinkCommand: Command = {
  name: "antilink",
  aliases: ["anti-link"],
  description: "Configura y ejecuta el sistema anti-enlaces",
  category: "admin",
  groupOnly: true,
  adminOnly: true,
  
  // PARTE 1: El comando para encender/apagar (!antilink on/off)
  async execute({ misa, message, from, args }) {
    const body = message.message?.conversation || 
                 message.message?.extendedTextMessage?.text || "";
    
    // Si el mensaje NO empieza con el comando, tratamos de procesarlo como MONITOR
    if (!body.startsWith('!') && !body.startsWith('.')) { 
        return await this.monitor({ misa, message, from });
    }

    const action = args[0]?.toLowerCase();

    if (action === "on") {
      antilinkStatus[from] = true;
      await misa.sendMessage(from, { text: "🔒 Anti-link activado." }, { quoted: message as WAMessage });
    } else if (action === "off") {
      antilinkStatus[from] = false;
      await misa.sendMessage(from, { text: "🔓 Anti-link desactivado." }, { quoted: message as WAMessage });
    } else {
      await misa.sendMessage(from, { text: "Uso: !antilink on | off" }, { quoted: message as WAMessage });
    }
  },

  // PARTE 2: La lógica de vigilancia (Unida en el mismo objeto)
  async monitor({ misa, message, from }: { misa: any, message: proto.IWebMessageInfo, from: string }) {
    // Si no está activado para este grupo, no hacer nada
    if (!antilinkStatus[from]) return;
    if (message.key.fromMe) return;

    const text = message.message?.conversation || 
                 message.message?.extendedTextMessage?.text || "";

    const linkRegex = /(chat.whatsapp.com\/[a-zA-Z0-9]+|whatsapp.com\/channel\/[a-zA-Z0-9]+|t.me\/[a-zA-Z0-9_]+)/gi;

    if (linkRegex.test(text)) {
      // 1. Verificar si es link del mismo grupo
      const inviteCode = await misa.groupInviteCode(from).catch(() => null);
      if (inviteCode && text.includes(inviteCode)) return;

      const groupMetadata = await misa.groupMetadata(from);
      const sender = message.key.participant || message.key.remoteJid!;
      const user = groupMetadata.participants.find(p => p.id === sender);
      const isAdmin = user?.admin !== null;

      // Acción: Borrar siempre
      await misa.sendMessage(from, { delete: message.key });

      if (isAdmin) {
        await misa.sendMessage(from, { 
          text: `⚠️ @${sender.split("@")[0]}, como admin no te elimino, pero borré el enlace.`,
          mentions: [sender]
        });
      } else {
        await misa.sendMessage(from, { 
          text: `🚫 Enlace prohibido. Adiós @${sender.split("@")[0]}!`,
          mentions: [sender]
        });
        await misa.groupParticipantsUpdate(from, [sender], "remove");
      }
    }
  }
};

export default antilinkCommand;
