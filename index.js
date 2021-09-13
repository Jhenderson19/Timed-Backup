const fs = require('fs-extra');
const path = require('path');
const readline = require('readline');


function askQuestion(query) {
    const rl = readline.createInterface({
      input: process.stdin,
        output: process.stdout,
      });

      return new Promise(resolve => rl.question(query, ans => {
        rl.close();
        resolve(ans);
      }))
};

var timer = (mins = 5) => {
  return new Promise(resolve => {
    setTimeout(resolve, 1000 * 60 * mins);
  });
}

async function main() {
  try {
    //Get Directory
    console.log(`Relative to parent directory (${path.join(__dirname, '..')})`);
    let userDir = await askQuestion('Which folder to backup? ');
    if (userDir === '') {
      console.trace();
      throw {
        msg: 'Directory must be specified!',
        name: 'noDir',
        code: 1
      }
    }
    //Parse Directory from user input
    let dir = path.join(__dirname, '..', ...userDir.split('/'));
    if(!fs.pathExistsSync(dir)) {
      console.trace();
      throw {
        msg: 'Directory must exist!',
        name: 'dirNotExist',
        dir,
        code: 2
      }
    }
    let file = path.parse(dir).name;
    let writeDir =  path.join(__dirname, 'backups');
    let time = await askQuestion('How often to backup? (minutes) ');
    time = (time === '' ? 5 : Number(time));
    if (time < 0) {
      console.trace();
      throw {
        msg: `Invalid Interval ${time}`,
        name: 'badInterval',
        time,
        code: 3
      }
    }
    time < 1 ? time = 1 : null;
    time = Math.floor(time);
    let count = await askQuestion('How many backups to keep? ');
    count = (count === '' ? 12 : Number(count));
    if (count < 1) {
      console.trace();
      throw {
        msg: `Invalid Backup Limit ${count}`,
        name: 'badBackupLimit',
        time,
        code: 4
      }
    }
    count = Math.floor(count);

    console.clear();
    console.log('Backing up', dir);
    console.log('Writing Back Ups to:', writeDir);
    console.log(`Interval: ${time} minutes`);
    console.log(`Keeping ${count} backups`);
    let i = 1;
    while (true) {
      i > count ? i = 1 : null;
      let x = timer(time);
      let actualDir = `${path.join(writeDir, file)} - Backup ${i}`;
      let recentDir = `${path.join(writeDir, file)} - Most Recent`
      await fs.copy(dir, recentDir, {overwrite: true});
      await fs.copy(dir, actualDir, {overwrite: true});
      console.log(`(${new Date().toISOString()}): Copied ${dir} to ${actualDir}`);
      i++;
      await x;
    }
  } catch (e) {
    console.error('FATAL ERROR');
    console.error(e);
    process.exit(e.code);
  }

}

main();