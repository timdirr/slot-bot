const bot = require("./botv2.js");
const setup = require("./setup.json");
var Discord;
var green = 8313370;
var red = 12587561;
var blue = 1342712;

let changeMessage;
let linkFailedMessage;
let successfulChange;
let unsuccessfulChange;
let respondMessage;
let stopMessage;
let slotSent

exports.start = function(){
        Discord = bot.getDiscord()
        changeMessage = new Discord.RichEmbed().setColor(blue).setTitle(setup.change_message).setDescription(setup.change_message_2);
        helpMessage = new Discord.RichEmbed().setTitle(setup.help_message_1 + setup.prefix + setup.help_message_2).setColor(blue);
        linkFailedMessage = new Discord.RichEmbed().setColor(red).setTitle(setup.link_failed);
        successfulChange = new Discord.RichEmbed().setTitle(setup.successful_change).setColor(green);
        successfulDelete = new Discord.RichEmbed().setTitle(setup.delete).setColor(green);
        unsuccessfulChange = new Discord.RichEmbed().setTitle(setup.unsuccessful_change).setColor(red);
        respondMessage = new Discord.RichEmbed().setColor(blue).setDescription(setup.stop_info);
        stopMessage = new Discord.RichEmbed().setColor(red).setTitle(setup.stop_message + setup.prefix + "slot.");
        slotSent = new Discord.RichEmbed().setColor(green).setTitle(setup.finished_message);
        console.log(`Functions successful`);

}

exports.startRespond = async function(guild){
        respondMessage.setFooter(guild.name + " Slot Notifications", guild.iconURL);
        helpMessage.setFooter(guild.name + " Slot Notifications", guild.iconURL);
}

exports.respond = async function(step){
        let msg = bot.getMessage();
        switch(step){
                case "help":
                        msg.channel.send(helpMessage);
                        break;
                case "stop":
                        msg.channel.send(stopMessage);
                        break;
                case "channel":
                        respondMessage.setTitle(setup.channel_message).setColor(blue);
                        msg.channel.send(respondMessage);
                        break;
                case "role":
                        respondMessage.setTitle(setup.role_message).setColor(blue);
                        msg.channel.send(respondMessage);
                        break;
                case "channel_f":
                        respondMessage.setTitle(setup.channel_failed).setColor(red);
                        msg.channel.send(respondMessage);
                        break;
                case "role_f":
                        respondMessage.setTitle(setup.role_failed).setColor(red);
                        msg.channel.send(respondMessage);
                        break;
                case "header":
                        respondMessage.setTitle(setup.header_message).setColor(blue);
                        msg.channel.send(respondMessage);
                        break;
                case "form":
                        respondMessage.setTitle(setup.form_message).setColor(blue);
                        msg.channel.send(respondMessage);
                        break;
                case "fee":
                        respondMessage.setTitle(setup.fee_message).setColor(blue);
                        msg.channel.send(respondMessage);
                        break;
                case "retail":
                        respondMessage.setTitle(setup.retail_message).setColor(blue);
                        msg.channel.send(respondMessage);
                        break;
                case "date":
                        respondMessage.setTitle(setup.date_message).setColor(blue);
                        msg.channel.send(respondMessage);
                        break;
                case "resell":
                        respondMessage.setTitle(setup.resell_message).setColor(blue);
                        msg.channel.send(respondMessage);
                        break;
                case "droplist":
                        respondMessage.setTitle(setup.droplist_message).setColor(blue);
                        msg.channel.send(respondMessage);
                        break;
                case "image":
                        respondMessage.setTitle(setup.image_message).setColor(blue);
                        msg.channel.send(respondMessage);
                        break;
                case "sure":
                        respondMessage.setTitle(setup.sure_message).setColor(blue);
                        msg.channel.send(respondMessage);
                        break;
                case "change":
                        msg.channel.send(changeMessage);
                        break;
                case "sure_f":
                        respondMessage.setTitle(setup.failed_sure).setColor(red);
                        msg.channel.send(respondMessage);
                        break;
                case "link_f":
                        msg.channel.send(linkFailedMessage);
                        break;
                case "slot_msg":
                        msg.channel.send(bot.getSlotMessage());
                        break;
                case "successful":
                        msg.channel.send(successfulChange);
                        break;
                case "unsuccessful":
                        msg.channel.send(unsuccessfulChange);
                        break;
                case "finished":
                        msg.channel.send(slotSent);
                        break;
                case "delete":
                        msg.channel.send(successfulDelete);
                        break;
                case "delete_f":
                        respondMessage.setTitle(setup.failed_delete).setColor(red);
                        msg.channel.send(respondMessage);
                        break;

        }
}
