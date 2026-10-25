/* Deterministic conversion of approved owner-supplied Orion artwork. No generated art. */
const path = require('node:path');
const fs = require('node:fs/promises');

const options = Object.fromEntries(process.argv.slice(2).map((arg) => {
  const separator = arg.indexOf('=');
  if (!arg.startsWith('--') || separator < 3) throw new Error('Use --name=value arguments.');
  return [arg.slice(2, separator), arg.slice(separator + 1)];
}));
const approvedRoot = 'C:/Users/iiii/.codex/visualizations/2026/10/13/01a13754-50db-75c3-a8e0-a38bf4362431/astron-bible-plan/orion-visual-review/artwork';
const sharp = require(options.sharp || 'C:/Users/iiii/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const source = {
  cover: options.cover || `${approvedRoot}/telescope-night-painting-unframed.png`,
  hunter: options.hunter || `${approvedRoot}/orion-source-adaptations/orion-hunter-engraving-atlas.png`,
};
const output = path.resolve(__dirname, '../public/art/orion');

async function main() {
  await fs.mkdir(output, { recursive: true });
  for (const width of [640, 1280]) {
    // Width is an upper bound: the approved source is 1086 px wide. Never crop or enlarge.
    await sharp(source.cover).rotate().resize({ width, withoutEnlargement: true })
      .webp({ quality: 84, effort: 6 }).toFile(path.join(output, `cover-${width}.webp`));
  }
  await sharp(source.hunter).rotate().webp({ quality: 90, effort: 6 })
    .toFile(path.join(output, 'hunter.webp'));

  for (const filename of ['cover-640.webp', 'cover-1280.webp', 'hunter.webp']) {
    const file = path.join(output, filename);
    const [metadata, stat] = await Promise.all([sharp(file).metadata(), fs.stat(file)]);
    console.log(JSON.stringify({ file, width: metadata.width, height: metadata.height, bytes: stat.size }));
  }
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
