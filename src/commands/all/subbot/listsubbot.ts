import { Command }
from "../../../types/Command.ts";

import {
  getSubBots,
} from "../../../types/subBotManager.ts";

const listsubCommand: Command = {

  name: "listsubbots",

  aliases: [
    "subbots",
  ],

  description:
    "Lista subbots",

  category: "dono",

  async execute({
    misa,
    from,
  }) {

    const bots =
      getSubBots();

    if (!bots.length) {

      return await misa.sendMessage(
        from,
        {
          text:
            "❌ No hay subbots activos",
        },
      );
    }

    let text =
`🤖 SUBBOTS ACTIVOS

`;

    bots.forEach(
      (
        bot,
        index,
      ) => {

        text +=
`${index + 1}. ${bot}

`;
      },
    );

    await misa.sendMessage(
      from,
      {
        text,
      },
    );
  },
};

export default listsubCommand;
