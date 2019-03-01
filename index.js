const Discord = require("discord.js");
const token = process.env.token;

const fs = require("fs");

const statuses = ['www.clangdua.com', 'Mundo Vs Mundo los Viernes', 'Misiones los Sábados', 'Con música O.o']
const prefix = "b.";
const bprefix = ".";
const duenoID = process.env.dueno;

const bot = new Discord.Client()

bot.commands = new Discord.Collection();

function loadcmds () {
fs.readdir("./comandos/", (err, files) =>{
  if(err) console.console.error();(err);

  let jsfiles = files.filter(f => f.split(".").pop() === "js");
  if(jsfiles.length <= 0) {
    console.log("Aún no has cargado comandos");
    return;
  }

  console.log(`Cargando ${jsfiles.length} archivos de comando.`);

  jsfiles.forEach((f, i) => {
		delete require.cache[require.resolve(`./comandos/${f}`)];
    let props = require(`./comandos/${f}`);
    console.log(`${i + 1}: ${f} cargado`);
    bot.commands.set(props.help.name, props);
  });
});
}

loadcmds()

bot.on("ready", async () => {
  console.log(bot.commands);
    let invitelink = await bot.generateInvite(["ADMINISTRATOR"]);
		console.log(invitelink);
		console.log(`
╔═══╗╔═══╗╔╗─╔╗╔═══╗     ╔╗──╔╗─╔╗─
║╔═╗║╚╗╔╗║║║─║║║╔═╗║     ║╚╗╔╝║╔╝║─
║║─╚╝─║║║║║║─║║║║─║║     ╚╗║║╔╝╚╗║─
║║╔═╗─║║║║║║─║║║╚═╝║     ─║╚╝║──║║─
║╚╩═║╔╝╚╝║║╚═╝║║╔═╗║     ─╚╗╔╝─╔╝╚╗
╚═══╝╚═══╝╚═══╝╚╝─╚╝     ──╚╝──╚══╝
  `);
  bot.users.get(duenoID).send(`
╔═══╗╔═══╗╔╗─╔╗╔═══╗     ╔╗──╔╗─╔╗─
║╔═╗║╚╗╔╗║║║─║║║╔═╗║     ║╚╗╔╝║╔╝║─
║║─╚╝─║║║║║║─║║║║─║║     ╚╗║║╔╝╚╗║─
║║╔═╗─║║║║║║─║║║╚═╝║     ─║╚╝║──║║─
║╚╩═║╔╝╚╝║║╚═╝║║╔═╗║     ─╚╗╔╝─╔╝╚╗
╚═══╝╚═══╝╚═══╝╚╝─╚╝     ──╚╝──╚══╝
Arranque sin problemas! 
    `);
});
///////////////////////////////////////////////////////////////////////
bot.on("message", async message => {
  if(message.type === "PINS_ADD") message.delete();
  if(message.author.bot) return;
  if(message.DMChannel) return;

  let messageArray = message.content.split(" ");
  let command = messageArray[0];
  let args = messageArray.slice(1);

  if(!message.content.startsWith(bprefix)) return;
  if(!message.author.id === duenoID) return;

  let cmd = bot.commands.get(command.slice(bprefix.length));
	if(cmd) cmd.run(bot, message, args, duenoID)
	
	if(message.content.toLowerCase() === `${bprefix}reload`) return message.channel.send(
			{embed:{
				title: '**Comandos recargados**'
		}}).then(msg => msg.delete(3000) + loadcmds() + message.delete());

});
////////////////////////////////////////////////////////////////////////
bot.on("message", async message =>{
  if(message.channel.id === "481634083466641408") {
    if(!message.author.bot) {
      if(!message.content.startsWith("!")) return message.channel.send(`${message.author} en este canal solamente puedes usar el comando \`!consulta\` para revisar tus puntos y/o tu nivel actual.`).then(msg => msg.delete(10000) + message.delete())
    }
  }
})
////////////////////////////////////////////////////////////////////////
bot.on('voiceStateUpdate', (oldMember, newMember) => {
  let newUserChannel = newMember.voiceChannel
  let oldUserChannel = oldMember.voiceChannel
  let channel = bot.channels.get('490798674654396427')

  if(oldUserChannel === undefined && newUserChannel !== undefined) {
    channel.send(`${newMember.displayName} ha entrado al canal \`${newUserChannel.name}\``)
  } else if(newUserChannel === undefined){ 
    channel.send(`${oldMember.displayName} ha abandonado el canal \`${oldUserChannel.name}\``)
  }
});

bot.on("ready", () => {
  setInterval(function() {
    let status = Math.floor(Math.random()*(statuses.length));
    bot.user.setActivity(statuses[status], {type: "PLAYING"});
  }, 10000)
});
//////////////////////////////////////////////////////////////////////////////////////////
bot.on('guildMemberAdd', member => {
  let channel = bot.channels.get('490798674654396427');
  let embed = new Discord.RichEmbed()
    .setColor(0x0000FF)
    .setTitle(`**\`${member.displayName}\`** se ha unido a el servidor.`)
    .setTimestamp()
    return channel.send(embed);
});

bot.on('guildMemberRemove', member => {
  let channel = bot.channels.get('490798674654396427');
  let embed = new Discord.RichEmbed()
    .setColor(0xFF0000)
    .setTitle(`**\`${member.displayName}\`** Ha dejado el servidor`)
    .setTimestamp()
    return channel.send(embed);
});
////////////////////////////////////////////////////////////////////////////////////////////
bot.on('messageDelete', async message => {
  let logs = await message.guild.fetchAuditLogs(['MESSAGE_DELETE']);
  let entry = logs.entries.first()
  if(entry.executor.bot) return;
  if(message.author.bot) return;
    let embed = new Discord.RichEmbed()
    .setTitle("**__Mensaje eliminado__**")
    .setColor("#ff0000")
    .addField("*Autor*", message.author.tag, true)
    .addField("*Canal*", message.channel, true)
    .addField("*Mensaje*", message.content)
    .addField("*Lo eliminó*", entry.executor)
    .addField("*Fecha*", new Date())
  let channel = message.guild.channels.find(x => x.name === "bot");
  channel.send({embed})
});
////////////////////////////////////////////////////////////////////////////////////////////



bot.login(token);
