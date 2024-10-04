module.exports = async (client, message) => {
    if(message.author.bot) return;
    if(!message.guild || !message.channel || !process.env.OWNER_IDS.includes(message.author.id)) return;
    if(!message.content.startsWith(process.env.PREFIX)) return;

    const args = message.content.slice(process.env.PREFIX.length).trim().split(/ +/);
    const cmd = args?.shift()?.toLowerCase();

    const command = client.commands.get(cmd) || client.commands.find(c => c.aliases && c.aliases.includes(cmd));

    if(command){
        if(command.owner){
            const dueños = process.env.OWNER_IDS;
            if(!dueños.includes(message.author.id))
            return message.reply("**Solo los dueños pueden ejecutar este comando.**");
        }

        if(command.bot_permissions){
            if(!message.guild.members.me.permissions.has(command.bot_permissions))
            return message.reply(`**Necesito estos permisos para ejecutarlo.**\n
                ${command.bot_permissions.map(permiso => `\`${permiso}\``)`.join(", ")`}`);
        }

        if(command.permissions){
            if(!message.member.permissions.has(command.permissions)) 
            return message.reply(`**Necesitas estos permisos para ejecutarlo.**\n
                ${command.permissions.map(permiso => `\`${permiso}\``)`.join(", ")`}`);
        }

        try {
            command.execute(client, message, args, process.env.PREFIX);
        } catch (e) {
            message.reply(`**Ha ocurrido un error al ejecutar el comando**\n${e}`);
            return;
        }
    }
}