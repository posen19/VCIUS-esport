const moment = require('moment');

module.exports = {
  initEvent: function(discord){
    init(discord);
  }
}

function messageHandler(message, client) {

  if (message.author.id === client.user.id) return;
  const args = message.content.split(' ');
  let cmd;

  let commandHandlerCheck = client.config.prefixSeperated ? args[0].toLowerCase() === client.config.prefix.toLowerCase() : message.content.startsWith(client.config.prefix.toLowerCase())
  if (commandHandlerCheck) {
    cmd = client.config.prefixSeperated ? args[1] : args[0].substring(client.config.prefix.length);

    let cc = client.config.commands.filter(c => c.command.toLowerCase() === cmd.toLowerCase())[0];
    if (cc) {
      // Parameters
      let msg = cc.response;
      msg = msg.replaceAll("${user}", message.author.toString());
      msg = msg.replaceAll("${userAvatar}", message.author.avatarURL);
      msg = msg.replaceAll("${channel}", message.channel.toString());
      msg = msg.replaceAll("${server}", message.guild.name);
      msg = msg.replaceAll("${serverIcon}", message.guild.iconURL);
      msg = msg.replaceAll("${onlineMembers}", message.guild.members.array().filter(i => i.presence.status === "online" || i.presence.status === "idle" || i.presence.status === "dnd").length);
      msg = msg.replaceAll("${totalMembers}", message.guild.memberCount);

      message.channel.send(msg);
    }

    const time = client.moment().format('MMMM Do YYYY, HH:mm:ss');
    const guild = message.guild ? `${message.guild.name} (${message.guild.id})` : `Private Message`
    console.log(`>>>> Command called [${time}]`);
    console.log(`   > Guild: ${guild}`);
    console.log(`   > User: ${message.author.tag} (${message.author.id})`);
    console.log(`   > Content: ${message.cleanContent}`);
  }
}

//Evento del mensaje
var init = function (discord) {
  //Evento escribir un mensaje para el bot
  discord.on('message', msg => messageHandler(msg, discord));
  //Evento nuevo usuario
  discord.on("guildMemberAdd", (member) => {
    //Poner el Rol por defecto.
    var role = member.guild.roles.find('name','VViewer');
    member.addRole(role.id)
    .then(console.log)
    .catch(console.error);

    //Mensaje de bienvenida.
    console.log(`"${member.user.username}" se ha unido a esta nuestra granja.` );
    member.user.send("Bienvenido al canal de VCIUS");
  });
}
