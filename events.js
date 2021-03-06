const moment = require('moment');
const Discord = require('discord.js');
const db = require('./db.js');

module.exports = {
  initEvent: function(discord){
    init(discord);
  }
}

async function messageHandler(message, client) {

  const adminRoles = ["V-Mod", "TeamZ"];
  const adminSection = ["TeamZ","V-Admin Brawl Stars","V-Streamer"];
  const rol = message.channel.guild.roles.find(role => adminRoles.includes(role.name));
  var auxaux = [];
  for (var i = 0; i < adminSection.length; i++){
     auxaux.push(message.channel.guild.roles.find(function(role){ if(role.name == adminSection[i]) {return role;}}));
  }
  const rolsAdmin = auxaux;
  if (message.author.id === client.user.id) return;
  const args = message.content.split(' ');
  let cmd;

  let commandHandlerCheck = client.config.prefixSeperated ? args[0].toLowerCase() === client.config.prefix.toLowerCase() : message.content.startsWith(client.config.prefix.toLowerCase())

  if (commandHandlerCheck) {
    //ver los coins
    if (args[1] === "coins" && args.length == 2 && message.channel.name == "bot-spam"){
      let res = await db.getVicios((message.author.tag.split('#'))[0], false);
      res = JSON.parse(res);
      message.channel.send("```"+(message.author.tag.split('#'))[0]+", ahora mismo tienes "+res.VCIOS+" coins.```");
    }
    //Eliminar mensajes
    else if (args[1] === "del" && args[2] > 1 && args[2] <= 30 && rol.comparePositionTo(message.member.highestRole)<=0) {
      eliminarMensajes(args, message, client);
    }
    //dar vicios
    else if(args[1] === "gc" && args.length == 4 && isNaN(args[2]) && !isNaN(args[3]) && rol.comparePositionTo(message.member.highestRole) <= 0 && message.channel.name == "bot-spam-admin"){
      if(args[2].startsWith("\"")){
        var x = "";
        for(var i=2; i<args.length; i++){
          x += args[i];
          if(args[i].endsWith("\"")){
            indice = i;
            break;
          }
          x += " ";
        }
        if(!x.startsWith("\"") || !x.endsWith("\"")){
          return;
        }
        args[2] = x.substring(1,x.length-1);
        if(indice+1 >= args.length){
          return;
        }
      }
      args[3] = args[args.length-1];
      if(isNaN(args[3])) return;
      db.actuActividad(args[2], args[3], 1);
    }
    //dar rol
    else if((((args[1] === "gr" || args[1] === "rr")  && args.length >= 4 && isNaN(args[2]) && isNaN(args[3])) || (args[1] === "hr" && args.length == 2)) && await rolsAdmin.find(function(rolAdmin){if(rolAdmin.comparePositionTo(message.member.highestRole)<=0) return true;}) && message.channel.name == "bot-spam-admin"){
      var roless = await message.member.roles.array();
      var user = null, rolemem = null, indice = 0;
      if(args.length != 2){
        if(args[2].startsWith("\"")){
          var x = "";
          for(var i=2; i<args.length; i++){
            x += args[i];
            if(args[i].endsWith("\"")){
              indice = i;
              break;
            }
            x += " ";
          }
          if(!x.startsWith("\"") || !x.endsWith("\"")){
            return;
          }
          args[2] = x.substring(1,x.length-1);
          if(indice+1 >= args.length){
            return;
          }
        }
        if(args[indice+1].startsWith("\"")){
          var x = "";
          for(var i=indice+1; i<args.length; i++){
            x += args[i]
            if(args[i].endsWith("\"")){
              break;
            }
            x += " ";
          }
          if(!x.startsWith("\"") || !x.endsWith("\"")){
            return;
          }
          args[3] = x.substring(1,x.length-1);
        }
        rolemem = await message.channel.guild.roles.find(function(role){if(role.name.toLowerCase()===args[3].toLowerCase()){ return role }});
        user = await message.channel.guild.members.find(function(usuario){if(usuario.user.username.toLowerCase()===args[2].toLowerCase()){ return usuario }});
      }
      var roles2 = [];
      for (var i = 0; i<roless.length; i++){
        await roles2.push(roless[i].name);
      }
      var aux = await db.getRolesDedic(roles2);
      aux = await JSON.parse(aux);
      roles = [];
      for(var i=0;i<aux.arr.length;i++){
        roles.push(aux.arr[i].rolName);
      }
      if (args[1] === "hr"){
        if(roles.length > 0){
          var mensaje = "```"+message.member.user.username+", estos son los roles que puedes otorgar o revocar:\n";
          for(var i = 0; i<await roles.length; i++){
            mensaje += "· "+roles[i]+"\n";
          }
          mensaje += "```";
          message.channel.send(mensaje);
        }
        else {
          message.channel.send("```"+message.member.user.username+", no puedes otorgar ni revocar permisos.```");
        }
      }
      else if (rolemem && roles.includes(rolemem.name))
      {
          if(args[1] === "gr")
            await user.addRole(rolemem.id, message.member.user.username + " ha dado el rol "+rolemem.name+" a "+user.user.username+".").catch(console.error);
          else
            await user.removeRole(rolemem.id, message.member.user.username + " ha quitado el rol "+rolemem.name+" a "+user.user.username+".").catch(console.error);
      }
      else {
        await message.channel.send("```No tienes los permisos necesarios para dar el rol '"+rolemem.name+"' a '"+user.user.username+"'.```");
      }
    }
    //Random message
    else if (args[1] === "random" && !isNaN(args[2]) && args.length == 3 && message.channel.name == "bot-spam") {
      message.channel.send("```Ha salido el número " + (Math.floor(Math.random() * parseInt(args[2])) + 1) + "```");
    }
    //Random game
    else if (args[1] === "rg" && args.length >= 3 && message.channel.name == "bot-spam") {
      message.channel.send("```Ha salido: " + args[(Math.floor(Math.random() * (args.length-2)) + 1 + 1)] + "```");
    }
    //Juego de azar - DIG
    else if (args[1] === "dig" && args.length == 3 && !isNaN(args[2]) && message.channel.name == "bot-spam") {
      let rec = await dig((message.author.tag.split('#'))[0], args[2]);
      if (rec != null){
        let aux = rec.toString().split(' ');
        if (isNaN(aux[0]))
          message.channel.send("```Ups, "+(message.author.tag.split('#'))[0]+"!\n"+ rec +"```");
        if (aux[0] > 0)
          message.channel.send("```Felicidades "+(message.author.tag.split('#'))[0]+", ha salido el número "+aux[1]+"!\nHas ganado "+ aux[0] +" coins.```");
        else if (aux[0] < 0)
          message.channel.send("```Lo siento "+(message.author.tag.split('#'))[0]+",  ha salido el número "+aux[1]+"!\nHas perdido "+ Math.abs(aux[0]) +" coins.```");
        }
    }
    //Comando de ayuda
    else if(args[1] === "help"){
      var ok = false;
      var embed = new Discord.RichEmbed()
        .setAuthor(client.user.username,client.user.avatarURL)
        .setColor("#11ee11")
        .setThumbnail("https://cdn.discordapp.com/attachments/265882663376650240/497890173749821453/unknown.png")
        .setTitle(`**Lista de comandos.** (Solo se pueden usar en bot-spam)`)
        .setDescription("Tienes el rol '"+ message.member.highestRole.name +"' y estos son los comandos que puedes utilizar:")
        .addField("**!v coins**","Saber el número de vicios que tienes.\n")
        .addField("**!v dig [coins apostados]** (Solo funciona en el canal -Digging-)","Si sale el número 10,20,30,40,50,60,70,80,90 o 100 ganas 3 veces los coins apostados.\nSi sale el número 69 ganas 10 VECES los coins apostados.\nConsigue coins siendo activo en el servidor de discord.\n")
        .addField("**!v rg [juego1] [juego2] [juego3] ...** (los juegos introducidos se separan por espacio)","Te devuelve de forma aleatoria uno de los juegos introducidos, ideal para cuando quieres jugar a algo y no sabes a qué.\n")
        .addField("**!v random [núm máx]**", "Te sale un número aleatorio entre 1 y el número que has introducido.\n");
      if (rol.comparePositionTo(message.member.highestRole) <= 0)
      {
        embed.addField("**!v del [núm. a eliminar]** (El número debe ser entre 1 y 10)", "Elimina los x últimos mensajes. Siendo x el número introducido.")
          .addField("**!v gc \"usuario\" [coins]**", "Da al usuario especificado los coins que has introducido. (puede ser valores negativos)")
          .addField("**!v gr \"usuario\" \"rol\"**", "Dar el rol especificado al usuario introducido si se tiene privilegios suficientes.")
          .addField("**!v rr \"usuario\" \"rol\"**", "Quita el rol especificado al usurio introducido si se tiene privilegios suficientes.")
          .addField("**!v hr**", "Lista de roles que puedes dar/quitar.");
      }
      else if (rolsAdmin.find(function(element){ return element.name == message.member.highestRole.name }))
      {
        embed.addField("**!v gr \"usuario\" \"rol\"**", "Dar el rol especificado al usuario introducido si se tiene privilegios suficientes.")
          .addField("**!v rr \"usuario\" \"rol\"**", "Quita el rol especificado al usurio introducido si se tiene privilegios suficientes.")
          .addField("**!v hr**", "Lista de roles que puedes dar/quitar.");
      }

      message.author.send({embed});
    }
    else{
      message.channel.send("```El comando introducido es incorrecto.\nUtiliza el comando **!v help** para ver los comandos que puedes usar.```")
    }

    const time = client.moment().format('MMMM Do YYYY, HH:mm:ss');
    const guild = message.guild ? `${message.guild.name} (${message.guild.id})` : `Private Message`
    console.log(`>>>> Command called [${time}]`);
    console.log(`   > Guild: ${guild}`);
    console.log(`   > User: ${message.author.tag} (${message.author.id})`);
    console.log(`   > Content: ${message.cleanContent}`);
  }

  if (message.channel.name === "Digging") return;
  db.actuActividad(message.author.tag.split('#')[0], 5, 2);
}

