import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

const requiredPaths = [
  'index.html',
  'README.md',
  'docs/evaluation-center.md',
  'eval-platform-lite/README.md',
  'eval-platform-lite/frontend/app/page.tsx',
  'eval-platform-lite/frontend/components/TraceViewer.tsx',
  'eval-platform-lite/frontend/components/GraderResults.tsx',
  'eval-platform-lite/frontend/lib/api.ts',
  'eval-platform-lite/backend/main.py',
  'eval-platform-lite/backend/database.py',
  'eval-platform-lite/backend/routers/task_runs.py',
  'eval-platform-lite/backend/graders_v2/registry_v2.py',
  'eval-platform-lite/fixtures/README.md',
];

const forbiddenPathPatterns = [
  /(^|\/)\.env(\.|$)/,
  /(^|\/).*\.db($|-)/,
  /(^|\/).*\.sqlite($|-)/,
  /(^|\/)venv\//,
  /(^|\/)\.venv\//,
  /(^|\/)node_modules\//,
  /(^|\/)\.next\//,
  /(^|\/)logs\//,
  /(^|\/)browser_profile\//,
  /(^|\/)debug_.*\.html$/,
  /(^|\/).*\.unreadable-\d+$/,
];

const textExtensions = new Set([
  '.css',
  '.html',
  '.js',
  '.json',
  '.md',
  '.mjs',
  '.py',
  '.sh',
  '.ts',
  '.tsx',
  '.txt',
  '.yml',
  '.yaml',
]);
const privateRuntimePattern = new RegExp([
  ['eval_platform', 'db'].join('\\.'),
  ['browser', 'profile'].join('_'),
].join('|'));

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.name === '.git') continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walk(fullPath));
    } else {
      files.push(fullPath);
    }
  }

  return files;
}

function rel(filePath) {
  return path.relative(projectRoot, filePath).split(path.sep).join('/');
}

test('standalone eval center exposes demo and lite code package', () => {
  for (const requiredPath of requiredPaths) {
    assert.ok(fs.existsSync(path.join(projectRoot, requiredPath)), `Missing public artifact: ${requiredPath}`);
  }

  const homeHtml = fs.readFileSync(path.join(projectRoot, 'index.html'), 'utf8');
  assert.match(homeHtml, /商品上架内容生成 Agent 评测中心 Demo/);
  assert.match(homeHtml, /最新一轮实验概览/);

  const readme = fs.readFileSync(path.join(projectRoot, 'README.md'), 'utf8');
  assert.match(readme, /eval-platform-lite/);
  assert.match(readme, /商品上架内容生成 Agent/);
});

test('public package excludes private runtime artifacts', () => {
  const publicFiles = walk(projectRoot).map(rel);

  for (const file of publicFiles) {
    for (const pattern of forbiddenPathPatterns) {
      assert.doesNotMatch(file, pattern, `Forbidden private/runtime artifact included: ${file}`);
    }
  }
});

test('public package does not contain local paths or secret-looking values', () => {
  const files = walk(projectRoot);
  const textFiles = files.filter((file) => (
    textExtensions.has(path.extname(file)) && !rel(file).startsWith('tests/')
  ));

  for (const file of textFiles) {
    const content = fs.readFileSync(file, 'utf8');
    assert.doesNotMatch(content, /\/Users\/vincent/, `Local absolute path leaked in ${rel(file)}`);
    assert.doesNotMatch(content, /sk-[A-Za-z0-9]{8,}/, `Secret-looking key leaked in ${rel(file)}`);
    assert.doesNotMatch(content, privateRuntimePattern, `Private runtime reference leaked in ${rel(file)}`);
  }
});
