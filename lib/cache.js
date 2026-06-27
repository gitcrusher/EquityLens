import fs from "fs";
import path from "path";

/**
 * Retrieves cached research data for a given ticker if available.
 * This ensures the demo always works for sample companies even if
 * APIs are down or rate-limited.
 */
export async function getCachedResearch(ticker) {
  try {
    const cacheDir = path.join(process.cwd(), "lib", "cache");
    const filePath = path.join(cacheDir, `${ticker.toUpperCase()}.json`);
    
    if (fs.existsSync(filePath)) {
      const fileData = await fs.promises.readFile(filePath, "utf-8");
      return JSON.parse(fileData);
    }
  } catch (error) {
    console.error(`Cache read failed for ${ticker}:`, error);
  }
  return null;
}
