module.exports = async (client, interaction) => {
    if(!interaction.guild || !interaction.channel) return;
  
    const command = client.slashCommands.get(interaction?.commandName);
  
    if(command){
        if(command.owner){
            const dueños = process.env.OWNER_IDS;
            if(!dueños.includes(interaction.user.id)) 
            return interaction.reply({content: "**Solo los dueños pueden ejecutar este comando.**", ephemeral: true})
        }
  
        if(command.bot_permissions){
            if(!interaction.guild.members.me.permissions.has(command.bot_permissions)) 
            return interaction.reply(`**Necesito estos permisos para ejecutarlo.**\n
                ${command.bot_permissions.map(permiso => `\`${permiso}\``)`.join(", ")`}`)
        }
  
        if(command.permissions){
            if(!interaction.member.permissions.has(command.permissions)) 
            return interaction.reply(`**Necesitas estos permisos para ejecutarlo.**\n
                ${command.permissions.map(permiso => `\`${permiso}\``)`.join(", ")`}`)
        }
  
        try {
            command.execute(client, interaction, "/");
        } catch (e) {
            interaction.reply(`**Ha ocurrido un error al ejecutar el comando**\n${e}`);
            return;
        }
    }
  }