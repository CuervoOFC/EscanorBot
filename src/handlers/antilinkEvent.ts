/**
 * @author Hiudy · github.com/hiudyy
 * @project Misa Bot
 */
import { proto } from "baileys";
import { Event } from "../types/Event.js";
import { getStatus } from "../commands/admin/antilink.js";

const antilinkMonitor: Event = {
  name: "antilink-monitor",
  event: "messages.upsert",
  async execute({ misa, data }) {
    const upsert = data as { messages: proto.IWebMessageInfo[] };
    const msg = upsert.messages[0];

    if (!msg.message || msg.key.fromMe) return;

    const from = msg.key.remoteJid!;
    if (!from.endsWith("@g.us")) return;

    // Verificar si el antilink está ON para este grupo
    const status = await getStatus();
    if (!status[from]) return;

    const body = msg.message?.conversation || 
                 msg.message?.extendedTextMessage?.text || 
                 msg.message?.imageMessage?.caption || "";

    const linkRegex = /(chat.whatsapp.com\/[a-zA-Z0-9]+|whatsapp.com\/channel\/[a-zA-Z0-9]+|t.me\/[a-zA-Z0-9_]+)/gi;

    if (linkRegex.test(body)) {
      // 1. Evitar que borre links del propio grupo
      const code = await misa.groupInviteCode(from).catch(() => null);
      if (code && body.includes(code)) return;

      const metadata = await misa.groupMetadata(from);
      const sender = msg.key.participant || msg.key.remoteJid!;
      const user = metadata.participants.find(p => p.id === sender);
      const isAdmin = user?.admin !== null;

      // ELIMINAR MENSAJE
      await misa.sendMessage(from, { delete: msg.key });

      if (isAdmin) {
        await misa.sendMessage(from, { 
          text: `⚠️ @${sender.split("@")[0]}, no envíes enlaces aunque seas admin.`,
          mentions: [sender]
        });
      } else {
        await misa.sendMessage(from, { 
          text: `🚫 Enlace no permitido. @${sender.split("@")[0]} expulsado.`,
          mentions: [sender]
        });
        await misa.groupParticipantsUpdate(from, [sender], "remove");
      }
    }
  },
};

export default antilinkMonitor;
