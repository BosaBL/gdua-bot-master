const Discord = module.require("discord.js");

module.exports.run = async (bot, message, args) => {
  let Legionario = message.guild.roles.find(a => a.name === "Legionario");
  let Centurion = message.guild.roles.find(x => x.name === "Centurion");
  if(!message.member.roles.has(Legionario.id) || message.member.roles.has(Centurion.id)) return message.channel.send(`**${message.author} para poder escojer un color debes ser como mínimo debes ser <@&475702457033555968>, averigua en nuestra página <https://www.clangdua.com>**`).then(msg => msg.delete(10000) + msg.react(`👌`));

  let colors = message.guild.roles.filter(role => role.name.startsWith("#"));

  let str = args.join(" ");
  let role = colors.find(role => role.name.slice(1).toLowerCase() === str.toLowerCase());
  if(!role) return message.channel.send("ese color no existe").then(msg => msg.delete(5000));

  try {
    await message.member.removeRoles(colors);
    await message.member.addRoles(role);
    message.channel.send(`${message.author} ahora tienes el color ${role}`).then(msg => msg.delete(5000) + msg.react(`👌`)+ message.delete());
  } catch(e) {
      message.channel.send(`Error ${e.message}`);
  }
}
module.exports.help = {
  name: "color"
}
