require("dotenv").config();

const { Util, MessageEmbed } = require("discord.js");

const ytdl = require("ytdl-core");
const ytdlDiscord = require("ytdl-core-discord");

const YouTubeAPI = require("simple-youtube-api");
const youtube = new YouTubeAPI(process.env.YTAPI);

const sendError = require("../util/error");
const { playing } = require("../util/playing");

module.exports = {
    info: {
        name: "playlist",
        description: "To play songs :D",
        usage: "<YouTube Playlist URL | Playlist Name>",
        aliases: ["pl"],
    },

    async playingList(client, message, args) {

        const channel = message.member.voice.channel;
        const serverQueue = message.client.queue.get(message.guild.id);

        if (!channel)
            return sendError("I'm sorry but you need to be in a voice channel to play music!", message.channel);

        const permissions = channel.permissionsFor(message.client.user);
        if (!permissions.has("CONNECT"))
            return sendError("I cannot connect to your voice channel, make sure I have the proper permissions!", message.channel);
        if (!permissions.has("SPEAK"))
            return sendError("I cannot speak in this voice channel, make sure I have the proper permissions!", message.channel);

        const url = args[0] ? args[0].replace(/<(.+)>/g, "$1") : "";
        var searchString = args.join(" ");
        if (!searchString || !url)
            return sendError(`Usage: ${message.client.config.prefix}playlist <YouTube Playlist URL | Playlist Name>`, message.channel);

        const queueConstruct = {
            textChannel: message.channel,
            voiceChannel: channel,
            connection: null,
            songs: [],
            volume: 80,
            playing: true,
            loop: false,
        };

        const pattern = /^.*(youtu.be\/|list=)([^#\&\?]*).*/gi;
        const urlValid = pattern.test(args[0]);

        let playlist = null;
        let videos = [];
        try {
            playlist = await youtube.getPlaylist(args[0], { part: "snippet"});
            videos = await playlist.getVideos(1000, { part: "snippet"});
        } catch (error) {
            return sendError(error.message, message.channel);
        }

        const newSongs = videos
            .filter((video) => video.title != "Private video" && video.title != "Deleted video")
            .map((video) => {
                return (song = {
                  title: video.title,
                  url: video.url,
                  req: message.author,
                });
            });
        
        serverQueue ? serverQueue.songs.push(...newSongs) : queueConstruct.songs.push(...newSongs);

        let playlistEmbed = new MessageEmbed()
            .setAuthor("The songs in the playlist have been added to queue. oVo", "https://raw.githubusercontent.com/SudhanPlayz/Discord-MusicBot/master/assets/Music.gif", playlist.url)
            .setColor("#f8aa22")
            .addField(playlist.title, `Requested by ${song.req.tag}`)
        message.channel.send(playlistEmbed).then(msg =>{
            msg.delete({ timeout: 20000 });
        });

        if (!serverQueue) {
            message.client.queue.set(message.guild.id, queueConstruct);
            try {
                queueConstruct.connection = await channel.join();
                await queueConstruct.connection.voice.setSelfDeaf(true);
                playing(client, message, queueConstruct.songs[0]);
            } catch (error) {
                console.error(error);
                message.client.queue.delete(message.guild.id);
                await channel.leave();
                return sendError(`I could not join the voice channel: ${error}`, message.channel);
            }
        }
    }
};
