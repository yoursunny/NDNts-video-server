# NDNts-ivoosh-mirror

```shell
$ npm run pnpm-install

$ wget -q https://homecam.ndn.today/profile.data

$ ./node_modules/.bin/ndntssec gen-key /ndn/edu/neu/%40GUEST/tahaxo6781%40accordmail.net/$(hostname -s)
/8=ndn/8=edu/8=neu/8=%40GUEST/8=tahaxo6781%40accordmail.net/8=vps8/8=KEY/36=%00%05%B0V%DC%BF%C2%80/8=self/35=%00%00%01t%D2%A7%1A%B6

$ ./node_modules/.bin/ndntssec ndncert03-client --profile profile.data --challenge nop --key /8=ndn/8=edu/8=neu/8=%40GUEST/8=tahaxo6781%40accordmail.net/8=vps8/8=KEY/36=%00%05%B0V%DC%BF%C2%80
/8=ndn/8=edu/8=neu/8=%40GUEST/8=tahaxo6781%40accordmail.net/8=vps8/8=KEY/36=%00%05%B0V%DC%BF%C2%80/8=NDNts-Personal-CA/35=%00%00%01t%D2%A9%0F%F2/1=%E1%14%26S%E26%24%A6%C2T%84F%40%F9u%C3ye%C0%DC%7F%86%3DY%A6%91%8EF%AC%C3%A1%80

$ : 'put the certificate name to NDNTS_KEY in .env'

$ nohup node ./src/fetch.js /ndn/web/video/NDNts_NDNcomm2020/hls/playlist.m3u8
$ nohup node ./src/fetch.js /ndn/web/video/NDN_P4_NDNcomm_2020/hls/playlist.m3u8
$ nohup node ./src/fetch.js /ndn/web/video/DV_Routing_NDNcomm2020/hls/playlist.m3u8
$ nohup node ./src/fetch.js /ndn/web/video/Vertically_Securing_Smart_Grid_NDNcomm2020/hls/playlist.m3u8
```
