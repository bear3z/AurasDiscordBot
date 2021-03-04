const { MessageEmbed } = require("discord.js");
const sendError = require("../util/error");

module.exports = {
  info: {
    name: "resume",
    description: "To resume the paused music",
    usage: "",
    aliases: [],
  },

  run: async function (client, message, args) {
    const serverQueue = message.client.queue.get(message.guild.id);
    if (serverQueue && !serverQueue.playing) {
      serverQueue.playing = true;
      serverQueue.connection.dispatcher.resume();
      let thing = new MessageEmbed()
        .setDescription("▶ Resumed the music for you!")
        .setColor("#ff93cc")
        .setAuthor("Music has been Resumed!", "https://raw.githubusercontent.com/SudhanPlayz/Discord-MusicBot/master/assets/Music.gif")
      return message.channel.send(thing).then(msg => {
        msg.delete({ timeout: 5000 })
      });
    }
    return sendError("There is nothing playing in this server.", message.channel);
  },
};
