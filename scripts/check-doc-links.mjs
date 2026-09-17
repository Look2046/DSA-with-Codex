import fs from 'node:fs';
import path from 'node:path';

const ROOT_DIR = path.resolve(import.meta.dirname, '..');
const DOCS_DIR = path.join(ROOT_DIR, 'docs');
const MARKDOWN_LINK_REGEX = /\[[^\]]+\]\(([^)]+)\)/g;

function collectMarkdownFiles(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectMarkdownFiles(entryPath));
      continue;
    }

    if (entry.isFile() && entry.name.endsWith('.md')) {
      files.push(entryPath);
    }
  }

  return files;
}

function normalizeLinkTarget(rawTarget) {
  if (
    rawTarget.length === 0 ||
    rawTarget.startsWith('#') ||
    rawTarget.startsWith('http://') ||
    rawTarget.startsWith('https://') ||
    rawTarget.startsWith('mailto:')
  ) {
    return null;
  }

  return rawTarget.split('#', 1)[0].replaceAll('%20', ' ');
}

function resolveLinkPath(markdownFile, target) {
  if (path.posix.isAbsolute(target) || path.win32.isAbsolute(target)) {
    return path.resolve(ROOT_DIR, `.${target}`);
  }

  return path.resolve(path.dirname(markdownFile), target);
}

const markdownFiles = collectMarkdownFiles(DOCS_DIR);
let failCount = 0;

for (const markdownFile of markdownFiles) {
  const content = fs.readFileSync(markdownFile, 'utf8');

  for (const match of content.matchAll(MARKDOWN_LINK_REGEX)) {
    const rawTarget = match[1] ?? '';
    const normalizedTarget = normalizeLinkTarget(rawTarget);
    if (!normalizedTarget) {
      continue;
    }

    const resolvedTarget = resolveLinkPath(markdownFile, normalizedTarget);
    if (!fs.existsSync(resolvedTarget)) {
      console.log(`BROKEN: ${path.relative(ROOT_DIR, markdownFile)} -> ${rawTarget}`);
      failCount += 1;
    }
  }
}

if (failCount > 0) {
  console.error(`\nFound ${failCount} broken local link(s).`);
  process.exit(1);
}

console.log('All local markdown links are valid.');
