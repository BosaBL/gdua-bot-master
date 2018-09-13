const Discord = module.require("discord.js");

module.exports.run = async (bot, message, args, prefix, duenoID) => {
  if(!message.author.id === duenoID) return;
  let colors = message.guild.roles.filter(role => role.name.startsWith("$"));
  if(colors.size < 1) return message.channel.send("No Hay colores").then(message.delete());
  let disponible = colors.array().join(" ");
  message.channel.send(`**Los colores disponibles son: ${disponible}**`);
}
module.exports.help = {
  name: "colores"
}
