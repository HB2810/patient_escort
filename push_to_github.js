const fs = require('fs');
const path = require('path');
const git = require('isomorphic-git');

const dir = path.resolve(__dirname);

async function main() {
  console.log('📦 Initializing Git repository with isomorphic-git...');
  await git.init({ fs, dir });

  console.log('📄 Staging all project files...');
  const files = await fs.promises.readdir(dir);
  for (const file of files) {
    if (file === 'node_modules' || file === '.git') continue;
    try {
      const stat = await fs.promises.stat(path.join(dir, file));
      if (stat.isDirectory()) {
        const subFiles = await getRecursiveFiles(path.join(dir, file), file);
        for (const sf of subFiles) {
          if (!sf.includes('node_modules') && !sf.includes('.DS_Store') && !sf.includes('/dist/')) {
            await git.add({ fs, dir, filepath: sf });
          }
        }
      } else if (file !== '.DS_Store') {
        await git.add({ fs, dir, filepath: file });
      }
    } catch (e) {
      console.error(e);
    }
  }

  console.log('💾 Creating initial git commit...');
  const sha = await git.commit({
    fs,
    dir,
    author: {
      name: 'Stavya Spine Hospital',
      email: 'admin@stavyaspine.com'
    },
    message: 'Complete Stavya Spine Hospital Patient Escort System'
  });

  console.log(`✅ Git commit created successfully! Commit SHA: ${sha}`);
}

async function getRecursiveFiles(dirPath, relativeBase) {
  let results = [];
  const list = await fs.promises.readdir(dirPath);
  for (const file of list) {
    const filePath = path.join(dirPath, file);
    const relPath = path.join(relativeBase, file);
    const stat = await fs.promises.stat(filePath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== 'dist' && file !== '.git') {
        const res = await getRecursiveFiles(filePath, relPath);
        results = results.concat(res);
      }
    } else {
      results.push(relPath);
    }
  }
  return results;
}

main().catch(err => console.error('Git Error:', err));
