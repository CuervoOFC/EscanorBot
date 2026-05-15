import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  makeCacheableSignalKeyStore
} from "baileys";

import NodeCache from "node-cache";
import pino from "pino";
import fs from "fs";
import path from "path";

const logger = pino({ level: "silent" });

const SUB_DIR = "./database/subbots";

export const activeSubBots = new Map();

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export async function createSubBot(phone: string) {
  const botId = `subbot_${Date.now()}`;

  const authDir = path.join(SUB_DIR, botId);

  ensureDir(authDir);

  const { state, saveCreds } = await useMultiFileAuthState(authDir);

  const sock = makeWASocket({
    auth: state,
    logger,
    browser: ["Ubuntu", "Chrome", "20.0.04"],
    msgRetryCounterCache: new NodeCache(),
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", async ({ connection, lastDisconnect }) => {
    if (connection === "open") {
      console.log(`✅ SubBot conectado: ${botId}`);

      activeSubBots.set(botId, sock);
    }

    if (connection === "close") {
      const reason =
        (lastDisconnect?.error as any)?.output?.statusCode;

      console.log("❌ Desconectado:", reason);

      activeSubBots.delete(botId);

      if (reason !== DisconnectReason.loggedOut) {
        createSubBot(phone);
      }
    }
  });

  await new Promise((resolve) => setTimeout(resolve, 3000));

  const code = await sock.requestPairingCode(phone);

  return {
    botId,
    code,
  };
}

export function listSubBots() {
  return [...activeSubBots.keys()];
}
