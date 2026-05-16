import { WAMessage } from "baileys";
import { Command } from "../../../types/Command.js";

type WikiResponse = {
  status: boolean;
  creator: string;
  data: {
    results: {
      title: string;
      snippet: string;
    }[];
  };
};

async function searchWikipedia(query: string): Promise<WikiResponse> {
  const url = new URL("https://api.evogb.org/search/wikipedia");
  url.searchParams.set("query", query);
  url.searchParams.set("key", "evogb-WzR3kPpa");

  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Error API Wikipedia: ${res.status}`);
  }

  return (await res.json()) as WikiResponse;
}

const wikipediaCommand: Command = {
  name: "wikipedia",
  aliases: ["wiki", "wkp"],
  description: "Busca información en Wikipedia",
  category: "all",

  async execute({ misa, message, from, args }) {
    if (!args.length) {
      await misa.sendMessage(
        from,
        { text: "❗ Uso: wikipedia <término>" },
        { quoted: message as WAMessage }
      );
      return;
    }

    const query = args.join(" ").trim();

    await misa.sendMessage(
      from,
      { text: `📚 Buscando en Wikipedia: *${query}*...` },
      { quoted: message as WAMessage }
    );

    try {
      const data = await searchWikipedia(query);

      if (!data.status || !data.data?.results?.length) {
        await misa.sendMessage(
          from,
          { text: "❌ No se encontraron resultados." },
          { quoted: message as WAMessage }
        );
        return;
      }

      const results = data.data.results.slice(0, 5);

      let text = `📚 *Wikipedia Results*\n\n`;

      results.forEach((item, i) => {
        text += `🔹 *${i + 1}. ${item.title}*\n`;
        text += `📝 ${item.snippet}\n\n`;
      });

      await misa.sendMessage(
        from,
        { text },
        { quoted: message as WAMessage }
      );
    } catch (err) {
      await misa.sendMessage(
        from,
        {
          text: `❌ Error: ${
            err instanceof Error ? err.message : "desconocido"
          }`,
        },
        { quoted: message as WAMessage }
      );
    }
  },
};

export default wikipediaCommand;
