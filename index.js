const request = require('request');
const jsdom = require('jsdom');
const url = require('url');
const path = require('path');
const _ = require('lodash');
const fse = require('fs-extra');

const channels = require('./channels.json');

const channelLine = _.template(
    '#EXTINF:0 tvg-id="<%= id %>" tvg-logo="<%= icon %>" group-title="Québec" audio_codec="mp3" video_codec="h264" protocol="hls" container="mpegts", <%= name %>'
);

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
        var links = window.$('li a');
        var streams = {};
        var lines = [
            '#EXTM3U'
        ]
        var link, src, img, name, streamUrl, matches;
        for(var i = 0, l = links.length; i < l; i++) {
            link = links[i];
            src = link.getAttribute('href');
            img = link.childNodes[0];
            name = (img ? (img.getAttribute('title') || img.getAttribute('alt')) : '')
                .toLowerCase()
                .replace(/[^a-z0-9]+/gi, '');
            //matches = src.match(/u=([a-z0-9\.\/\:]+)/i);
            matches = src.match(/loadVideo\(\'([^\'\)\,]+).*/i);
            streamUrl = matches ? matches[1] : null;
            channel = channels.find(function(channel) {
                return channel.key === name;
            });
            if(channel) {
                streams[name] = streamUrl;
            }
        }

        var channel;
        for(i = 0, l = channels.length; i < l; i++) {
            channel = channels[i];
            stream = streams[channel.key] || null;
            if(stream) {
                lines.push(channelLine(channel));
                lines.push(stream);
            }
        }

        fse.outputFileSync(path.join(__dirname, '/resources/playlist.m3u'), lines.join('\n'));
    }
});
