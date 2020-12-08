# NDNts Adaptive Video Server

NDNts adaptive video server is the server component for [NDNts Adaptive Video](https://github.com/yoursunny/NDNts-video) web application.
This project is built with [NDNts](https://yoursunny.com/p/NDNts/), Named Data Networking libraries for the modern web.

![NDNts logo](https://cdn.jsdelivr.net/gh/yoursunny/NDNts@2a598274eaf929c6ab6848b1fee8e998e993a0b4/docs/logo.svg)

## Installation

You should install this program in an unprivileged account.

1. Install Node.js 14.x and `pnpm`:

   ```bash
   # see https://github.com/nvm-sh/nvm
   nvm install 14

   # only needed for development environment
   npm install -g pnpm
   ```

2. Clone this repository.

3. Install local dependencies:

   ```bash
   # development environment
   npm run pnpm-install

   # production environment
   npm install --production
   ```

4. Copy `sample.env` to `.env`.

5. Generate a key and obtain a certificate for prefix registration.

   * You may use `@ndn/keychain-cli` package.
   * The signing key should be stored in a NDNts KeyChain, not in ndn-cxx KeyChain.
   * Enter KeyChain location and certificate name in `.env`.

6. Install FFmpeg and Shaka Packager:

   ```bash
   sudo apt install ffmpeg
   curl -sL https://github.com/google/shaka-packager/releases/download/v2.4.3/packager-linux | \
     sudo install /dev/stdin /usr/local/bin/shaka-packager
   ```

   This is not needed on a mirror server that does not encode from video files.

## Usage

```bash
VIDEO_FILE=$HOME/sample.mp4
VIDEO_TEMP=/tmp/video-sample
VIDEO_PREFIX=/yoursunny/video/sample

# encode, package, and add a local video
nice ./encode.sh $VIDEO_FILE $VIDEO_TEMP vp9
npm start -- add --prefix $VIDEO_PREFIX --path $VIDEO_TEMP

# start the producer
npm start -- serve

# list stored packets
npm start -- list

# export packets to DataTape
npm start -- export --prefix $PREFIX > video.dtar

# delete packets by prefix
npm start -- delete --prefix $PREFIX

# import packets from DataTape
npm start -- import < video.dtar
```

You can run the producer as a service using [pm2](https://pm2.keymetrics.io/).
A sample `ecosystem.config.js` is provided.

NDNts repo is based on LevelDB, which is non-thread-safe.
Thus, you can only run one command at a time, and you must stop the service before running other commands.

### Mirroring

This program can fetch videos from [iViSA](https://ivisa.named-data.net/) and establish a mirror site.
It can follow HLS playlist structure and download all Data packets of a video.

```bash
IVISA_PREFIX=/ndn/web/video/NDNts_NDNcomm2020
IVISA_PLAYLIST=$PREFIX/hls/playlist.m3u8

# download a video from https://ivisa.named-data.net/
npm start -- fetch --playlist $IVISA_PLAYLIST
```

The fetch command does not support DASH format, so that it cannot fetch a video prepared by `encode.sh`.
However, you can export packets of a video to a DataTape, transfer the file to another server, and import the DataTape.
