import enum
import os
from moviepy.editor import *
import re

total_duration = 0

def makeVideo(frame_buffer, image_folder):
    global total_duration
    fps = 25

    image_files = sorted([image_folder+'/'+img for img in os.listdir(image_folder) if img.endswith(".png")], key=lambda f: int(re.sub('\D', '', f)))
    audio_files = [image_folder+'/'+aud for aud in os.listdir(image_folder) if aud.endswith(".mp3")]  # The numbers here are wrong but correspond with sorted images when left unsorted

    for i, image in enumerate(image_files):
        print(image, flush = True)
        audio = AudioFileClip(audio_files[i])
        audio_duration = audio.duration
        clip = ImageClip(image).set_duration(audio_duration)
        total_duration += audio_duration
        clip = clip.set_audio(audio)
        clip.fps = fps
        frame_buffer.append(clip)

frame_buffer = []
print("assembling video", flush = True)
for dir in next(os.walk('./out'))[1]:
    if total_duration >= 600:  # If 10 minutes or longer, just stop and move on to rendering
        print("DURATION LIMIT MET - Video is " + str(total_duration) + " seconds long")
        break
    print("ASSEMBLING " + dir, flush = True)
    makeVideo(frame_buffer, './out/'+dir)
    print("FINISHED " + dir, flush = True)
print("ASSEMBLY COMPLETE, STARTING RENDER", flush = True)
render = concatenate_videoclips(frame_buffer)
render.write_videofile('my_video.mp4')
print("---RENDER COMPLETE!---", flush = True)