const { MessageEmbed } = require("discord.js");
const sendError = require("../util/error");

module.exports = {
  info: {
    name: "pause",
    description: "To pause the current music in the server",
    usage: "[pause]",
    aliases: ["pause"],
  },

  run: async function (client, message, args) {
    message.channel.bulkDelete(1);

    const serverQueue = message.client.queue.get(message.guild.id);

    if (serverQueue && serverQueue.playing) {
      serverQueue.playing = false;
	    try{
        serverQueue.connection.dispatcher.pause();
	    } catch (error) {
        message.client.queue.delete(message.guild.id);
        return sendError(`:notes: The player has stopped and the queue has been cleared.: ${error}`, message.channel);
    }
      let Embed = new MessageEmbed()
        .setDescription("⏸ Paused the music for you! oVo")
        .setColor("#ff93cc")
        .setTitle("Music has been paused!")
      return message.channel.send(Embed).then(msg => {
        msg.delete({ timeout: 5000 })
      });
    }
    return sendError("There is nothing playing in this server.", message.channel);
  },
};
