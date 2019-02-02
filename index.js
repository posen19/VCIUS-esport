const Discord = require('discord.js');
const config = require('./config/config.json');
const tokens = require('./config/tokens.json');
const events = require('./events')
const moment = require('moment');
const { promisify } = require("util");
const readdir = promisify(require("fs").readdir);

process.on('unhandledRejection', error => {
  console.log('ERROR: ', error.message);
});

class DiscordBot extends Discord.Client {

  constructor() {

    super();
    this.config = config;
    this.tokens = tokens;
    this.moment = moment;

    this.login(this.tokens.bot);
    this.on('ready', () => {
      console.log("Discord Bot Online!");
      if (config.status && config.status.text && config.status.text.length > 1)
        this.user.setPresence({
          game: {
            name: config.status.text,
            url: config.status.url,
            type: config.status.style
          }
        })
    });

    events.initEvent(this);
  }
}

const client = new DiscordBot();


String.prototype.replaceAll = function(search, replacement) {
  var target = this;
  return target.split(search).join(replacement);
};