function eliminarMensajes(args, message, client){
  console.log("Se procede a eliminar las lineas");
  let num = parseInt(args[2]);

  message.channel.fetchMessages({limit:num})
  .then(message => {
    let messageArr = message.array();
    let messageCount = messageArr.length;

    for(let i = messageCount-1; i>=0; i--) {
      messageArr[i].guild.channels.find("name","historiaborrada").send("El usuario " + messageArr[i].author.username + " escribió:\n" + messageArr[i].cleanContent + "\n" + messageArr[i].createdAt);
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
  return;
}

async function dig(username, vicios){
  var res;
  res = await db.getVicios(username, false);
  res = JSON.parse(res/*.toString().substr(1, res.length -2)*/);
  if(res.VCIOS>=vicios){
    numrand = Math.floor(Math.random() * 100) + 1;
    if(numrand==10 || numrand==20 || numrand==30 || numrand==40 || numrand==50 || numrand==60 || numrand==70 || numrand==80 || numrand==90 || numrand==100){
      vicios *= 3;
    }
    else if (numrand == 69) {
      vicios *= 10;
    }
    else {
      vicios -= vicios*2;
    }
    db.updateVicios(username, vicios);
    return await vicios+" "+numrand;
  }
  else{
    return await "No tienes suficientes monedas.";
  }
}

//Evento del mensaje
var init = function (discord) {
  db.connect(discord.config);
  //Evento escribir un mensaje para el bot
  discord.on('message', msg => messageHandler(msg, discord));
  //Evento nuevo usuario
  discord.on("guildMemberAdd", (member) => {
    //Poner el Rol por defecto.
    var role = member.guild.roles.find('name','V-Viewer');
    console.log(role);
    if (role != null){
      member.addRole(role.id)
      .then(console.log)
      .catch(console.error);
    }
    //Mensaje de bienvenida.
    console.log(`"${member.user.username}" se ha unido a esta nuestra granja.` );
    var embed = new Discord.RichEmbed()
      .setAuthor(discord.user.username,discord.user.avatarURL)
      .setColor("#11ee11")
      .setThumbnail("https://cdn.discordapp.com/attachments/265882663376650240/497890173749821453/unknown.png")
      .setTitle(`**Bienvenido al Discord de VCius eSports, "${member.user.username}"!**`)
      .setDescription("Yo soy Vbot y estoy aqui para servirte y ayudarte a que te vicies con toda seguridad en esta comunidad.")
      .addField("No olvides seguir a nuestros influencers favoritos:\n **__FabioWolfen__**","· [Twitch](https://www.twitch.tv/fabiowolfen)\n· [Twitter](https://twitter.com/MrFabioWolfen)\n")
      .addField("**__ColicDusti__**","· [Twitch](https://www.twitch.tv/colicdusti)\n")
      .setDescription("Habrá sorteos mensuales, estate atento a los directos.")
      .addField("__Comandos VCIUS__","Tienes a tu disposición el comando **!v help** para ver los comandos disponibles")
      .addField("En caso de duda, puedes contactar directamente con cualquier VBoss que esté en linea!","Esperamos que te diviertas! :)")
      .addField("**Atentamente,**","**VCius eSports Staff**");

    member.user.send({embed});
  });
}
