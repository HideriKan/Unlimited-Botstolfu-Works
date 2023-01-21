// Discord Js require
const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
// Config
const { clientId, guildId, token, isBeta, tokenBeta, clientIdBeta, isGlobal } = require('./config.json'); // eslint-disable-line no-unused-vars

const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	commands.push(command.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(isBeta ? tokenBeta : isBeta ? tokenBeta : token);

(async () => {
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);
		let data;
		if (isGlobal) {
			data = await rest.put(
				Routes.applicationCommands(isBeta ? clientIdBeta : isBeta ? clientIdBeta : clientId),
				{ body: commands },
			);
		} else {
			data = await rest.put(
				Routes.applicationGuildCommands(isBeta ? clientIdBeta : isBeta ? clientIdBeta : clientId, guildId),
				{ body: commands },
			);

		}

		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
	} catch (error) {
		console.error(error);
	}
})();