import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
} from "baileys";

import pino from "pino";
import fs from "fs";
import path from "path";
import NodeCache from "node-cache";

const logger = pino({
  level: "silent",
});

const SUBBOT_PATH = "./database/subbots";

export const subBots = new Map<string, any>();

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, {
      recursive: true,
    });
  }
}

export async function createSubBot(
  phone: string,
) {

  ensureDir(SUBBOT_PATH);

  const botId =
    `subbot_${Date.now()}`;

  const authPath =
    path.join(
      SUBBOT_PATH,
      botId,
    );

  ensureDir(authPath);

  const {
    state,
    saveCreds,
  } =
    await useMultiFileAuthState(
      authPath,
    );

  const sock = makeWASocket({
    auth: state,
    logger,

    browser: [
      "Misa Bot",
      "Chrome",
      "1.0.0",
    ],

    msgRetryCounterCache:
      new NodeCache(),
  });

  sock.ev.on(
    "creds.update",
    saveCreds,
  );

  sock.ev.on(
    "connection.update",
    async ({
      connection,
      lastDisconnect,
    }) => {

      if (connection === "open") {

        console.log(
          `✅ SubBot conectado: ${botId}`,
        );

        subBots.set(
          botId,
          sock,
        );
      }

      if (connection === "close") {

        const reason =
          (lastDisconnect?.error as any)
            ?.output?.statusCode;

        console.log(
          `❌ SubBot desconectado`,
        );

        subBots.delete(botId);

        if (
          reason !==
          DisconnectReason.loggedOut
        ) {

          console.log(
            `🔄 Reconectando SubBot...`,
          );

          createSubBot(phone);
        }
      }
    },
  );

  await new Promise(
    (resolve) =>
      setTimeout(resolve, 3000),
  );

  const code =
    await sock.requestPairingCode(
      phone,
    );

  return {
    botId,
    code,
  };
}

export function getSubBots() {
  return [...subBots.keys()];
}

export async function removeSubBot(
  botId: string,
) {

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

  if (
    fs.existsSync(authPath)
  ) {

    fs.rmSync(authPath, {
      recursive: true,
      force: true,
    });
  }

  return true;
}
