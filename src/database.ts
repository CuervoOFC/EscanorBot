// src/database/antilink.json (Crea este archivo como {})
import { promises as fs } from "node:fs";
import path from "node:path";

const dbPath = path.resolve("src/database/antilink.json");

export const getAntilinkData = async () => {
  try {
    const data = await fs.readFile(dbPath, "utf-8");
    return JSON.parse(data);
  } catch {
    return {};
  }
};

export const saveAntilinkData = async (data: object) => {
  await fs.writeFile(dbPath, JSON.stringify(data, null, 2));
};
