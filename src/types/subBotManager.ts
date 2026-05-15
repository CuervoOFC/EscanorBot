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

/**
 * SubBots activos
 */
export const subBots =
  new Map<string, any>();

/**
 * Evita múltiples conexiones
 */
const creatingBots =
  new Set<string>();

function ensureDir(
  dir: string,
) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, {
      recursive: true,
    });
  }
}

/**
 * Crear SubBot
 */
export async function createSubBot(
  phone: string,
) {

  /**
   * Limpia número
   */
  phone =
    phone.replace(/\D/g, "");

  /**
   * Validación
   */
  if (
    !phone ||
    phone.length < 10
  ) {
    throw new Error(
      "Número inválido",
    );
  }

  /**
   * Límite
   */
  if (subBots.size >= 3) {
    throw new Error(
      "Máximo 3 subbots activos",
    );
  }

  /**
   * Evita spam
   */
  if (
    creatingBots.has(phone)
  ) {
    throw new Error(
      "Ya se está creando este subbot",
    );
  }

  creatingBots.add(phone);

  try {

    ensureDir(SUBBOT_PATH);

    /**
     * ID
     */
    const botId =
      `subbot_${Date.now()}`;

    /**
     * Carpeta auth
     */
    const authPath =
      path.join(
        SUBBOT_PATH,
        botId,
      );

    ensureDir(authPath);

    /**
     * Auth
     */
    const {
      state,
      saveCreds,
    } =
      await useMultiFileAuthState(
        authPath,
      );

    /**
     * Socket
     */
    const sock =
      makeWASocket({

        auth: state,

        logger,

        browser: [
          "Misa Bot",
          "Chrome",
          "1.0.0",
        ],

        /**
         * Anti freeze
         */
        connectTimeoutMs:
          60000,

        defaultQueryTimeoutMs:
          60000,

        keepAliveIntervalMs:
          10000,

        emitOwnEvents:
          false,

        fireInitQueries:
          false,

        syncFullHistory:
          false,

        markOnlineOnConnect:
          false,

        msgRetryCounterCache:
          new NodeCache(),
      });

    /**
     * Guardar creds
     */
    sock.ev.on(
      "creds.update",
      saveCreds,
    );

    /**
     * Conexión
     */
    sock.ev.on(
      "connection.update",
      async ({
        connection,
        lastDisconnect,
      }) => {

        /**
         * Conectado
         */
        if (
          connection ===
          "open"
        ) {

          console.log(
            `✅ SubBot conectado: ${botId}`,
          );

          subBots.set(
            botId,
            sock,
          );
        }

        /**
         * Desconectado
         */
        if (
          connection ===
          "close"
        ) {

          const reason =
            (lastDisconnect?.error as any)
              ?.output?.statusCode;

          console.log(
            `❌ SubBot desconectado`,
            reason,
          );

          /**
           * Eliminar activo
           */
          subBots.delete(
            botId,
          );

          /**
           * NO reconectar automáticamente
           * porque congela consola
           */
          if (
            reason ===
            DisconnectReason.loggedOut
          ) {

            console.log(
              `🗑️ Sesión cerrada`,
            );
          }
        }
      },
    );

    /**
     * Esperar socket
     */
    await new Promise(
      (resolve) =>
        setTimeout(
          resolve,
          3000,
        ),
    );

    /**
     * Pairing
     */
    const code =
      await sock.requestPairingCode(
        phone,
      );

    return {
      botId,
      code,
    };

  } catch (err) {

    throw err;

  } finally {

    /**
     * Liberar bloqueo
     */
    creatingBots.delete(
      phone,
    );
  }
}

/**
 * Obtener SubBots
 */
export function getSubBots() {

  return [
    ...subBots.keys(),
  ];
}

/**
 * Eliminar SubBot
 */
export async function removeSubBot(
  botId: string,
) {

  /**
   * Socket
   */
  const bot =
    subBots.get(botId);

  /**
   * Logout
   */
  if (bot) {

    try {

      await bot.logout();

    } catch {}

    subBots.delete(
      botId,
    );
  }

  /**
   * Carpeta
   */
  const authPath =
    path.join(
      SUBBOT_PATH,
      botId,
    );

  /**
   * Existe
   */
  if (
    fs.existsSync(authPath)
  ) {

    fs.rmSync(
      authPath,
      {
        recursive: true,
        force: true,
      },
    );
  }

  return true;
}
