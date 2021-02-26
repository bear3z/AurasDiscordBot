const { MessageEmbed } = require("discord.js");

/**
 * Easy to send errors because im lazy to do the same things :p
 * @param {String} text - Message which is need to send
 * @param {TextChannel} channel - A Channel to send error
 */

module.exports = async (text, channel) => {
    let set = new MessageEmbed()
        .setColor("RED")
        .setDescription(text)
    var msg = await channel.send(set);

    if (msg && !msg.deleted) {
        msg.delete({ timeout: 10000 }).catch(console.error);
    }

}
