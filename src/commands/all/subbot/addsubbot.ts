import { Command } from "../../../types/Command.ts";
import { WAMessage } from "baileys";

import { createSubBot } from "../../../types/subBotManager.ts";

const addsubCommand: Command = {
  name: "addsubbot",
  description: "Crea un subbot",

  async execute({
    misa,
    message,
    from,
    args,
  }) {

    const phone = args[0];

    if (!phone) {
      return await misa.sendMessage(
        from,
        {
          text: "Ejemplo:\n!addsubbot 5214420000000",
        },
        { quoted: message as WAMessage }
      );
    }

    try {

      await misa.sendMessage(
        from,
        {
          text: "⏳ Creando subbot...",
        },
        { quoted: message as WAMessage }
      );

      const result = await createSubBot(phone);

      await misa.sendMessage(
        from,
        {
          text:
`✅ SUBBOT CREADO

🆔 ID:
${result.botId}

🔑 Código:
${result.code}

📲 Ve a:
WhatsApp > Dispositivos vinculados
> Vincular con número`,
        },
        { quoted: message as WAMessage }
      );

    } catch (err: any) {

      await misa.sendMessage(
        from,
        {
          text: `❌ Error:\n${err.message}`,
        },
        { quoted: message as WAMessage }
      );

    }
  },
};

export default addsubCommand;
