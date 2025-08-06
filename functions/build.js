// @ts-check
import { build, formatMessages } from 'esbuild';
import { copyFileSync, existsSync } from 'fs';

try {
  // Copy `.env.local` from backend folder before build.
  const envSrc = '../backend/.env.local';
  const envDest = '../functions/.env';

  if (existsSync(envSrc)) {
    copyFileSync(envSrc, envDest);
    console.log(`✅ Copied ${envSrc} to ${envDest}.`);
  } else {
    console.warn(`⚠ No .env.local file found at ${envSrc}.`);
  }

  const startTime = performance.now();
  const result = await build({
    banner: {
      js: 'import { createRequire } from "module"; const require = createRequire(import.meta.url);',
    },
    bundle: true,
    entryPoints: ['../backend/src/server.ts'],
    external: [
      '@fastify/cors',
      '@langchain/core',
      '@langchain/openai',
      'fastify',
      'firebase-admin',
    ],
    format: 'esm',
    metafile: true,
    outdir: 'lib',
    platform: 'node',
    sourcemap: true,
    target: 'node22',
  });

  const endTime = performance.now();
  const outputs = result.metafile.outputs;

  console.log(`\nBuild output:`);

  for (const [file, info] of Object.entries(outputs)) {
    console.log(`- ${file}  ${(info.bytes / 1024).toFixed(2)} KB`);
  }

  console.log(`\n✅ Build successful! (done in ${(endTime - startTime).toFixed()}ms)`);
} catch (ex) {
  console.error(
    ex.errors
      ? await formatMessages(ex.errors, { kind: 'error', color: true }).then((x) => x.join('\n'))
      : ex
  );
  process.exit(1);
}
