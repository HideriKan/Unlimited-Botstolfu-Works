const fs = require('fs');
const { token } = require('./config.json');
const Discord = require('discord.js');
const { RichEmbed } = require('discord.js');
const rp = require('request-promise');
const cheerio = require('cheerio');

const client = new Discord.Client();
const channelsToSend = ['296984061287596032' /*,'146493901803487233'*/];
const prefix = '--';
const host = 'http://unlimitedastolfo.works';
const options = {
	uri: `${host}/random_image/view`,
	transform: function (body) {
		return cheerio.load(body);
	}
};
const filename = './log' + getDateStamp() + 'T' + getTimeStamp() + '.txt';

let isNotTimerSet = true;
let cou = 1; // retry counter

/**
 * @returns yyyymmdd UTC Timestamp
 */
function getDateStamp() {
	const now = new Date();
	return `${now.getUTCFullYear()}${now.getUTCMonth()}${now.getUTCDate()}`;
}

/**
 * @returns hhmmss UTC Timestamp
 */
function getTimeStamp(spacer = '') {
	const now = new Date();
	return `${now.getUTCHours()}${spacer}${now.getUTCMinutes()}${spacer}${now.getUTCSeconds()}`;
}

function log(...msgArr) {
	msgArr.forEach(msg => {
		msg = getTimeStamp(':') + ' - ' + msg;
		fs.appendFileSync(filename , msg+ '\n');
		console.log(msg);
	});
}

function getNextResetDateInMs() {
	let resetHour = 22;
	let now = new Date();
	let nowUTC = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds());
	let nextDate = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), resetHour, 0, 0, 0);
	let timeleft = nextDate - nowUTC;

	if (now.getUTCHours() >= resetHour) {
		nextDate.setDate(nowUTC.getUTCDate()+1);
		timeleft = nextDate - nowUTC;
	}

	log('next Date:'+nextDate, 'ms left:'+timeleft);

	return timeleft;
}

function getAstolfosButt(isTimed = true, msg = 0) {
	rp(options)
		.then(($) => {
			cou = 1;
			let temp = $('#main_image').attr('src').split('/');
			const emote = client.emojis.get('492762244304732165');
			const linkID = temp[3].replace(/%20/g,'').split('-');
			const astolfoLink = host + $('#main_image').attr('src').replace(/%20/g,'-');
			const embed = new RichEmbed()
				.setTitle(`${emote} Daily Astolfo ${emote}`)
				.setURL(host + '/post/view/' + linkID[0])
				.setImage(astolfoLink);

			channelsToSend.forEach(id => {
				client.channels.get(id).send(embed);
			});

			log('posted' ,astolfoLink);

			if (isTimed) setTimeout(getAstolfosButt, getNextResetDateInMs());
		})
		.catch((err) => {
			log(err, '\nretrying', cou);
			if (cou > 5 && !isTimed) {
				return msg.reply('Tried 5 times and Erroed');
			} else {
				getAstolfosButt();
				cou++;
			}
		});
}

client
	.on('ready', () => {
		log(`Logged in as ${client.user.tag}!`);

		if(isNotTimerSet) {
			setTimeout(getAstolfosButt, getNextResetDateInMs());
			// setTimeout(getAstolfosButt, getNextResetDateInMs());
			isNotTimerSet = false;
		}
	}).on('message', msg => {
		if(msg.content.startsWith(prefix + 'PostAstolfo')) getAstolfosButt(false, msg);
	}).on('error', console.error)
	.on('warn', console.warn)
	.on('degub', console.log)
	.on('disconnect', () => console.warn('Disconnected!'))
	.on('reconnecting', () => console.warn('Reconnecting...'));

client.login(token);