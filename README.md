# NDNts-ivoosh-mirror

This program allows establishing a mirror site of [NDN video service](https://github.com/chavoosh/ndn-mongo-fileserver).
It can follow HLS playlist structure and download all Data packets of a video, and then serve them from a NDNts repo.

## Installation

You should install this program in an unprivileged account.

1. Install Node.js 14.x and `pnpm`:

   ```bash
   nvm install 14
   npm install -g pnpm
   ```

2. Clone this repository, this branch only.

3. Install local dependencies:

   ```bash
   npm run pnpm-install
   ```

4. Copy `sample.env` to `.env`.

5. Generate a key and obtain a certificate for prefix registration.

   * You may use `@ndn/keychain-cli` package.
   * The signing key should be stored in a NDNts KeyChain, not in ndn-cxx KeyChain.
   * Enter KeyChain location and certificate name in `.env`.

## Usage

```bash
PREFIX=/ndn/web/video/NDNts_NDNcomm2020
PLAYLIST=$PREFIX/hls/playlist.m3u8

# download a video
npm start -- fetch --playlist $PLAYLIST

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

NDNts repo is based on LevelDB, which is non-thread-safe.
Thus, you can only run one command at a time.
