/**
 * @author Hiudy · github.com/hiudyy
 * @project Misa Bot
 */
import { WAMessage } from "baileys";
import { Command } from "../../../types/Command.ts";
import { getAntilinkData, saveAntilinkData } from "../../../database.js";

const antilinkCommand: Command = {
  name: "antilink",
  aliases: ["anti-link"],
  description: "Activa o desactiva el anti-enlaces en el grupo",
  category: "admin",
  groupOnly: true,
  adminOnly: true,
  async execute({ misa, message, from, args }) {
    const db = await getAntilinkData();
    const action = args[0]?.toLowerCase();

    if (action === "on") {
      db[from] = true;
      await saveAntilinkData(db);
      await misa.sendMessage(from, { text: "✅ Anti-link activado con éxito." }, { quoted: message as WAMessage });
    } else if (action === "off") {
      db[from] = false;
      await saveAntilinkData(db);
      await misa.sendMessage(from, { text: "❌ Anti-link desactivado." }, { quoted: message as WAMessage });
    } else {
      await misa.sendMessage(from, { text: "Uso: !antilink on | off" }, { quoted: message as WAMessage });
    }
  },
};

export default antilinkCommand;
