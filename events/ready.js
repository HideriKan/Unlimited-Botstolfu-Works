const { Events } = require('discord.js');
const PostAstolfo = require('../PostAstolfo');

let loopPosting;

module.exports = {
	name: Events.ClientReady,
	once: true,
	execute(client) {
		console.log(`Ready! Logged in as ${client.user.tag}`);

		// loopPosting = new PostAstolfo();
		PostAstolfo.client = client;
		setTimeout(PostAstolfo.startLoop, PostAstolfo.getNextResetDateInMs());
	}
};