const { SlashCommandBuilder, BaseInteraction } = require('discord.js');
const PostAstolfo = require('../PostAstolfo');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('post')
		.setDescription('posts one random astolfo picture from danbooru'),

	/**
	 * 
	 * @param {BaseInteraction} interaction 
	 */
	async execute(interaction) {
		await interaction.deferReply();

		const post = new PostAstolfo(interaction.client);
		const embed = await post.getEmbed();

		await interaction.editReply({ embeds: [embed] });
	}
};