const Discord = module.require("discord.js");

module.exports.run = async (bot, message, args) => {
  if(!message.member.hasPermission("MANAGE_MESSAGES")) return;
  
  if(!args[0]) return message.channel.send("Error, necesito un cantidad.").then(msg => msg.delete(5000) + message.delete());
  if(args[0] > 100) return message.channel.send(`**${message.author} me limititaron a borrar solamente 100 mensajes ;(**`).then(msg => msg.delete(5000));
    message.delete()
    message.channel.bulkDelete(args[0]).then(() => {
      message.channel.send( 
        { embed:{
          title: '**Borrando mensajes**',
          description: `${args[0]} mensajes eliminados`
        }
      }).then(msg => msg.delete(5000) + msg.react("👌"));
    });
}
module.exports.help = {
  name: "del" || "delete"
}