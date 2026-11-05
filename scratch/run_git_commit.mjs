import git from 'isomorphic-git';
import fs from 'fs';
import path from 'path';

async function run() {
  const dir = '.';
  console.log('📌 1. Initializing Git repository...');
  await git.init({ fs, dir });
  console.log('✅ Git repository initialized (.git directory created).');

  console.log('\n📌 2. Staging files (git add .)...');
  // Read all files ignoring node_modules, dist, .git
  const statusMatrix = await git.statusMatrix({
    fs,
    dir,
    filter: (f) => !f.startsWith('node_modules') && !f.startsWith('dist') && !f.startsWith('.git')
  });

  const stagedFiles = [];
  for (const [filepath, head, workdir, stage] of statusMatrix) {
    // If file is new or modified in workdir
    if (workdir !== 0) {
      await git.add({ fs, dir, filepath });
      stagedFiles.push(filepath);
    }
  }

  console.log(`✅ Staged ${stagedFiles.length} files:`);
  stagedFiles.slice(0, 15).forEach((f) => console.log(`   + ${f}`));
  if (stagedFiles.length > 15) {
    console.log(`   ... and ${stagedFiles.length - 15} more files`);
  }

  console.log('\n📌 3. Creating commit: "feat: obsidian bento refinements, radial glow accents, zero-CLS tabular figures, and 4-vector QA"...');
  const sha = await git.commit({
    fs,
    dir,
    author: {
      name: 'Antigravity Developer',
      email: 'antigravity@gemini.google.com',
    },
    message: 'feat: obsidian bento refinements, radial glow accents, zero-CLS tabular figures, and 4-vector QA',
  });

  console.log(`🎉 Commit created successfully! Commit SHA: ${sha}`);

  // Verify commit log
  const commits = await git.log({ fs, dir, depth: 5 });
  console.log('\n📌 Git Log:');
  commits.forEach((c) => {
    console.log(`commit ${c.oid}`);
    console.log(`Author: ${c.commit.author.name} <${c.commit.author.email}>`);
    console.log(`Date:   ${new Date(c.commit.author.timestamp * 1000).toUTCString()}`);
    console.log(`\n    ${c.commit.message}\n`);
  });
}

run().catch((err) => {
  console.error('❌ Git operation failed:', err);
  process.exit(1);
});

