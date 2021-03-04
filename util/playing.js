const { Util, MessageEmbed } = require("discord.js");
const ytdl = require("ytdl-core-discord");

const sendError = require("./error");
const sendMsg = require("./sms");

module.exports = {
    async playing(client, message, song){
        const queue = message.client.queue.get(message.guild.id);
        if (!song) {
            sendError("I think there are no songs in the queue.", message.channel);
            message.client.queue.delete(message.guild.id);
            return;
        }

        let stream = null;
        try{
            stream = await ytdl(song.url, { highWaterMark: 1 << 25 });
        } catch(error){
            if(queue){
                queue.songs.shift();
                module.exports.playing(client, message, queue.songs[0]);
            }
            console.error(error);
            return sendError(`Error: ${error.message}`);
        }
            
        
        queue.connection.on("disconnect", () => message.client.queue.delete(message.guild.id));
    
        const dispatcher = queue.connection
            .play(stream, { type: "opus" })
            .on("finish", () => {
                if(collector && !collector.ended)
                    collector.stop();
                if (queue.loop) {
                    let lastSong = queue.songs.shift();
                    queue.songs.push(lastSong);
                    module.exports.playing(client, message, queue.songs[0]);
                } else{
                    queue.songs.shift();
                    module.exports.playing(client, message, queue.songs[0]);
                }
            })
            .on("error", (err) => {
                console.error(err);
                queue.songs.shift();
                module.exports.play(client, message, queue.songs[0]);
            });
        dispatcher.setVolumeLogarithmic(queue.volume / 100);

        let thing = new MessageEmbed()
            .setAuthor("Started Playing Music. oVo", "https://raw.githubusercontent.com/SudhanPlayz/Discord-MusicBot/master/assets/Music.gif", song.url)
            .setThumbnail(song.img)
            .setColor("#b769c6")
            .addField(song.title, `Requested by ${song.req.tag}`)
        try {
            var playingMessage = await queue.textChannel.send(thing);
            await playingMessage.react("⏭");
            await playingMessage.react("⏯");
            await playingMessage.react("🔁");
            await playingMessage.react("⏹");
        } catch (error) {
            console.error(error);
        }

        const filter = (reaction, user) => user.id !== message.client.user.id;
        var collector = playingMessage.createReactionCollector(filter, {
            time: song.duration > 0 ? song.duration * 1000 : 600000
        });
    
        collector.on("collect", (reaction, user) => {
        if (!queue)
            return;
        const member = message.guild.member(user);
        
        switch (reaction.emoji.name) {
            case "⏭":
                queue.playing = true;
                reaction.users.remove(user).catch(console.error);
    
                queue.connection.dispatcher.end();
                sendError(`Skip ${song.title}. oVo`, message.channel).catch(console.error);
                collector.stop();
                break;
    
            case "⏯":
                reaction.users.remove(user).catch(console.error);
                if (queue.playing) {
                    queue.playing = !queue.playing;
                    queue.connection.dispatcher.pause(true);
                } else {
                    queue.playing = !queue.playing;
                    queue.connection.dispatcher.resume();
                }
                break;
    
            case "🔁":
                reaction.users.remove(user).catch(console.error);
                queue.loop = !queue.loop;
                return sendMsg("GREEN", `🔁  **|**  Loop is **\`${serverQueue.loop === true ? "enabled" : "disabled"}\`**`, message.channel);
                break;
    
            case "⏹":
                reaction.users.remove(user).catch(console.error);
                queue.songs = [];
                try {
                    queue.connection.dispatcher.end();
                } catch (error) {
                    console.error(error);
                    queue.connection.disconnect();
                }
                collector.stop();
                break;
    
            default:
                reaction.users.remove(user).catch(console.error);
                break;
            }
        });
    
        collector.on("end", () => {
            playingMessage.reactions.removeAll().catch(console.error);
            if (playingMessage && !playingMessage.deleted) {
                playingMessage.delete({ timeout: 2000 }).catch(console.error);
            }
        });
    }
}