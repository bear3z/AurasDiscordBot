const { MessageEmbed } = require("discord.js");
const sendError = require("../util/error")

module.exports = {
  info: {
    name: "nowplaying",
    description: "To show the music which is currently playing in this server",
    usage: "",
    aliases: ["np"],
  },

  run: async function (client, message, args) {
    message.channel.bulkDelete(1);
    
    const serverQueue = message.client.queue.get(message.guild.id);
    if (!serverQueue)
      return sendError("There is nothing playing in this server.", message.channel);
    let song = serverQueue.songs[0];

    let thing = new MessageEmbed()
      .setAuthor("Now Playing... oVo", "https://raw.githubusercontent.com/SudhanPlayz/Discord-MusicBot/master/assets/Music.gif")
      .setColor("BLUE")
      .addField("Name", song.title, true)
      .addField("Requested by", song.req.tag, true)
    return message.channel.send(thing).then(msg =>{
      msg.delete({ timeout: 5000 })
    })
  },
};
