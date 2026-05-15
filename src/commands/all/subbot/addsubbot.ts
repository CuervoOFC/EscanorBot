/**
 * @author Damian
 */

import { WAMessage } from "baileys";

import { Command }
from "../../../types/Command.ts";

import {
  createSubBot,
} from "../../../types/subBotManager.ts";

const addsubCommand: Command = {

  name: "addsubbot",

  aliases: [
    "subbot",
  ],

  description:
    "Crea un subbot",

  category: "dono",

  async execute({
    misa,
    message,
    from,
    args,
  }) {

    const phone =
      args[0];

    if (!phone) {

      return await misa.sendMessage(
        from,
        {
          text:
`Ejemplo:

!addsubbot 5214421234567`,
        },
        {
          quoted:
            message as WAMessage,
        },
      );
    }

    try {

      await misa.sendMessage(
        from,
        {
          text:
            "⏳ Creando subbot...",
        },
        {
          quoted:
            message as WAMessage,
        },
      );

      const result =
        await createSubBot(
          phone,
        );

      await misa.sendMessage(
        from,
        {
          text:
`✅ SUBBOT CREADO

🆔 ID:
${result.botId}

🔑 CÓDIGO:
${result.code}

📲 Vincula el número en:

WhatsApp
→ Dispositivos vinculados
→ Vincular con número`,
        },
        {
          quoted:
            message as WAMessage,
        },
      );

    } catch (err: any) {

      await misa.sendMessage(
        from,
        {
          text:
`❌ Error:

${err.message}`,
        },
        {
          quoted:
            message as WAMessage,
        },
      );
    }
  },
};

export default addsubCommand;
