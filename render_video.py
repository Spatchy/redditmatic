import enum
import os
from moviepy.editor import *
import re

image_folder = './out/mt7njp'
fps = 25

image_files = sorted([image_folder+'/'+img for img in os.listdir(image_folder) if img.endswith(".png")], key=lambda f: int(re.sub('\D', '', f)))
audio_files = [image_folder+'/'+aud for aud in os.listdir(image_folder) if aud.endswith(".mp3")]  # The numbers here are wrong but correspond with sorted images when left unsorted

frame_buffer = []

for i, image in enumerate(image_files):
    print(image)
    audio = AudioFileClip(audio_files[i])
    clip = ImageClip(image).set_duration(audio.duration)
    clip = clip.set_audio(audio)
    clip.fps = fps
    frame_buffer.append(clip)

render = concatenate_videoclips(frame_buffer)
render.write_videofile('my_video.mp4')