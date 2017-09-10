const request = require('request');
const jsdom = require('jsdom');
const url = require('url');
const path = require('path');
const _ = require('lodash');
const fs = require('fs');
const fse = require('fs-extra');

const channels = require('./channels.json');

const channelsTemplate = _.template(
    fse.readFileSync(
        path.join(__dirname, '/playlist.ejs'),
    ),
);

const defaultChannel = {
    group: 'Québec',
    video_codec: 'h264',
    audio_codec: 'mp3',
    protocol: 'hls',
    container: 'mpegts'
};

const pageUrl = 'http://opus.re/index-PLAYLIST.php';
const scripts = [
    'http://code.jquery.com/jquery.js'
];
const headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36',
    'Referer': 'http://opus.re/'
};

jsdom.env({
    url: pageUrl,
    scripts: scripts,
    headers: headers,
    userAgent: headers['User-Agent'],
    done: function(err, window) {
        const links = window.$('li a');

        const channelsForPlaylist = [];
        links.each(function (key, link) {
            const src = link.getAttribute('href');
            const matches = (src || '').match(/loadVideo\(\'([^\'\)\,]+).*/i);
            if (!matches || link.childNodes.length < 1) {
                return;
            }
            const streamUrl = matches[1];
            const img = link.childNodes[0];
            const name = (img.getAttribute('title') || img.getAttribute('alt'))
                .toLowerCase()
                .replace(/[^a-z0-9]+/gi, '');
            const channel = channels.find(function(channel) {
                return channel.opus_key === name;
            });
            if(channel) {
                const channelWithPlaylist = Object.assign({}, defaultChannel, channel, {
                    stream: streamUrl,
                });
                channelsForPlaylist.push(channelWithPlaylist);
            }
        });

        fse.outputFileSync(
            path.join(__dirname, '/resources/playlist.m3u'),
            channelsTemplate({
                channels: channelsForPlaylist,
            }),
        );
    }
});
