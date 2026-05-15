import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
} from "baileys";

import pino from "pino";
import fs from "fs";
import path from "path";
import NodeCache from "node-cache";

const logger = pino({ level: "silent" });

const BASE_PATH = "./database/subbots";

export const subBots = new Map<string, any>();
const creating = new Set<string>();

function ensure(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export async function createSubBot(phone: string) {
  phone = phone.replace(/\D/g, "");

  if (phone.length < 10) {
    throw new Error("Número inválido");
  }

  if (subBots.size >= 3) {
    throw new Error("Máximo 3 subbots activos");
  }

  if (creating.has(phone)) {
    throw new Error("Este subbot ya se está creando");
  }

  creating.add(phone);

  try {
    ensure(BASE_PATH);

    const botId = `subbot_${Date.now()}`;
    const authPath = path.join(BASE_PATH, botId);

    ensure(authPath);

    const { state, saveCreds } =
      await useMultiFileAuthState(authPath);

    /**
     * 🔥 RC 7 FIX: versión FIJA (NO fetchLatestBaileysVersion)
     */
    const version = [2, 3000, 1020000000];

    const sock = makeWASocket({
      version,
      auth: state,
      logger,

      browser: [
        "Chrome (Linux)",
        "Ubuntu",
        "20.04",
      ],

      msgRetryCounterCache: new NodeCache(),

      connectTimeoutMs: 60000,
      defaultQueryTimeoutMs: 60000,
      keepAliveIntervalMs: 15000,

      emitOwnEvents: false,
    });

    sock.ev.on("creds.update", saveCreds);

    /**
     * 🔥 IMPORTANTE RC7:
     * NO dependemos de "open"
     */
    let ready = false;

    await new Promise<void>((resolve) => {
      const timeout = setTimeout(() => {
        console.log("⚠️ Timeout, continuando sin open...");
        resolve();
      }, 25000);

      sock.ev.on("connection.update", (u) => {
        const { connection } = u;

        if (connection === "connecting") {
          console.log("🔄 Conectando subbot...");
        }

        if (connection === "open") {
          ready = true;
          clearTimeout(timeout);
          resolve();
        }

        if (connection === "close") {
          const reason =
            (u.lastDisconnect?.error as any)
              ?.output?.statusCode;

          console.log("❌ SubBot cerrado:", reason);

          subBots.delete(botId);

          if (
            reason === DisconnectReason.loggedOut
          ) {
            console.log("🗑️ SubBot logout");
          }
        }
      });
    });

    /**
     * 🔑 Pairing RC7 (NO depende de open)
     */
    let code: string | undefined;

    try {
      code = await sock.requestPairingCode(phone);
    } catch (err) {
      throw new Error(
        "Error pairing RC7: WhatsApp bloqueó handshake o socket no listo"
      );
    }

    /**
     * Guardar socket si está usable
     */
    if (ready) {
      subBots.set(botId, sock);
    }

    return {
      botId,
      code,
    };

  } finally {
    creating.delete(phone);
  }
}

export function getSubBots() {
  return [...subBots.keys()];
}

export async function removeSubBot(botId: string) {
  const sock = subBots.get(botId);

  if (sock) {
    try {
      await sock.logout();
    } catch {}

    subBots.delete(botId);
  }

  const folder = path.join(BASE_PATH, botId);

  if (fs.existsSync(folder)) {
    fs.rmSync(folder, {
      recursive: true,
      force: true,
    });
  }

  return true;
}
