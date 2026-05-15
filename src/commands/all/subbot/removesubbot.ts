/**
 * @author Damian
 */

import { Command } from "../../../types/Command.ts";

import fs from "fs";
import path from "path";

import {
  subBots,
} from "../../../types/subBotManager.ts";

const SUBBOT_PATH = "../../../types/database/subbots";

const command: Command = {
  name: "removesubbot",

  aliases: [
    "delsubbot",
    "rmsubbot",
  ],

  description: "Elimina un subbot",

  category: "dono",

  async execute({
    misa,
    from,
    args,
  }) {

    const botId = args[0];

    if (!botId) {

      return await misa.sendMessage(
        from,
        {
          text:
`Ejemplo:

!removesubbot subbot_123456`,
        }
      );
    }

    try {

      const bot =
        subBots.get(botId);

      if (bot) {

        try {

          await bot.logout();

        } catch {}

        subBots.delete(botId);
      }

      const authPath =
        path.join(
          SUBBOT_PATH,
          botId,
        );

      if (!fs.existsSync(authPath)) {

        return await misa.sendMessage(
          from,
          {
            text:
`❌ Subbot no encontrado`,
          }
        );
      }

      fs.rmSync(authPath, {
        recursive: true,
        force: true,
      });

      await misa.sendMessage(
        from,
        {
          text:
`✅ Subbot eliminado

🆔 ID:
${botId}`,
        }
      );

    } catch (err: any) {

      await misa.sendMessage(
        from,
        {
          text:
`❌ Error:

${err.message}`,
        }
      );
    }
  },
};

export default command;
