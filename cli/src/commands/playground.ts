import { join, resolve } from 'path';
import { dev } from './dev';
import { createServer } from 'vite';
import { copySync, mkdir, readdir } from 'fs-extra';
import { loadConfig } from '../config';

export async function playground() {
  const config = await loadConfig();
  const inputPath = resolve(process.cwd(), config.input.path);
  const outputPath = resolve(process.cwd(), config.output.path);
  const playgroundPath = resolve(__dirname, '../playground');
  const port = config.playground.port;

  console.log('Starting playground...');

  async function copyApplets() {
    try {
      // await mkdir(join(playgroundPath), { recursive: true });
      const applets = await readdir(outputPath);
      for (const applet of applets) {
        const srcPath = join(outputPath, applet);
        const destPath = join(playgroundPath, applet);
        copySync(srcPath, destPath);
      }
      console.log('Synced applets to playground.');
    } catch (error) {
      console.error('Error syncing applets:', error);
    }
  }

  console.log(playgroundPath);
  dev(copyApplets);

  const server = await createServer({
    root: playgroundPath,
    server: {
      port: port,
    },
  });

  await server.listen();
  console.log(`Playground running at http://localhost:${port}`);
  console.log('Press Ctrl+C to stop');
}
