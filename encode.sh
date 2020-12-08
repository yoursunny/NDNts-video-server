#!/bin/bash
set -e
set -o pipefail

usage() {
  echo './encode.sh INPUT.mp4 OUTPUT-DIR [vp9|x264]' >/dev/stderr
  exit 2
}

if [[ -z $2 ]]; then
  usage
fi

INPUT=$1
OUTPUT=$2
FORMAT=${3:-vp9}
INTERMEDIATE=/tmp/$(basename $INPUT | awk -F. -vOFS=. '{ NF-=1; print }')

FFMPEG=ffmpeg
PACKAGER=/usr/local/bin/shaka-packager
GOP=30
declare -A RESOLUTIONS
RESOLUTIONS[360]='360k 600k baseline 3.0'
RESOLUTIONS[480]='500k 1000k main 3.1'
RESOLUTIONS[720]='1500k 3000k main 4.0'

mkdir -p $OUTPUT $INTERMEDIATE

VP9STREAMS=()
X264STREAMS=()

for R in "${!RESOLUTIONS[@]}"; do
  if [[ ${#VP9STREAMS[@]} -eq 0 ]]; then
    VP9STREAMS+=('in='$INTERMEDIATE/$R'.webm,stream=audio,init_segment='$OUTPUT/'audio_init.webm,segment_template='$OUTPUT/'audio_$Number%08d$.webm')
    X264STREAMS+=('in='$INTERMEDIATE/$R'.mp4,stream=audio,init_segment='$OUTPUT/'audio_init.mp4,segment_template='$OUTPUT/'audio_$Number%08d$.m4s')
  fi
  VP9STREAMS+=('in='$INTERMEDIATE/$R'.webm,stream=video,init_segment='$OUTPUT/$R'_init.webm,segment_template='$OUTPUT/$R'_$Number%08d$.webm')
  X264STREAMS+=('in='$INTERMEDIATE/$R'.mp4,stream=video,init_segment='$OUTPUT/$R'_init.mp4,segment_template='$OUTPUT/$R'_$Number%08d$.m4s')

  R_TOKENS=(${RESOLUTIONS[$R]})
  VP9BITRATE=${R_TOKENS[0]}
  X264BITRATE=${R_TOKENS[1]}
  X264PROFILE=${R_TOKENS[2]}
  X264LEVEL=${R_TOKENS[3]}

  if [[ $FORMAT == 'vp9' ]] && ! [[ -f $INTERMEDIATE/$R.webm ]]; then
    $FFMPEG -i $INPUT -strict -2 -c:a opus -vf scale=-2:$R -c:v libvpx-vp9 \
      -profile:v 0 -keyint_min $GOP -g $GOP \
      -tile-columns 4 -frame-parallel 1 -speed 1 \
      -auto-alt-ref 1 -lag-in-frames 25 -b:v $VP9BITRATE \
      -y $INTERMEDIATE/$R.webm
  elif [[ $FORMAT == 'x264' ]] && ! [[ -f $INTERMEDIATE/$R.mp4 ]]; then
    $FFMPEG -i $INPUT -c:a copy -vf scale=-2:$R -c:v libx264 \
      -profile:v $PROFILE -level:v $LEVEL \
      -x264-params scenecut=0:open_gop=0:min-keyint=$GOP:keyint=$GOP \
      -minrate $X264BITRATE -maxrate $X264BITRATE -bufsize $X264BITRATE -b:v $X264BITRATE \
      -y $INTERMEDIATE/$R.mp4
  fi
done

if [[ $FORMAT == 'vp9' ]]; then
  STREAMS=("${VP9STREAMS[@]}")
elif [[ $FORMAT == 'x264' ]]; then
  STREAMS=("${X264STREAMS[@]}")
else
  usage
fi
$PACKAGER "${STREAMS[@]}" --generate_static_live_mpd --allow_approximate_segment_timeline --segment_duration 1 --mpd_output $OUTPUT/playlist.mpd