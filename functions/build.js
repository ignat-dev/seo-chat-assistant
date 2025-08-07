// @ts-check
import { build, formatMessages } from 'esbuild';
import { readFileSync, writeFileSync, copyFileSync, existsSync } from 'fs';

try {
  // Copy `.env.local` from backend folder before build.
  copyEnvFile('../backend/.env.local', '../functions/.env', {
    // Remove this variable because the credentials file is not present
    // in the cloud environment and when Firebase default implmentation
    // tries to load it, since it's present, it crashes the process.
    GOOGLE_APPLICATION_CREDENTIALS: '',
  });


  const startTime = performance.now();
  const result = await build({
    banner: {
      js: 'import { createRequire } from "module"; const require = createRequire(import.meta.url);',
    },
    bundle: true,
    define: {
      'process.env.GOOGLE_APPLICATION_CREDENTIALS': 'undefined',
      'process.env.NODE_ENV': '"production"',
    },
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
    treeShaking: true,
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


/**
 * Copies an environment file, with optional overrides for specific variables.
 *
 * @param {string} srcPath - Path to the source `.env` file.
 * @param {string} destPath - Path to write the new `.env` file.
 * @param {Record<string, string>} [overrideMap] - Optional map of env var overrides.
 */
function copyEnvFile(srcPath, destPath, overrideMap) {
  if (!existsSync(srcPath)) {
    console.warn(`⚠ Source file does not exist: ${srcPath}`);
    return;
  }

  if (!overrideMap) {
    copyFileSync(srcPath, destPath);
    console.log(`✅ Copied ${srcPath} to ${destPath}.`);
    return;
  }

  const rawEnv = readFileSync(srcPath, 'utf8');

  const updatedEnv = rawEnv .split('\n') .map((line) => {
    const trimmed = line.trim();

    // Skip empty lines or line comments.
    if (!trimmed || trimmed.startsWith('#')) {
      return line;
    }

    const key = line.split('=')[0].trim();

    return overrideMap.hasOwnProperty(key) ? `${key}=${overrideMap[key]}` : line;
  }).join('\n');

  writeFileSync(destPath, updatedEnv);
  console.log(`✅ Copied ${srcPath} to ${destPath}.`);
}
