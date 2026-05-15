import { Command }
from "../../../types/Command.ts";

import {
  removeSubBot,
} from "../../../types/subBotManager.ts";

const delsubCommand: Command = {

  name: "removesubbot",

  aliases: [
    "delsubbot",
    "rmsubbot",
  ],

  description:
    "Elimina un subbot",

  category: "dono",

  async execute({
    misa,
    from,
    args,
  }) {

    const botId =
      args[0];

    if (!botId) {

      return await misa.sendMessage(
        from,
        {
          text:
`Ejemplo:

!removesubbot subbot_123456`,
        },
      );
    }

    try {

      await removeSubBot(
        botId,
      );

      await misa.sendMessage(
        from,
        {
          text:
`✅ Subbot eliminado

🆔 ${botId}`,
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
      );
    }
  },
};

export default delsubCommand;
