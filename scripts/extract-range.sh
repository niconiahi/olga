#!/bin/bash

if [ "$#" -ne 4 ]; then
    echo "incorrect params provided: required $1=input, $2=output, $3=end, $4=start"
    echo "example using:\n\nsh extract-range.sh input.mp3 output.mp3 2234 2236"
    exit 1
fi

input="$1"
output="$2"
start="$3"
end="$4"

ffmpeg -i "$input" -ss "$start" -to "$end" -c copy "$output"
