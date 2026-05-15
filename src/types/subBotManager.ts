import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
} from "baileys";

import qrcode from "qrcode-terminal";
import pino from "pino";
import fs from "fs";
import path from "path";
import NodeCache from "node-cache";

const logger = pino({ level: "silent" });

const BASE_PATH = "./database/subbots";

export const subBots = new Map<string, any>();
const creating = new Set<string>();

function ensure(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

/**
 * 🔥 CREAR SUBBOT (PAIRING + QR FALLBACK)
 */
export async function createSubBot(phone: string) {
  phone = phone.replace(/\D/g, "");

  if (creating.has(phone)) {
    throw new Error("Ya se está creando este subbot");
  }

  creating.add(phone);

  try {
    ensure(BASE_PATH);

    const botId = `subbot_${Date.now()}`;
    const authPath = path.join(BASE_PATH, botId);

    ensure(authPath);

    const { state, saveCreds } =
      await useMultiFileAuthState(authPath);

    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
      version,
      auth: state,
      logger,

      browser: ["Chrome", "Windows", "10"],

      msgRetryCounterCache: new NodeCache(),
    });

    sock.ev.on("creds.update", saveCreds);

    let pairingCode: string | null = null;
    let qrFallback = false;

    /**
     * 🔥 CONNECTION HANDLER
     */
    sock.ev.on("connection.update", (u) => {
      const { connection, qr, lastDisconnect } = u;

      if (connection === "open") {
        console.log(`✅ SubBot conectado: ${botId}`);
        subBots.set(botId, sock);
      }

      if (connection === "close") {
        const reason =
          (lastDisconnect?.error as any)?.output?.statusCode;

        subBots.delete(botId);

        console.log("❌ SubBot cerrado:", reason);

        if (reason === DisconnectReason.loggedOut) {
          console.log("🗑️ SubBot eliminado (logout)");
        }
      }

      /**
       * 🔵 QR fallback
       */
      if (qr && qrFallback) {
        console.log("📲 QR de emergencia:");
        qrcode.generate(qr, { small: true });
      }
    });

    /**
     * 🔥 PAIRING PRINCIPAL
     */
    try {
      pairingCode = await sock.requestPairingCode(phone);
    } catch (err) {
      console.log("⚠️ Pairing falló → activando QR fallback");
      qrFallback = true;
    }

    /**
     * Guardar socket
     */
    subBots.set(botId, sock);

    return {
      botId,
      code: pairingCode,
      fallback: qrFallback ? "qr" : "pairing",
    };
  } finally {
    creating.delete(phone);
  }
}

/**
 * LISTAR SUBBOTS
 */
export function getSubBots() {
  return [...subBots.keys()];
}

/**
 * ELIMINAR SUBBOT
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
    fs.rmSync(folder, { recursive: true,
