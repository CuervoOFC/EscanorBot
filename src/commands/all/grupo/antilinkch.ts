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

const antilinkchCommand: Command = {
  name: "antilinkch",
  aliases: ["antilinkcanal", "alch"],
  description: "Ativa ou configura o anti-link de canal",
  category: "grupo",
  groupOnly: true,
  adminOnly: true,

  async execute({ misa, message, from, args }) {
    const config = await getGroup(from);

    // =========================
    // ATIVAR / DESATIVAR
    // =========================
    if (args.length === 0) {
      const novoEstado = !config.antilinkch.ativo;

      await saveGroup(from, {
        antilinkch: {
          ...config.antilinkch,
          ativo: novoEstado,
        },
      });

      await misa.sendMessage(
        from,
        {
          text: novoEstado
            ? "✅ Anti-link de canal ativado."
            : "❌ Anti-link de canal desativado.\n\nUse:\n• antilinkch punicao apagar\n• antilinkch punicao banir\n• antilinkch texto <mensagem>",
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
        antilinkch: {
          ...config.antilinkch,
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
              `│ ${config.antilinkch.texto || "Nenhum"}`,
              "╰────────────",
            ].join("\n"),
          },
          { quoted: message as WAMessage },
        );

        return;
      }

      const texto = args.slice(1).join(" ");

      await saveGroup(from, {
        antilinkch: {
          ...config.antilinkch,
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
          "╭─「 ANTI-LINK CANAL 」",
          "│",
          "│ ✦ Comandos:",
          "│",
          "│ • antilinkch",
          "│ • antilinkch punicao apagar",
          "│ • antilinkch punicao banir",
          "│ • antilinkch texto <mensagem>",
          "│",
          "╰────────────",
        ].join("\n"),
      },
      { quoted: message as WAMessage },
    );
  },
};

export default antilinkchCommand;
