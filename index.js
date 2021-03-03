import snoowrap from 'snoowrap'
import fs from 'fs'

const creds = JSON.parse(fs.readFileSync('credentials.json'));

const r = new snoowrap({
  userAgent: creds.reddit['user-agent'],
  clientId: creds.reddit['client-id'],
  clientSecret: creds.reddit['client-secret'],
  username: creds.reddit['username'],
  password: creds.reddit['password'],
});

r.getSubreddit('askreddit').getTop({time: 'day'}).map(post => ({
  'title': post.title, 
  'author': post.author.name, 
  'url': post.url,
  'id': post.id,
}))
.then(console.log);