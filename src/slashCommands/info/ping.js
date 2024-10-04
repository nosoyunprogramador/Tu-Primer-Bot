const { SlashCommandBuilder } = require('discord.js')

module.exports = {
    permissions: ["SendMessages"],
    owner: true,
    cmd: new SlashCommandBuilder()
    .setDescription("Sirve para ver el ping del bot"),

    async execute(client, interaction, prefix){
        await interaction.deferReply();

        const reply = await interaction.fetchReply();

        const ping = reply.createdTimestamp - interaction.createdTimestamp;

        return interaction.editReply(`**Pong!** \`Client: ${ping}ms | ${client.user.username}: ${client.ws.ping}ms\``);
    }
}