# Redditmatic
### What Is It?
Redditmatic is a fully automated cli tool to create text-to-speech reddit videos with zero human interaction.
When activated, it will retrieve the day's top r/askreddit questions and then craft a text-to-speech video ready to be uploaded to YouTube. 

### How Does It Work?
1. The Reddit API is used to fetch the top r/askreddit questions of that day
2. HTML templating is used to insert the data into a custom HTML body with custom CSS, this can be edited to match a channel's branding
3. A headless Chromium instance is used to take a 1920x1080 screenshot of each complete page
4. The r/askreddit data is sent to the Google Cloud Text-to-Speech API to retrieve audio files of the question and answers being read aloud
5. Each screenshotted HTML image and corresponding audio file is passed to a python script where the moviePy library is used to combine images and audio into video
6. Once the video length reaches approx. 10 minutes, it is rendered and an mp4 video file is saved to disk

### Has it ever been used?
While I thoughroughly tested it myself, I never used it to upload a video to YouTube.
This was done simply as a challenge and to prove that those TTS Reddit videos can be done with even less effort.

### Can it be improved?
There are probably several points where efficiency can be improved, but due to the video render taking so much longer than any other part of the program, these would be negligable.
I did look into adding YouTube API functionality so videos could automatically be uploaded after they are saved, but the cost of using the upload API is too high.
