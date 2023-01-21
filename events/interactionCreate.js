const { Events, bold, codeBlock } = require('discord.js');
const { authorId, isBeta } = require('../config.json');

async function errorInform(interaction, error) {
	console.error(error);

	if (!isBeta) {
		let cmd;
		if (interaction.isButton())
			cmd = `Button ${interaction.customId}`;
		else if (interaction.isCommand())
			cmd = interaction.commandName;
		await interaction.client.users.send(authorId, { content: `Error: ${bold(error.message)}\nCommand: ${cmd}\nFrom: ${interaction.user}\nStack: ${codeBlock(error.stack)}` });
	}

	if (interaction.deferred && !interaction.replied)
		await interaction.editReply({ content: 'There was an error while executing this command!', ephemeral: true });
	else if (!interaction.replied)
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
}

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (!interaction.isChatInputCommand())
			return;

		const command = interaction.client.commands.get(interaction.commandName);

		if (!command)
			return;

		try {
			await command.execute(interaction);
		} catch (error) {
			errorInform(interaction, error);
		}

	}
};