import { config } from 'dotenv';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

let loaded = false;

export function loadEnv(): void {
  if (loaded) {
    return;
  }
  loaded = true;
  const path = resolve(process.cwd(), '.env');
  if (!existsSync(path)) {
    return;
  }
  config({ path });
}

loadEnv();
