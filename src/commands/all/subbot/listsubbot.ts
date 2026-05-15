import { Command } from "../../../types/Command.ts";

import {
  getSubBots,
} from "../../../types/subBotManager.ts";

const listsubCommand: Command = {
  name: "listsubbots",

  description: "Lista subbots",

  category: "dono",

  async execute({
    misa,
    from,
  }) {

    const bots = getSubBots();

    if (!bots.length) {

      return await misa.sendMessage(
        from,
        {
          text: "No hay subbots activos",
        }
      );
    }

    let text =
`🤖 SUBBOTS ACTIVOS

`;

    bots.forEach((bot, i) => {

      text += `${i + 1}. ${bot}\n`;

    });

    await misa.sendMessage(
      from,
      {
        text,
      }
    );
  },
};

export default listsubCommand;
