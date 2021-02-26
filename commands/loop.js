const { MessageEmbed } = require("discord.js");
const sendError = require("../util/error");
const sendMsg = require("../util/sms");

module.exports = {
  info: {
    name: "loop",
    description: "Toggle music loop",
    usage: "loop",
    aliases: ["l"],
  },

  run: async function (client, message, args) {
    message.channel.bulkDelete(1);
    
    const serverQueue = message.client.queue.get(message.guild.id);
    if(serverQueue){
      serverQueue.loop = !serverQueue.loop;
      return sendMsg("GREEN", `🔁  **|**  Loop is **\`${serverQueue.loop === true ? "enabled" : "disabled"}\`**`, message.channel);
    }
    return sendError("There is nothing playing in this server.", message.channel);
  },
};
