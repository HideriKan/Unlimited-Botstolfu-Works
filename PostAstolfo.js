const { EmbedBuilder } = require("discord.js");
const { channelsToSend } = require('./config.json');
const { request, fetch, Agent, RedirectHandler } = require('undici');

class PostAstolfo {
	constructor(client) {
		this.client = client; // prob not the way to do it but its my way
	}

	static host = 'https://danbooru.donmai.us/posts/';
	static randomQuery = 'random.json?tags=astolfo_%28fate%29';
	static isTimerSet = false;
	/**
	  * @returns when to post the next image in ms 
	  */
	getNextResetDateInMs() {
		let resetHourUTC = 12;
		let now = new Date();
		let nowUTC = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds());
		let nextDate = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), resetHourUTC, 0, 0, 0);
		let timeLeft = nextDate - nowUTC;

		if (now.getUTCHours() >= resetHourUTC) {
			nextDate.setDate(nowUTC.getUTCDate() + 1);
			timeLeft = nextDate - nowUTC;
		}

		console.log(`Next post in ${timeLeft}`);
		return timeLeft;
	}

	async getRandomPost() {
		const query = PostAstolfo.host + PostAstolfo.randomQuery;
		const res = await fetch(query, {
			dispatcher: new Agent({
				keepAliveTimeout: 10,
				keepAliveMaxTimeout: 10,
			})
		})

		const json = await res.json();

		return json;
	}

	async getEmbed() {
		const json = await this.getRandomPost();

		const emote = this.client.emojis.resolve('492762244304732165');
		const embed = new EmbedBuilder()
			.setTitle(`${emote} Daily Astolfo ${emote}`)
			.setURL(PostAstolfo.host + json.id)
			.setImage(json.file_url)
			.setFooter({ text: 'Score: ' + json.score })
			.setTimestamp(new Date(json.created_at));

		return embed;
	}

	async startLoop() {
		const embed = await this.getEmbed();

		setTimeout(this.startLoop, this.getNextResetDateInMs());
		channelsToSend.forEach(id => {
			this.client.channels.fetch(id)
				.then(ch =>
					ch.send({ embeds: [embed] })
						// .then(msg => console.log(`Send a ${g_host + json.id} into ${msg.channel}`))
						.catch(err => console.error(err))
				)
				.catch(err => console.error(err));
		});

	}

}

module.exports = PostAstolfo;