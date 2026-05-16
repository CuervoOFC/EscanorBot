/**
 * @author Hiudy · github.com/hiudyy
 * @project Misa Bot
 */

import { WAMessage } from "baileys";
import {
  AntiLinkPunicao,
  getGroup,
  saveGroup,
} from "../../../database/groupDB.ts";
import { Command } from "../../../types/Command.ts";

const PARAMS = [
  "@usuario   → menciona o usuário",
  "@nome      → nome do usuário",
  "@grupo     → nome do grupo",
  "@tipo      → tipo do link detectado",
].join("\n│ ");

const antilinkgpCommand: Command = {
  name: "antilinkgp",
  aliases: ["antilinkgrupo", "algp"],
  description: "Ativa ou configura o anti-link de grupo",
  category: "grupo",
  groupOnly: true,
  adminOnly: true,

  async execute({ misa, message, from, args }) {
    const config = await getGroup(from);

    // =========================
    // ATIVAR / DESATIVAR
    // =========================
    if (args.length === 0) {
      const novoEstado = !config.antilinkgp.ativo;

      await saveGroup(from, {
        antilinkgp: {
          ...config.antilinkgp,
          ativo: novoEstado,
        },
      });

      await misa.sendMessage(
        from,
        {
          text: novoEstado
            ? "✅ Anti-link de grupo ativado."
            : "❌ Anti-link de grupo desativado.\n\nUse:\n• antilinkgp punicao apagar\n• antilinkgp punicao banir\n• antilinkgp texto <mensagem>",
        },
        { quoted: message as WAMessage },
      );

      return;
    }

    const action = args[0].toLowerCase();

    // =========================
    // PUNIÇÃO
    // =========================
    if (action === "punicao") {
      const punicao = args[1]?.toLowerCase() as
        | AntiLinkPunicao
        | undefined;

      if (punicao !== "apagar" && punicao !== "banir") {
        await misa.sendMessage(
          from,
          {
            text:
              "❌ Punição inválida.\n\nUse:\n• apagar\n• banir",
          },
          { quoted: message as WAMessage },
        );

        return;
      }

      await saveGroup(from, {
        antilinkgp: {
          ...config.antilinkgp,
          punicao,
        },
      });

      await misa.sendMessage(
        from,
        {
          text: `✅ Punição alterada para: *${punicao}*`,
        },
        { quoted: message as WAMessage },
      );

      return;
    }

    // =========================
    // TEXTO PERSONALIZADO
    // =========================
    if (action === "texto") {
      if (args.length === 1) {
        await misa.sendMessage(
          from,
          {
            text: [
              "╭─「 TEXTO ANTI-LINK 」",
              "│",
              "│ Parâmetros disponíveis:",
              `│ ${PARAMS}`,
              "│",
              "│ Texto atual:",
              `│ ${config.antilinkgp.texto || "Nenhum"}`,
              "╰────────────",
            ].join("\n"),
          },
          { quoted: message as WAMessage },
        );

        return;
      }

      const texto = args.slice(1).join(" ");

      await saveGroup(from, {
        antilinkgp: {
          ...config.antilinkgp,
          texto,
        },
      });

      await misa.sendMessage(
        from,
        {
          text: `✅ Texto atualizado:\n\n${texto}`,
        },
        { quoted: message as WAMessage },
      );

      return;
    }

    // =========================
    // AYUDA
    // =========================
    await misa.sendMessage(
      from,
      {
        text: [
          "╭─「 ANTI-LINK GRUPO 」",
          "│",
          "│ ✦ Comandos:",
          "│",
          "│ • antilinkgp",
          "│ • antilinkgp punicao apagar",
          "│ • antilinkgp punicao banir",
          "│ • antilinkgp texto <mensagem>",
          "│",
          "╰────────────",
        ].join("\n"),
      },
      { quoted: message as WAMessage },
    );
  },
};

export default antilinkgpCommand;
