/**
 * @author Hiudy · github.com/hiudyy
 * @project Misa Bot
 */
import { WAMessage, proto } from "baileys";
import { Event } from "../types/Event.js";
import { getAntilinkData } from "../database/antilink.js";

const antilinkEvent: Event = {
  name: "antilink-monitor",
  event: "messages.upsert",
  async execute({ misa, data }) {
    const upsert = data as { messages: proto.IWebMessageInfo[] };
    const message = upsert.messages[0];
    if (!message?.message || message.key.fromMe) return;

    const from = message.key.remoteJid!;
    if (!from.endsWith("@g.us")) return;

    const db = await getAntilinkData();
    if (!db[from]) return; // Si no está activado en este grupo, ignorar

    const body = message.message?.conversation || 
                 message.message?.extendedTextMessage?.text || "";

    // Regex para grupos/canales de WA y Telegram
    const linkRegex = /(chat.whatsapp.com\/[a-zA-Z0-9]+|whatsapp.com\/channel\/[a-zA-Z0-9]+|t.me\/[a-zA-Z0-9_]+)/gi;

    if (linkRegex.test(body)) {
      const groupInviteCode = await misa.groupInviteCode(from).catch(() => null);
      
      // Si el link es del mismo grupo, no hacer nada
      if (groupInviteCode && body.includes(groupInviteCode)) return;

      const groupMetadata = await misa.groupMetadata(from);
      const sender = message.key.participant || message.key.remoteJid!;
      const participant = groupMetadata.participants.find(p => p.id === sender);
      const isAdmin = participant?.admin !== null;

      // ELIMINAR EL LINK (Acción común para todos)
      await misa.sendMessage(from, { delete: message.key });

      if (isAdmin) {
        // Si es Admin, solo advertir
        await misa.sendMessage(from, { 
          text: `⚠️ @${sender.split("@")[0]}, no mandes enlaces de otros grupos/canales aunque seas admin.`,
          mentions: [sender]
        });
      } else {
        // Si no es Admin, expulsar
        await misa.sendMessage(from, { 
          text: `🚫 Enlace externo detectado. Adiós @${sender.split("@")[0]}!`,
          mentions: [sender]
        });
        await misa.groupParticipantsUpdate(from, [sender], "remove");
      }
    }
  },
};

export default antilinkEvent;
