import QRCode from "qrcode";
import fs from "fs";
import path from "path";

export async function generateQRImage(text: string, fileName: string) {
  const dir = "./database/subbots";
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const filePath = path.join(dir, `${fileName}.png`);

  await QRCode.toFile(filePath, text, {
    width: 600,
    margin: 2,
    color: {
      dark: "#000000",
      light: "#ffffff",
    },
  });

  return filePath;
}
