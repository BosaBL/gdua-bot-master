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
// bot.on("message", async message => {
//     if(message.author.bot) return;
//     if(message.DMChannel) return;
//     if (!message.content.startsWith(prefix)) return;
//     let messageArray = message.content.split(" ");
//   	let command = messageArray[0];
//   	let args = messageArray.slice(1);

//     if (!message.member.roles.has('473829976924356618')) return message.author.send(`Para usar nuestro bot necesitas ser miembro de __***Guerreros de la Ultima Alianza***__, para más información visita https://www.clangdua.com`).then(message.delete());

// 		let cmd = bot.commands.get(command.slice(prefix.length));
// 		if(cmd) cmd.run(bot, message, args, dueñoID);
// });

bot.on("voiceStateUpdate", oldMember => {
  if(oldMember.voiceChannel) {
    bot.channels.get('490798674654396427').send(`${oldMember.displayName} ha abandonado el canal \`${oldMember.voiceChannel.name}\`\n  `)
  }
  });

bot.on("ready", () => {
  setInterval(function() {
    let status = Math.floor(Math.random()*(statuses.length));
    bot.user.setActivity(statuses[status], {type: "PLAYING"});
  }, 10000)
});

bot.login(token);
