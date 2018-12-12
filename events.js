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

  //Eliminar mensajes
  if (commandHandlerCheck && args[1] === "del") {  //miramos si el comando es "del"
    console.log("Se procede a eliminar las lineas");
    if (message.member.roles.find("name","VBoss") || message.member.roles.find("name","TeamZ")) {
      let num = parseInt(args[2]);
      if (isNaN(num) || num > 10 || num < 1) {
        const time = client.moment().format('MMMM Do YYYY, HH:mm:ss');
        const guild = message.guild ? `${message.guild.name} (${message.guild.id})` : `Private Message`
        console.log(`>>>> Command called [${time}]`);
        console.log(`   > Guild: ${guild}`);
        console.log(`   > User: ${message.author.tag} (${message.author.id})`);
        console.log(`   > Content: ${message.cleanContent}`);
        console.log("   > Comando inválido.");
        return;
      }

      message.channel.fetchMessages({limit:num})
      .then(message => {
        let messageArr = message.array();
        let messageCount = messageArr.length;

        for(let i = messageCount-1; i>=0; i--) {
          client.channels.find("name","historiaborrada").send("El usuario " + messageArr[i].author.username + " escribió:\n" + messageArr[i].cleanContent + "\n" + messageArr[i].createdAt);
          messageArr[i].delete()
          .catch(function(err) {
            console.log("Ha ocurrido un erro al eliminar las lineas");
            console.log(err);
          })
        }
      })
      .catch(function(err) {
        console.log("Ha ocurrido un error al recuperar los mensajes");
        console.log(err);
      })
    }
    return;
  }

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
