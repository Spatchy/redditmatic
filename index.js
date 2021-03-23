import snoowrap from 'snoowrap'
import fs from 'fs'
import util from 'util'

const creds = JSON.parse(fs.readFileSync('credentials.json'));

const r = new snoowrap({
  userAgent: creds.reddit['user-agent'],
  clientId: creds.reddit['client-id'],
  clientSecret: creds.reddit['client-secret'],
  username: creds.reddit['username'],
  password: creds.reddit['password'],
});

r.getSubreddit('askreddit').getTop({time: 'day'}).map(async (post) => ({
  title: post.title, 
  author: post.author.name, 
  url: post.url,
  id: post.id,
  comments: await post.comments.fetchMore(30, true, false).map((comment) => ({
    body: comment.body,
    author: comment.author.name,
    url: 'https://reddit.com' + comment.permalink,
    id: comment.id,
  }))
}))
.then((obj) => fs.writeFileSync('tree.json', JSON.stringify(obj, null, 4)));