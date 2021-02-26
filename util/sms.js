const { MessageEmbed } = require("discord.js")

/**
 * Send simple message
 * @param {String} color - 
 * @param {String} text - Message which is need to send
 * @param {TextChannel} channel - A Channel to send error
 */

module.exports = async (color, text, channel) => {
    let set = new MessageEmbed()
        .setColor(color)
        .setDescription(text)
    var msg = await channel.send(set);

    if (msg && !msg.deleted) {
        msg.delete({ timeout: 10000 }).catch(console.error);
    }

}
