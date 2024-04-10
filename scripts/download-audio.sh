#!/bin/bash

if [ "$#" -ne 2 ]; then
    echo "example using:\n\nsh download-audio.sh https://www.youtube.com/watch?v=lXDCjbeUF4U output/file.mp3"
    exit 1
fi

url="$1"
output="$2"

yt-dlp $url -o $output -x --audio-format mp3
