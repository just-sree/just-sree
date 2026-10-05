// Pulls the latest two-page master resume from the job-search repo into the site.
// Run with: npm run sync-resume   (set RESUME_SOURCE to use a different file)
// The site serves it at /resume.pdf and visitors download it as Sree-Chackoth_Resume.pdf.
import { readFile, writeFile, stat } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';

const source = process.env.RESUME_SOURCE
  ? pathToFileURL(process.env.RESUME_SOURCE)
  : new URL('../../ai-job-search/cv/Sree_Chackoth_Resume_Master_2Page.pdf', import.meta.url);
const target = new URL('./public/resume.pdf', import.meta.url);
const sitemap = new URL('./public/sitemap.xml', import.meta.url);

let latest;
try {
  latest = await readFile(source);
} catch {
  console.error(`No resume found at ${fileURLToPath(source)}. Nothing changed.`);
  process.exit(1);
}
if (latest.subarray(0, 5).toString() !== '%PDF-') {
  console.error('The source file is not a PDF. Nothing changed.');
  process.exit(1);
}

const current = await readFile(target).catch(() => null);
if (current?.equals(latest)) {
  console.log('resume.pdf is already the latest version.');
} else {
  await writeFile(target, latest);
  const modified = (await stat(source)).mtime.toISOString().slice(0, 10);
  const map = await readFile(sitemap, 'utf8');
  await writeFile(sitemap, map.replace(/(resume\.pdf<\/loc><lastmod>)[^<]*/, `$1${modified}`));
  console.log(`resume.pdf updated from ${fileURLToPath(source)} (${latest.length.toLocaleString('en-US')} bytes, dated ${modified}). Commit and push to publish it.`);
}
