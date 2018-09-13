const queue = new Map();
const ytdl = require('ytdl-core');
const YouTube = require('simple-youtube-api');
const youtube = new YouTube('AIzaSyDzeSIdL7qt5FToNUnbnPKrI8dPAm9aEN8');

module.exports.run = async (bot, message, args) => {
    var searchString = args.slice(1).join(' ');
	var url = args[1] ? args[1].replace(/<(.+)>/g, '$1') : '';
	var serverQueue = queue.get(message.guild.id);
    switch (args[0].toLowerCase()) {
      case "mplay", "p":
    var voiceChannel = message.member.voiceChannel;
		if (!voiceChannel) return message.channel.send('**Necesitas estar un canal de voz para esuchar música.**').then(message.delete());
		var permissions = voiceChannel.permissionsFor(message.client.user);
		if (!permissions.has('CONNECT')) {
			return message.channel.send('**No tengo permisos para conectarme a ese canal**').then(message.delete());
		}
		if (!permissions.has('SPEAK')) {
			return message.channel.send('**No tengo permisos para reproducir música en ese canal.**').then(message.delete());
		}
      if (url.match(/^https?:\/\/(www.youtube.com|youtube.com)\/playlist(.*)$/)) {
			var playlist = await youtube.getPlaylist(url);
			var videos = await playlist.getVideos();
			for (const video of Object.values(videos)) {
				var video2 = await youtube.getVideoByID(video.id); // eslint-disable-line no-await-in-loop
				await handleVideo(video2, message, voiceChannel, true); // eslint-disable-line no-await-in-loop
			}
			return message.channel.send(`**✅Lista de reproducción añadida a la cola ➤** *${playlist.title}*`).then(message.delete());
		} else {
			try {
				var video = await youtube.getVideo(url);
			} catch (error) {
				try {
					var videos = await youtube.searchVideos(searchString, 15);
					var index = 0;
					message.channel.send( {
                        embed: {
                            title:`      __**Lista de canciones**__`,
                            description: `${videos.map(video2 => `**│ ${++index} ➤** \`${video2.title}\``).join('\n')}
                                         **Selecciona una cancion entre 1 y 15**`
                        }
                    }).then(msg => msg.delete(10000) + message.delete())
					try {
						var response = await message.channel.awaitMessages(message2 => message2.content > 0 && message2.content < 16, {
							maxMatches: 1,
							time: 10000,
							errors: ['time']
						});
					} catch (err) {
						console.error(err);
						return message.channel.send('***Ninguna opción válida seleccionada, cancelando selección***');
					}
					var videoIndex = parseInt(response.first().content);
					var video = await youtube.getVideoByID(videos[videoIndex - 1].id);
				} catch (err) {
					console.error(err);
					return message.channel.send('**Error 🆘 no puedo conseguir resultados**');
				}
      }
			return handleVideo(video, message, voiceChannel);
		}
        break;
      case "mskip", "skip":
		if (!message.member.voiceChannel) return message.channel.send('No estás en un canal de voz.').then(message.delete());
		if (!serverQueue) return message.channel.send('No hay cola de canciones.').then(message.delete());
		serverQueue.connection.dispatcher.end('Canción saltada.');
		return undefined;
        break;
      case "mstop", "stop":
		if (!message.member.voiceChannel) return message.channel.send('No estás en un canal de voz.').then(message.delete());
		if (!serverQueue) return message.channel.send('No hay nada reproduciendose').then(message.delete());
		serverQueue.songs = [];
		serverQueue.connection.dispatcher.end('Cancion detenida.');
		return undefined;
break;
      case "mvolume", "volumen":
		if (!message.member.voiceChannel) return message.channel.send('No estás en un canal de voz.').then(message.delete());
		if (!serverQueue) return message.channel.send('No se está reproduciendo nada').then(message.delete());
		if (!args[1]) return message.channel.send(`**El volumen actual es de ${serverQueue.volume}%**`).then(message.delete());
    if (args[1] > 100) return message.channel.send('**El volumen máximo es 100%**').then(message.delete())
		serverQueue.volume = args[1];
		serverQueue.connection.dispatcher.setVolumeLogarithmic(args[1]/100);
		return message.channel.send(`**Volumen cambiado a ${args[1]}%**`).then(message.delete());
break;
      case "reproduciendo":
		if (!serverQueue) return message.channel.send('No hay nada reproduciendose'.then(message.delete()));
		return message.channel.send(`__**🎶Reproduciendo🎶**__ ➤ *${serverQueue.songs[0].title}*`).then(message.delete());
break;
      case "mqueue", "cola":
		if (!serverQueue) return message.channel.send('No hay nada reproduciendose.').then(message.delete());
		return message.channel.send(`
__**Cola:**__
${serverQueue.songs.map(song => `**♪** *${song.title}* ▐ **Pedida por:** ${song.requester}`).join('\n')}`).then(message.delete());
break;
      case "pausa":
		if (serverQueue && serverQueue.playing) {
			serverQueue.playing = false;
			serverQueue.connection.dispatcher.pause();
			return message.channel.send({
                embed: {
                    title: `⏸Musica pausada⏸`,
                    description:`*pausada por: ${message.author.tag}*`
                }
            }).then(message.delete());
		}
		return message.channel.send('No se esta reproduciendo ninguna canción.').then(message.delete());
break;
      case "resume":
		if (serverQueue && !serverQueue.playing) {
			serverQueue.playing = true;
			serverQueue.connection.dispatcher.resume();
			return message.channel.send(' ▶ Musica resumida ▶ ').then(message.delete());
		}
		return message.channel.send('No se esta reproduciendo ninguna canción.'.then(message.delete()));


	return undefined;
break;
}
async function handleVideo(video, message, voiceChannel, playlist = false) {
	var serverQueue = queue.get(message.guild.id);
	console.log(video);
	var song = {
		id: video.id,
    requester: message.author.tag,
		title: video.title,
		url: `https://www.youtube.com/watch?v=${video.id}`
	};
	if (!serverQueue) {
		var queueConstruct = {
			textChannel: message.channel,
			voiceChannel: voiceChannel,
			connection: null,
			songs: [],
			volume: 50,
			playing: true
		};
		queue.set(message.guild.id, queueConstruct);

		queueConstruct.songs.push(song);

		try {
			var connection = await voiceChannel.join();
			queueConstruct.connection = connection;
			play(message.guild, queueConstruct.songs[0]);
		} catch (error) {
			console.error(`Error, no puedo entrar en el canal. ${error}`);
			queue.delete(message.guild.id);
			return message.channel.send(`Error, no puedo entrar en el canal: ${error}`);
		}
	} else {
		serverQueue.songs.push(song);
		console.log(serverQueue.songs);
		if (playlist) return undefined;
		else return message.channel.send(`**✅Añadido a la cola✅ ➤** *${song.title}* ▐ **Pedida por:** ${song.requester}\n${song.url}`).then(message.delete());
	}
	return undefined;
}
  function play(guild, song) {
	var serverQueue = queue.get(guild.id);

	if (!song) {
		serverQueue.voiceChannel.leave();
		queue.delete(guild.id);
		return;
	}
	console.log(serverQueue.songs);

	const dispatcher = serverQueue.connection.playStream(ytdl(song.url))
		.on('end', reason => {
			if (reason === 'Stream is not generating quickly enough.') console.log('Song ended.');
			else console.log(reason);
			serverQueue.songs.shift();
			play(guild, serverQueue.songs[0]);
		})
		.on('error', error => console.error(error));
	dispatcher.setVolumeLogarithmic(serverQueue.volume / 100);

	serverQueue.textChannel.send(`**🎶Reproduciendo🎶 ➤** *${song.title}* ▐ **Pedida por:** ${song.requester}\n${song.url}`);
}
}

module.exports.help = {
    name: "m"
};
