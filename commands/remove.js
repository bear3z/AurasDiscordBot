const { MessageEmbed } = require("discord.js");
const sendError = require("../util/error");

module.exports = {
  info: {
    name: "remove",
    description: "Remove song from the queue",
    usage: "rm <number>",
    aliases: ["del", "rm"],
  },

  run: async function (client, message, args) {
    message.channel.bulkDelete(1);

    const queue = message.client.queue.get(message.guild.id);
    if(!queue)
      return sendError("There is no queue.", message.channel).catch(console.error);
    if(!args.length)
      return sendError(`Usage: ${client.config.prefix}\`remove <Queue Number>\``);
    if(isNaN(args[0]))
      return sendError(`Usage: ${client.config.prefix}\`remove <Queue Number>\``);
    if(queue.songs.length == 1)
      return sendError("There is no queue.",message.channel).catch(console.error);
    if(args[0] > queue.songs.length)
      return sendError(`The queue is only ${queue.songs.length} songs long!`, message.channel).catch(console.error);
    try{
      const song = queue.songs.splice(args[0] - 1, 1); 
      sendError(`❌ **|** Removed: **\`${song[0].title}\`** from the queue.`, queue.textChannel).catch(console.error);
    }catch (error) {
      return sendError(`:notes: An unexpected error occurred.\nPossible type: ${error}`, message.channel);
    }
  },
};
