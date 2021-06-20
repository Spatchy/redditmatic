import textToSpeech from '@google-cloud/text-to-speech';
import fs from 'fs';
import util from 'util';
import deacronym from './deacronym.js'

const projID = 'redditmatic';
const keyFile = 'redditmatic-006af59d9e4a.json';
const client = new textToSpeech.TextToSpeechClient({projID, keyFile});

export default async function runtts(text, outPath) {
  const tweakedText = deacronym(text);
  // Construct the request
  const request = {
    input: {text: tweakedText},
    voice: {
        languageCode: "en-US",
        name: "en-US-Wavenet-I",
    },
    audioConfig: {audioEncoding: 'MP3'},
  };

  // Performs the text-to-speech request
  const [response] = await client.synthesizeSpeech(request);
  // Write the binary audio content to a local file
  const writeFile = util.promisify(fs.writeFile);
  await writeFile(outPath, response.audioContent, 'binary');
  console.log('Audio content written to file: ' + outPath);
}