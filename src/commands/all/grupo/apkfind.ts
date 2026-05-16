import { WAMessage } from "baileys";
import { Command } from "../../../types/Command.js";

type ApkResponse = {
  status: boolean;
  creator: string;
  data: {
    name: string;
    package: string;
    size: string;
    lastUpdated: string;
    banner: string;
    dl: string;
  };
};

async function searchApk(query: string): Promise<ApkResponse> {
  const url = new URL("https://api.evogb.org/search/apk");
  url.searchParams.set("query", query);
  url.searchParams.set("key", "evogb-WzR3kPpa");

  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Error API APK: ${res.status}`);
  }

  return (await res.json()) as ApkResponse;
}

const apkSearchCommand: Command = {
  name: "apksearch",
  aliases: ["apk", "apkp", "apkfind"],
  description: "Busca APKs y muestra link de descarga",
  category: "all",

  async execute({ misa, message, from, args }) {
    if (!args.length) {
      await misa.sendMessage(
        from,
        { text: "❗ Uso: apksearch <app>" },
        { quoted: message as WAMessage }
      );
      return;
    }

    const query = args.join(" ").trim();

    await misa.sendMessage(
      from,
      { text: `📦 Buscando APK: *${query}*...` },
      { quoted: message as WAMessage }
    );

    try {
      const data = await searchApk(query);

      if (!data.status || !data.data) {
        await misa.sendMessage(
          from,
          { text: "❌ No se encontró la APK." },
          { quoted: message as WAMessage }
        );
        return;
      }

      const app = data.data;

      // mensaje principal
      await misa.sendMessage(
        from,
        {
          image: { url: app.banner },
          caption:
            `📦 *${app.name}*\n\n` +
            `📱 Package: ${app.package}\n` +
            `📏 Tamaño: ${app.size}\n` +
            `🕒 Actualizado: ${app.lastUpdated}\n\n` +
            `⬇️ Descarga directa abajo`,
        },
        { quoted: message as WAMessage }
      );

      // enviar archivo APK como documento
      await misa.sendMessage(
        from,
        {
          document: { url: app.dl },
          fileName: `${app.name}.apk`,
          mimetype: "application/vnd.android.package-archive",
          caption: `⬇️ ${app.name} APK`,
        },
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

export default apkSearchCommand;
