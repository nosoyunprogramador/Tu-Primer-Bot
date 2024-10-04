module.exports = {
    description: "Sirve para ver el ping del bot",
    permissions: ["Adminstrador"],
    owner: true,
    async execute(client, message, args, prefix){
        
        return message.reply(`\`${client.ws.ping}ms\``);
    }
}