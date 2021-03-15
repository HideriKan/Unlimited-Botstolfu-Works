const {token, prefix, channelsToSend, authorID} = require('./config.json');
const {Client, MessageEmbed} = require('discord.js');
const client = new Client();

const fetch = require('node-fetch');
const host = 'https://danbooru.donmai.us/posts/';
const randomQuery = 'random.json?tags=astolfo_%28fate%29';

let isNotTimerSet = true;

/**
 * @returns when to post the next image in ms 
 */
function getNextResetDateInMs() {
	let resetHour = 12;
	let now = new Date();
	let nowUTC = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds());
	let nextDate = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), resetHour, 0, 0, 0);
	let timeleft = nextDate - nowUTC;

	if (now.getUTCHours() >= resetHour) {
		nextDate.setDate(nowUTC.getUTCDate() + 1);
		timeleft = nextDate - nowUTC;
	}

	console.log('next Date:' + nextDate, 'ms left:' + timeleft);

	return timeleft;
}

async function getAstolfosButt(isTimed = true, msg = 0) {
	const emote = client.emojis.resolve('492762244304732165');
	const json = await fetch(host + randomQuery)
		.then(res => res.json())
		.catch(err => console.error(err));

	const embed = new MessageEmbed()
		.setTitle(`${emote} Daily Astolfo ${emote}`)
		.setURL(host + json.id)
		.setImage(json.file_url)
		.setFooter('Score: ' + json.score)
		.setTimestamp(json.created_at);

	if (isTimed) {
		setTimeout(getAstolfosButt, getNextResetDateInMs());
		channelsToSend.forEach(id => {
			client.channels.get(id).send(embed);
		});
	} else {
		msg.channel.send(embed);
	}
	console.log('send ' + host + json.id);
}

client
	.on('ready', () => {
		console.log(`Logged in as ${client.user.tag}!`);

		if (isNotTimerSet) {
			setTimeout(getAstolfosButt, getNextResetDateInMs());
			isNotTimerSet = false;
		}
	}).on('message', msg => {
		try {
			if (msg.content.toLocaleLowerCase() === `${prefix}postastolfo`) getAstolfosButt(false, msg);
			if (msg.content.toLocaleLowerCase() === `${prefix}bye` && msg.author.id === authorID) process.exit();
		} catch (error) {
			console.error(error);
		}
	}).on('error', console.error)
	.on('warn', console.warn)
	.on('degub', console.log)
	.on('disconnect', () => console.warn('Disconnected!'))
	.on('reconnecting', () => console.warn('Reconnecting...'));
	
client.login(token);