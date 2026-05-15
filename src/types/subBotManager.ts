import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
} from "baileys";

import pino from "pino";
import fs from "fs";
import path from "path";
import NodeCache from "node-cache";

const logger = pino({ level: "silent" });

const BASE_PATH = "./database/subbots";

/**
 * Subbots activos
 */
export const subBots = new Map<string, any>();

/**
 * Locks anti spam / freeze
 */
const creating = new Set<string>();

/**
 * Utils
 */
function ensure(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * PRO CREATE SUBBOT
 */
export async function createSubBot(phone: string) {
  phone = phone.replace(/\D/g, "");

  if (phone.length < 10) {
    throw new Error("Número inválido");
  }

  if (subBots.size >= 3) {
    throw new Error("Máximo 3 subbots activos");
  }

  if (creating.has(phone)) {
    throw new Error("Ya se está creando este subbot");
  }

  creating.add(phone);

  try {
    ensure(BASE_PATH);

    const botId = `subbot_${Date.now()}`;
    const authPath = path.join(BASE_PATH, botId);

    ensure(authPath);

    /**
     * 🔥 versión estable automática
     */
    const { version } = await fetchLatestBaileysVersion();

    const { state, saveCreds } =
      await useMultiFileAuthState(authPath);

    const sock = makeWASocket({
      version,
      auth: state,
      logger,

      browser: ["Chrome", "Windows", "10"],

      msgRetryCounterCache: new NodeCache(),

      connectTimeoutMs: 60000,
      defaultQueryTimeoutMs: 60000,
      keepAliveIntervalMs: 15000,

      emitOwnEvents: false,
    });

    sock.ev.on("creds.update", saveCreds);

    /**
     * 🔥 Espera REAL conexión (NO timeout fake)
     */
    await new Promise((resolve, reject) => {
      const t = setTimeout(() => {
        reject(new Error("Timeout conexión subbot"));
      }, 60000);

      sock.ev.on("connection.update", (u) => {
        if (u.connection === "open") {
          clearTimeout(t);
          resolve(true);
        }
      });
    });

    /**
     * 🔑 pairing SOLO cuando está OPEN
     */
    const code = await sock.requestPairingCode(phone);

    /**
     * Listener conexión
     */
    sock.ev.on("connection.update", (u) => {
      const { connection, lastDisconnect } = u;

      if (connection === "open") {
        console.log(`✅ SubBot conectado: ${botId}`);
        subBots.set(botId, sock);
      }

      if (connection === "close") {
        const reason =
          (lastDisconnect?.error as any)?.output?.statusCode;

        subBots.delete(botId);

        console.log("❌ SubBot cerrado:", reason);

        /**
         * ❌ NO auto-reconnect (evita freeze)
         */
        if (reason === DisconnectReason.loggedOut) {
          console.log("🗑️ SubBot deslogueado");
        }
      }
    });

    return {
      botId,
      code,
    };
  } finally {
    creating.delete(phone);
  }
}

/**
 * LISTAR
 */
export function getSubBots() {
  return [...subBots.keys()];
}

/**
 * ELIMINAR PRO
 */
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
