require("dotenv").config();
const { Util, MessageEmbed } = require("discord.js");

const ytdl = require("ytdl-core");
const ytdlDiscord = require("ytdl-core-discord");

const yts = require("yt-search");
const YouTubeAPI = require("simple-youtube-api");
const youtube = new YouTubeAPI(process.env.YTAPI);

const sendError = require("../util/error");
const { playing } = require("../util/playing");
const { playingList } = require("./playlist");

module.exports = {
    info: {
        name: "play",
        description: "To play songs :D",
        usage: "<YouTube_URL> | <song_name>",
        aliases: ["p"],
    },

    run: async function execute(client, message, args) {
        message.channel.bulkDelete(1);

        let channel = message.member.voice.channel;
        if (!channel)
            return sendError("You need to be in a voice channel to play music!", message.channel);

        const permissions = channel.permissionsFor(message.client.user);
        if (!permissions.has("CONNECT"))
            return sendError("I cannot connect to your voice channel, make sure I have the proper permissions!", message.channel);
        if (!permissions.has("SPEAK"))
            return sendError("I cannot speak in this voice channel, make sure I have the proper permissions!", message.channel);

        var searchString = args.join(" ");
        if (!searchString)
            return sendError("You didn't poivide want i want to play", message.channel);
        const url = args[0] ? args[0].replace(/<(.+)>/g, "$1") : "";

        var serverQueue = message.client.queue.get(message.guild.id);
        let songInfo = null;
        let song = null;

        const videoPattern = /^(https?:\/\/)?(www\.)?(m\.)?(youtube\.com|youtu\.?be)\/.+$/gi;
        const playlistPattern = /^.*(list=)([^#\&\?]*).*/gi;
        if (url.match(playlistPattern)) {
            return playingList(client, message, args);
        }
        else if (url.match(videoPattern)) {
            try {
                songInfo = await ytdl.getInfo(url);
                if (!songInfo)
                    return sendError("Looks like i was unable to find the song on YouTube", message.channel);
                song = {
                    id: songInfo.videoDetails.videoId,
                    title: songInfo.videoDetails.title,
                    url: songInfo.videoDetails.video_url,
                    img: songInfo.player_response.videoDetails.thumbnail.thumbnails[0].url,
                    req: message.author,
                };
            } catch (error) {
                console.error(error);
                return message.reply(error.message).catch(console.error);
            }
        } else {
            try {
                const results = await youtube.searchVideos(searchString, 1, { part: "snippet" });
                songInfo = await ytdl.getInfo(results[0].url);
                song = {
                    id: songInfo.videoDetails.videoId,
                    title: songInfo.videoDetails.title,
                    url: songInfo.videoDetails.video_url,
                    img: songInfo.player_response.videoDetails.thumbnail.thumbnails[0].url,
                    req: message.author,
                };
            } catch (error) {
                console.error(error);
                return message.reply(error.message).catch(console.error);
            }
        }

        if (serverQueue) {
            serverQueue.songs.push(song);
            let thing = new MessageEmbed()
                .setAuthor("Song has been added to queue", "https://raw.githubusercontent.com/SudhanPlayz/Discord-MusicBot/master/assets/Music.gif", song.url)
                .setThumbnail(song.img)
                .setColor("#f3e4bc")
                .addField(song.title, `Requested by ${song.req.tag}`)
            return message.channel.send(thing).then(msg =>{
                msg.delete({ timeout: 5000 });
            });
        }

        const queueConstruct = {
            textChannel: message.channel,
            voiceChannel: channel,
            connection: null,
            songs: [],
            volume: 80,
            playing: true,
            loop: false,
        };
        message.client.queue.set(message.guild.id, queueConstruct);
        queueConstruct.songs.push(song);

        try {
            const connection = await channel.join();
            queueConstruct.connection = connection;
            playing(client, message, queueConstruct.songs[0]);
        } catch (error) {
            console.error(`I could not join the voice channel: ${error}`);
            message.client.queue.delete(message.guild.id);
            await channel.leave();
            return sendError(`I could not join the voice channel: ${error}`, message.channel);
        }
    },
};
