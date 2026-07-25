const fs = require('fs');
const path = require('path');
const git = require('isomorphic-git');
const http = require('isomorphic-git/http/node');

const dir = path.resolve(__dirname);
const githubToken = process.argv[2] || process.env.GITHUB_TOKEN;

async function pushToGithub() {
  if (!githubToken) {
    console.log('\n-------------------------------------------------------------------');
    console.log('📌 LOCAL GIT REPOSITORY IS READY & COMMITTED!');
    console.log('-------------------------------------------------------------------');
    console.log('To push directly to https://github.com/HB2810/patient_escort.git, run:');
    console.log('node push_to_github.js YOUR_GITHUB_PERSONAL_ACCESS_TOKEN');
    console.log('-------------------------------------------------------------------\n');
    return;
  }

  console.log('🚀 Pushing to https://github.com/HB2810/patient_escort.git ...');
  
  await git.push({
    fs,
    http,
    dir,
    remote: 'origin',
    ref: 'main',
    url: 'https://github.com/HB2810/patient_escort.git',
    onAuth: () => ({ username: githubToken }),
  });

  console.log('🎉 SUCCESS! Project pushed live to GitHub repo!');
}

pushToGithub().catch(err => console.error('Push Error:', err));
