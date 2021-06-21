import snoowrap from 'snoowrap';
import fs from 'fs';
import util from 'util';
import HTMLParser from 'node-html-parser';
import tts from './tts.js';
import renderHTML from './renderHTML.js'
import path from 'path';
import child_process from 'child_process';
import process from 'process';

const creds = JSON.parse(fs.readFileSync('credentials.json'));

const startTime = Date.now();

const r = new snoowrap({
  userAgent: creds.reddit['user-agent'],
  clientId: creds.reddit['client-id'],
  clientSecret: creds.reddit['client-secret'],
  username: creds.reddit['username'],
  password: creds.reddit['password'],
});

//r.getSubreddit('askreddit').getTop({time: 'day'}).then(post => console.log(post))

function convertTime (timestamp) {
  const date = new Date(timestamp*1000);
  return date.getDate()+
  "/"+(date.getMonth()+1)+
  "/"+date.getFullYear()+
  " "+date.getHours()+
  ":"+date.getMinutes()+
  ":"+date.getSeconds();
}

r.getSubreddit('askreddit').getTop({time: 'day'}).slice(0, 5).map(async (post) => ({
  title: post.title, 
  author: post.author.name, 
  url: post.url,
  id: post.id,
  date: convertTime(post.created_utc),
  comments: await post.comments.fetchMore(30, true, false).map((comment) => ({
    body: comment.body,
    author: comment.author.name,
    url: 'https://reddit.com' + comment.permalink,
    id: comment.id,
    date: convertTime(comment.created_utc),
  }))
}))
.then((obj) => {
  fs.writeFileSync('tree.json', JSON.stringify(obj, null, 4));
  obj.forEach(element => {
    let submissionHTML = HTMLParser.parse(fs.readFileSync('./templates/submission.html'));
    submissionHTML.querySelector('.username').textContent = element.author;
    submissionHTML.querySelector('.date').textContent = element.date;
    submissionHTML.querySelector('.title').textContent = element.title;
    submissionHTML.querySelector('.url').textContent = element.url;
    if (!fs.existsSync('./out/' + element.id)){
      fs.mkdirSync('./out/' + element.id);
    }
    fs.writeFileSync('./out/' + element.id + '/0.html', submissionHTML);
    console.log("WRITTEN SUBMISSION HTML");
    tts(element.title, './out/' + element.id + '/0.mp3');

    let discardedCount = 0;
    element.comments.forEach((comment, i) => {
      let commentHTML = HTMLParser.parse(fs.readFileSync('./templates/Comment.html'));
      commentHTML.querySelector('.username').textContent = comment.author;
      commentHTML.querySelector('.date').textContent = comment.date;
      const sanitisedContent = comment.body.replace(/\\+|\*+/g, '');
      commentHTML.querySelector('.content').textContent = sanitisedContent;
      commentHTML.querySelector('.url').textContent = comment.url;
      const fileIndex = (i + 1) - discardedCount; // make sure numbers aren't skipped in file names
      if((sanitisedContent.length <= 1400) && comment.author != 'AutoModerator'){
        fs.writeFileSync('./out/' + element.id + '/'+ fileIndex + '.html', commentHTML);
        console.log("WRITTEN COMMENT HTML " + fileIndex);
        tts(sanitisedContent, './out/' + element.id + '/'+ fileIndex + '.mp3');
      } else {
        discardedCount += 1;
      }
    });
  });
  let promisesArray = [];
  fs.readdirSync('./out').filter(function (file) {
    return fs.statSync(path.resolve('./out') + '/' + file).isDirectory();
  }).forEach(folder => {
    promisesArray.push(renderHTML('./out/' + folder));
  });
    console.log(promisesArray);
    Promise.all(promisesArray).then((values) => {
      console.log(process.platform);
      var venvExecString = '';
      if(process.platform === 'win32'){
        venvExecString = './venv/Scripts/python.exe';
      } else {  // is Linux
        venvExecString = './venv/bin/python';
      }
      const pyScript = child_process.spawn(path.resolve(venvExecString), ['-u', path.resolve('./render_video.py')]);
      pyScript.stdout.on('data', (data) => {
        console.log('render_video.py: ' + data);
        
        if(String(data).includes('Moviepy - Writing video')){
          console.log(fs.stat('./' + data.split('Moviepy - Writing video ')[1]));
        }
      });
      pyScript.stdout.on('close', () => {
        console.log("finished in " + ((Date.now() - startTime)/1000) + " seconds");
      });
      pyScript.stdout.on('error', () => {
        console.error("an error occured in the child process");
        console.log("finished in " + ((Date.now() - startTime)/1000) + " seconds");
      });
    })
});

