import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const envDir = join(root, 'config', 'environments');
const targets = [
  { from: '.env.example', to: '.env' },
  { from: '.env.dev.example', to: '.env.dev' },
  { from: '.env.uat.example', to: '.env.uat' },
];

mkdirSync(envDir, { recursive: true });

for (const target of targets) {
  const sourcePath = join(envDir, target.from);
  const destinationPath = join(envDir, target.to);

  if (!existsSync(destinationPath)) {
    copyFileSync(sourcePath, destinationPath);
    console.log(`Created ${destinationPath}`);
  } else {
    console.log(`Skipped existing ${destinationPath}`);
  }
}
