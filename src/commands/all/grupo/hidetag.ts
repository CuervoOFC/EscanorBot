import { WAMessage, downloadContentFromMessage, proto } from "baileys";
import { Command } from "../../../types/Command.js";

const hidetagCommand: Command = {
  name: "hidetag",
  aliases: ["tag", "marcar"],
  description: "Marca todos os membros do grupo discretamente",
  category: "all",
  groupOnly: true,
  adminOnly: true,
  async execute({ misa, message, from, args }) {
    try {
      // 1. Obter todos os participantes para mencionar
      const groupMetadata = await misa.groupMetadata(from);
      const participants = groupMetadata.participants.map((p) => p.id);

      // 2. Identificar se há texto ou mensagem respondida (quoted)
      const text = args.join(" ");
      const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      const quotedContext = message.message?.extendedTextMessage?.contextInfo;

      if (!quoted && !text) {
        return await misa.sendMessage(from, { 
          text: "《✧》 *Erro:* Insira um texto ou responda a uma mídia/mensagem." 
        }, { quoted: message as WAMessage });
      }

      // 3. Lógica para mídias (se houver mensagem respondida com mídia)
      if (quoted) {
        const mime = Object.keys(quoted)[0]; // Obtém o tipo de mensagem (imageMessage, videoMessage, etc)
        
        // Verificamos se é um tipo de mídia suportado
        if (["imageMessage", "videoMessage", "audioMessage", "stickerMessage"].includes(mime)) {
          const messageType = mime.replace("Message", "");
          // @ts-ignore - Acessando dinamicamente a mensagem de mídia
          const mediaMessage = quoted[mime];
          
          // Baixar o conteúdo da mídia
          const stream = await downloadContentFromMessage(
            mediaMessage,
            messageType as any
          );
          
          let buffer = Buffer.from([]);
          for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
          }

          const options: any = { mentions: participants };
          
          // Configurar objeto de envio conforme o tipo
          const messageContent: any = {};
          if (mime === "imageMessage") {
            messageContent.image = buffer;
            messageContent.caption = text || mediaMessage.caption || "";
          } else if (mime === "videoMessage") {
            messageContent.video = buffer;
            messageContent.caption = text || mediaMessage.caption || "";
            messageContent.mimetype = "video/mp4";
          } else if (mime === "audioMessage") {
            messageContent.audio = buffer;
            messageContent.mimetype = "audio/mp4";
            messageContent.ptt = mediaMessage.ptt || false;
          } else if (mime === "stickerMessage") {
            messageContent.sticker = buffer;
          }

          return await misa.sendMessage(from, messageContent, options);
        }
      }

      // 4. Se for apenas texto (ou se a resposta for apenas texto)
      const finalText = text || quotedContext?.quotedMessage?.conversation || quotedContext?.quotedMessage?.extendedTextMessage?.text || "";

      await misa.sendMessage(
        from,
        { text: finalText, mentions: participants },
        { quoted: null } // Enviamos sem responder a ninguém para o hidetag ficar limpo
      );

    } catch (error) {
      console.error(error);
      await misa.sendMessage(from, { 
        text: "《✧》 *Erro:* Ocorreu um problema ao executar o hidetag." 
      }, { quoted: message as WAMessage });
    }
  },
};

export default hidetagCommand;
