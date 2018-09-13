module.exports.run = async (bot, message, args) => {
  
  if(!message.member.hasPermission("ADMINISTRATOR")) return;
  let tokick = message.mentions.user.first()

  message.guild.createChannel("vKick", 'voice');
  message.guild.channels.find(a => a.name === "vKick");
  message.channe.send(vKick.id)

}

module.exports.help = {
  name: "vkick"
}
