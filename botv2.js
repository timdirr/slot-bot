//----------------------------------------------------------------------------------------------
//  required stuff in order to run the bot
//----------------------------------------------------------------------------------------------
const Discord = require("discord.js");
const client = new Discord.Client();
const setup = require("./setup.json");
const fs = require('fs')

//----------------------------------------------------------------------------------------------
//  for status
//----------------------------------------------------------------------------------------------
var counter = 0;
var changer = 0;
var deleteCounter = true;
//----------------------------------------------------------------------------------------------
//  for perm managing 
//----------------------------------------------------------------------------------------------
var user_id;
var msg;
var ownerRole;

//----------------------------------------------------------------------------------------------
//  colors
//----------------------------------------------------------------------------------------------
var green =     8313370;
var red =       12587561;
var blue =      767487;
var grey =      3553599;
//----------------------------------------------------------------------------------------------
//  for data storage
//----------------------------------------------------------------------------------------------
var BMServer;
var list = {};
var config = {};
var slots = [];

//----------------------------------------------------------------------------------------------
//  messages
//----------------------------------------------------------------------------------------------
var changeMessage =             new Discord.RichEmbed().setColor(grey).setTitle(setup.change_message).setDescription(setup.change_message_2);
var helpMessage =               new Discord.RichEmbed().setTitle(setup.help_message_1 + setup.prefix + setup.help_message_2).setColor(grey);
var linkFailedMessage =         new Discord.RichEmbed().setColor(red).setTitle(setup.link_failed);
var successfulChange =          new Discord.RichEmbed().setTitle(setup.successful_change).setColor(green);
var successfulDelete =          new Discord.RichEmbed().setTitle(setup.delete).setColor(green);
var unsuccessfulChange =        new Discord.RichEmbed().setTitle(setup.unsuccessful_change).setColor(red);
var respondMessage =            new Discord.RichEmbed().setColor(grey).setDescription(setup.stop_info);
var stopMessage =               new Discord.RichEmbed().setColor(red).setTitle(setup.stop_message + setup.prefix + "slot.");
var slotSent =                  new Discord.RichEmbed().setColor(green).setTitle(setup.finished_message);
var impossibleDeleteMSG =       new Discord.RichEmbed().setColor(grey).setTitle("No Live Slots").setDescription(setup.impossible_delete + setup.prefix + "slot.");

//----------------------------------------------------------------------------------------------
//  slot class
//----------------------------------------------------------------------------------------------
class liveSlot {
        constructor(slotHeader, slotForm, slotFee) {
                this.slotHeader = slotHeader;
                this.slotForm = slotForm;
                this.slotFee = slotFee;
        }
}

//----------------------------------------------------------------------------------------------
//  sends response message
//----------------------------------------------------------------------------------------------
async function respond(msg, step){
        respondMessage.setFooter(msg.guild.name + " Slot Notifications", msg.guild.iconURL);
        helpMessage.setFooter(msg.guild.name + " Slot Notifications", msg.guild.iconURL);
        impossibleDeleteMSG.setFooter(msg.guild.name + " Slot Notifications", msg.guild.iconURL);
        switch(step){
                case "help":
                        msg.channel.send(helpMessage);
                        break;
                case "stop":
                        msg.channel.send(stopMessage);
                        break;
                case "channel":
                        respondMessage.setTitle(setup.channel_message).setColor(grey);
                        msg.channel.send(respondMessage);
                        break;
                case "role":
                        respondMessage.setTitle(setup.role_message).setColor(grey);
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
                        respondMessage.setTitle(setup.header_message).setColor(grey);
                        msg.channel.send(respondMessage);
                        break;
                case "form":
                        respondMessage.setTitle(setup.form_message).setColor(grey);
                        msg.channel.send(respondMessage);
                        break;
                case "fee":
                        respondMessage.setTitle(setup.fee_message).setColor(grey);
                        msg.channel.send(respondMessage);
                        break;
                case "retail":
                        respondMessage.setTitle(setup.retail_message).setColor(grey);
                        msg.channel.send(respondMessage);
                        break;
                case "date":
                        respondMessage.setTitle(setup.date_message).setColor(grey);
                        msg.channel.send(respondMessage);
                        break;
                case "resell":
                        respondMessage.setTitle(setup.resell_message).setColor(grey);
                        msg.channel.send(respondMessage);
                        break;
                case "droplist":
                        respondMessage.setTitle(setup.droplist_message).setColor(grey);
                        msg.channel.send(respondMessage);
                        break;
                case "image":
                        respondMessage.setTitle(setup.image_message).setColor(grey);
                        msg.channel.send(respondMessage);
                        break;
                case "sure":
                        respondMessage.setTitle(setup.sure_message).setColor(grey);
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
                        msg.channel.send(slot_message);
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
                case "impossible_delete":
                        msg.channel.send(impossibleDeleteMSG);
                        break;

        }
}

//----------------------------------------------------------------------------------------------
//  pulls data from BotManager server
//----------------------------------------------------------------------------------------------
async function getData(server) {
        //get channel with server id
        channel = await BMServer.channels.find(n => n.name == server.id)
        //sleep
        await new Promise(resolve => setTimeout(resolve, 100));
        //get last message
        await channel.fetchMessages({limit: 1}).then(async messages => {
                //extract last message
                lastMessage = await messages.get(channel.lastMessageID)
                //sleep
                await new Promise(resolve => setTimeout(resolve, 100));
                //get content of message
                data = await lastMessage.content;
                //trim ```
                data = await data.slice(3, data.length - 3);
                //remove zero
                if(data == "zero")
                        data = "";
                //pass to save
                await insertData(data, server);
        })
}

//----------------------------------------------------------------------------------------------
//  inserts pulled data into list
//----------------------------------------------------------------------------------------------
async function insertData(data, server) {
        //split into individual slots
        slots = data.split("%next%");
        //trim
        for (var i = 0; i < slots.length; ++i) {
                slots[i] = slots[i].trim();
        }
        //create temporary field
        let save = [];
        for (var i = 0; i < slots.length - 1; ++i) {
                //split each slot into data components
                var slot = slots[i].split("##");
                //and pass components as class liveSlot
                await save.push(new liveSlot(slot[0], slot[1], slot[2]));
        }
        //save in according server data
        list[server.id] = save;
}

//----------------------------------------------------------------------------------------------
//  sends all the currently live slots
//----------------------------------------------------------------------------------------------
async function sendLive(server, time){
        //get liveMessage
        let liveMessage = new Discord.RichEmbed().setColor(grey).setTitle("**Live slots**").setDescription("These are all of our currently live slots:\n_ _\n_ _").setFooter(server.name + " Slot Notifications", server.iconURL);
        let i;
        //check if there are live slots
        if(list[server.id].length == 0){
                await liveMessage.setDescription("Unfortunatly there are no live slots at the moment!")
        } else {
                //check if there is more then 1 slot (because of formating) -> add fields
                for (i = 0; i <  list[server.id].length - 1 ; ++i){
                        if(list[server.id][i].slotForm.toString().charAt(0) == '+')
                                await liveMessage.addField("\n\n" + list[server.id][i].slotHeader, "Fee: " + list[server.id][i].slotFee + "\nDm " + list[server.id][i].slotForm.slice(1) + "for more info\n_ _\n_ _");
                        else
                                await liveMessage.addField("\n\n" + list[server.id][i].slotHeader, "Fee: " + list[server.id][i].slotFee + "\n[Form](" + list[server.id][i].slotForm + ")\n_ _\n_ _", false);
                }
                if(list[server.id][i].slotForm.toString().charAt(0) == '+')
                        await liveMessage.addField("\n\n" + list[server.id][i].slotHeader, "Fee: " + list[server.id][i].slotFee + "\nDm " + list[server.id][i].slotForm.slice(1) + " for more info!\n_ _\n_ _");
                else
                        await liveMessage.addField("\n\n" + list[server.id][i].slotHeader, "Fee: " + list[server.id][i].slotFee + "\n[Form](" + list[server.id][i].slotForm + ")\n_ _\n_ _", false);
        }
        return liveMessage;
}

//----------------------------------------------------------------------------------------------
//  saves all live slots of a server by sending a discord messages
//----------------------------------------------------------------------------------------------
async function saveAll(server){
        let output = "";
        console.log(server.name + ": " + await list[server.id].length)
        //go through all live slots
        for (var i = 0; i < list[server.id].length; i++){
                //check for undefined (idk why tbh)
                if(list[server.id][i] != undefined){
                        output = output + list[server.id][i].slotHeader + "##" + list[server.id][i].slotForm + "##" + list[server.id][i].slotFee + "%next%";
                }
        }
        //if no live slots set as output as zero
        if(list[server.id].length == 0)
                output = "zero"
        output = "\`\`\`" + output + "\`\`\`"
        //send save message in according channel
        BMServer.channels.find(n => n.name == server.id).send(output);
}


//----------------------------------------------------------------------------------------------
//  deletes one of the currently live slots
//----------------------------------------------------------------------------------------------
async function deleteSlot(n, server){
        //checks if passed n is valid (not too high/low)
        if(0 < n <= list[server.id].length){
                //cut out slot at position n
                await list[server.id].splice(n, 1);
                //remove deleteID
                delete config[server.id]['deleteID'];
                config[server.id]['deleteCounter'] = true;
                await respond(message, "delete");
        } else
                //invalid response
                respond(message, "delete_f")
        //save everything
        saveAll(server);
        //sleep
        await new Promise(resolve => setTimeout(resolve, 2000));
        //then load everything
        getData(server);
}

//----------------------------------------------------------------------------------------------
//  sends slot notification
//----------------------------------------------------------------------------------------------
async function sendSlotMessage(author, clientChannel, messageChannel, server) {

        if(config[server]['dm'])
                await list[server.id].push(new liveSlot(header, formLink, saveFee));
        else
                await list[server.id].push(new liveSlot(header, "+" + `${author}` , saveFee));
        saveAll(server);

        await clientChannel.send(config[server.id]['slot_message']);
        if(config[server.id]['role_name'] == "none")                     { if(config[server]['dm']){ clientChannel.send(config[server]['dm']); }            }
        else if (config[server.id]['role_name'] == "everyone")           { clientChannel.send(config[server]['dm'] + " @everyone");                         }
        else if (config[server.id]['role_name'] == "here")               { clientChannel.send(config[server]['dm'] + "@here ");                             }
        else                                                             { clientChannel.send(config[server]['dm'] + ` ${role_name}`);                      }

        respond(message, "finished");
        resetSetup(server);
}

//----------------------------------------------------------------------------------------------
//  sends message that contains all slots for deletion
//----------------------------------------------------------------------------------------------
async function sendDelete(server){
        let deleteMessage = new Discord.RichEmbed().setColor(grey).setTitle("Which slot would you like to delete? Please respond with the according number.").setFooter(msg.guild.name + " Slot Notifications", msg.guild.iconURL);
        for (i = 1; i < list[server.id].length + 1; ++i){
                if(i == 1)
                        deleteMessage.addField("**1. " + list[server.id][i - 1].slotHeader + "**", "_ _", false);
                else
                        deleteMessage.addField("\n_ _\n**" + i + ". " + list[server.id][i - 1].slotHeader + "**", "_ _", false);
        }
        return deleteMessage;
}

//----------------------------------------------------------------------------------------------
//  checks if a link is valid
//----------------------------------------------------------------------------------------------
async function linkTest(link) {
        var link_number = 0;
        let testMessageLink = new Discord.RichEmbed().setColor(green).setTitle("link test");
        testMessageLink.setURL(link);
        await BMServer.channels.find(n => n.name == "link-test").send(testMessageLink).catch(err => {
                link_number = 1;
        });
        return link_number;
}

//----------------------------------------------------------------------------------------------
//  sets description of slot message (combines all data)
//----------------------------------------------------------------------------------------------
function textSet(server) {

        let text = config[server.id]['fee'];
        if (config[server.id]['retail'] != "none")                { text += config[server.id]['retail'];            }
        if (config[server.id]['release_date'] != "none")          { text += config[server.id]['release_date'];      }
        if (config[server.id]['resell_prediction'] != "none")     { text += config[server.id]['resell_prediction']; }
        if (config[server.id]['full_droplist'] != "none")         { text += config[server.id]['full_droplist'];     }

        config[server.id]['slot_message'].setDescription(text);
}

//----------------------------------------------------------------------------------------------
//  checks if a passed string is a number
//----------------------------------------------------------------------------------------------
function isPositiveInteger(s) {
        return /^\+?[1-9][\d]*$/.test(s);
}

//----------------------------------------------------------------------------------------------
//  resets config of a server to default
//----------------------------------------------------------------------------------------------
async function resetSetup(server){
        dCounter = config[server.id]['deleteCounter'];
        if(dCounter == false)
                dID = config[server.id]['deleteID'];
        delete config[server.id];
        config[server.id] = {
                'deleteCounter': dCounter,
                'counter' : 0,
                'changer' : 0
        }
        if(dCounter == false)
                config[server.id]['deleteID'] = dID;
}

//----------------------------------------------------------------------------------------------
//  triggered when bot joins a server, creates channel in BMServer + init list/config
//----------------------------------------------------------------------------------------------
client.on("guildCreate", async guild => {
        console.log("Joined a new server: " + guild.name + "\nServer Count: " + client.guilds.array().length);
        list[guild.id] = []
        await BMServer.createChannel(guild.id, "text");
        serverChannel = await BMServer.channels.find(c => c.name == guild.id);
        await serverChannel.setTopic("Server: " + guild.name)
        await serverChannel.send("\`\`\`zero\`\`\`");
        await serverChannel.setParent("577579576700436490");
        config[guild.id] = {'counter': 0, 'changer': 0, 'deleteCounter': true};
})

//----------------------------------------------------------------------------------------------
//  triggered when bot leaves a server, deletes all data associated with that server
//----------------------------------------------------------------------------------------------
client.on("guildDelete", guild => {
        console.log("Left a server: " + guild.name);
        BMServer.channels.find(c => c.name == guild.id).delete();
        delete config[guild.id];
        delete list[guild.id];
})

//----------------------------------------------------------------------------------------------
//  triggered when bot goes online, does all the initial setup
//----------------------------------------------------------------------------------------------
client.on("ready", async () => {
        let inviteMsg = new Discord.RichEmbed().setColor(grey).setTitle("Invite").setFooter("Bot online!", client.iconURL);
        console.log(`Bot is running! ${client.user.username}`);
        await client.generateInvite(["ADMINISTRATOR"]).then(link =>{
                inviteMsg.setURL(link)
        }).catch(err => {
                console.log(err.stack);
        });
        BMServer = await client.guilds.get("577579486699192330");
        BMServer.channels.find(c => c.name == "online").send(inviteMsg);

        let guildArray = client.guilds.array();
        let i = 0;
        console.log("----------Active Servers------------")
        while(i < guildArray.length){
                list[guildArray[i].id] = []
                config[guildArray[i].id] = {'counter': 0, 'changer': 0, 'deleteCounter': true};
                console.log("Server " + i + ": "+ guildArray[i].name);
                let serverChannel = BMServer.channels.find(c => c.name == guildArray[i].id);
                if(!serverChannel){
                        await BMServer.createChannel(guildArray[i].id, "text");
                        serverChannel = await BMServer.channels.find(c => c.name == guildArray[i].id);
                        await serverChannel.send("\`\`\`zero\`\`\`");
                        await serverChannel.setParent("577579576700436490");
                        await serverChannel.setTopic("Server: " + guildArray[i].name);
                }
                await getData(guildArray[i])
                i++;
        }
        console.log("------------------------------------");
});

//----------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------
client.on("message",async (message) => {
        //spam protection
        if (message.author.bot) return;
        if (message.channel.type == "dm") return;

        //set var
        var server = message.guild;
        var serverID = message.guild.id;

        //server protection
        if(message.content.toLowerCase().includes("discord.gg") && !message.member.roles.find(r => r.name == "Owner") && !message.member.hasPermission("ADMINISTRATOR")){
                ownerRole = await server.roles.find(r => r.name == "Owner");
                message.delete();
                message.author.send("This is your final warning, the next time you send an invite to another server you will get kicked from the server!")
                server.channels.find(r => r.name == "logs").send(`${message.author} has been warned for posting a invite link! ${ownerRole}`);
                message.channel.send(`These links are not allowed in here! If you post that link again you will get kicked out ${message.author}!`).then(msg => {
                        msg.delete(10000);
                });
        }

        if(message.content.toLowerCase().includes("jig")){
                ownerRole = await server.roles.find(r => r.name == "Owner");
                message.delete();
                message.author.send(`You are not allowed to say 'jig', this could lead to this servers deletion! Final warning, next time we will have to ban you!`);
                server.channels.find(r => r.name == "logs").send(`${message.author} has been warned for writing 'j!g' in the chat! ${ownerRole}`);
                message.channel.send(`You are not allowed to say 'j!g', this could lead to this servers deletion! ${message.author}`).then(msg => {
                        msg.delete(10000);
                });
        }


        //commands
        const command = message.content.slice(setup.prefix.length).trim().toLowerCase();

        //send all live slots
        if(message.content.startsWith(setup.prefix) && command == "live"){
                message.channel.send(await sendLive(server)).then(async message => {
                        let before = list[serverID].length;
                        await new Promise(resolve => setTimeout(resolve, 1000));
                        saveMSG = await sendLive(server);
                        if(before != list[serverID].length)  message.edit(saveMSG);
                });
                return;
        }

        if(message.content.toLowerCase().includes("%say")){
                content = await message.content.slice(setup.prefix.length + 3).trim()
                message.delete();
                message.channel.send(content);
        }

        //send serverinfo
        if(message.content.startsWith(setup.prefix) && command == "serverinfo"){
                let serverinfo = new Discord.RichEmbed()
                        .setColor(grey)
                        .setThumbnail(server.iconURL)
                        .setAuthor(server.name + `Info`, server.iconURL)
                        .addField("**Guild Name:**", server.name)
                        .addField("**Guild Owner:**", server.owner)
                        .addField("**Member Count:**", server.members.size)
                        .addField("**Bot Count:**", server.members.filter(member => member.user.bot).size)
                        .addField("**User Count:**", server.members.filter(member => !member.user.bot).size)
                        .addField("**Role Count:**", server.roles.size)
                        .setFooter('CartCop');
                message.channel.send(serverinfo);
        }

        //send help-message (needs finishing!!!)
        if(message.content.startsWith(setup.prefix) && command == "help"){
                await respond(message, "help");
                return;
        }

        //send delete-options
        if(config[serverID]['deleteCounter'] == true){
                if(!message.member.hasPermission("ADMINISTRATOR") && !message.member.roles.find(r => r.name == "Providers") && message.author.id != "423492556052103179") return;
                if(message.content.startsWith(setup.prefix) && command == "delete"){
                        if(list[serverID].length == 0) {
                                respond(message, "impossible_delete");
                        } else {
                                config[serverID]['deleteCounter'] = false;
                                config[serverID]['deleteID'] = message.author.id;
                                message.channel.send(await sendDelete(server));
                        }
                        return;
                }
        }

        //send delete-finished/failed
        if(config[serverID]['deleteCounter'] == false && message.author.id == config[serverID]['deleteID']) {
                if(message.content.startsWith(setup.prefix) && command == "stop") {
                        config[serverID]['deleteCounter'] = true;
                        delete config[serverID]['deleteID'];
                        return;}
                if(isPositiveInteger(message.content.trim()) == 1){
                        deleteSlot(parseInt(message.content.trim()) - 1, server);
                } else {
                        respond(message, "delete_f");
                }

        }
        //check for running notification
        if(config[serverID]['counter'] == 0){
                //check command
                if(!(message.content.startsWith(setup.prefix) && command == "slot")) return;
                //check perms
                if(!message.member.hasPermission("ADMINISTRATOR") && !message.member.roles.find(r => r.name == "Providers") && message.author.id != "423492556052103179") return;
                //start slot-notification
                config[serverID]['slot_message'] = new Discord.RichEmbed().setColor(grey).setFooter(server.name + " Slot Notifications", client.user.avatarURL);
                config[serverID]['user_id'] = message.author.id;
                config[serverID]['counter'] = 1;
                respond(message, "channel");

        //running notification ->
        //check id
        } else if (config[serverID]['user_id'] == message.author.id) {
        //check stop
        if (message.content.trim() == "stop"){
                respond(message, "stop");
                // reset current setup
                resetSetup(server)
                return;
        }
        //check if changing or initial setup

        if(config[serverID]['changer'] == 0){
                switch (config[serverID]['counter']){
                        //channel
                        case 1:
                                config[serverID]['channelName'] = message.content.trim();
                                if (server.channels.find(c => c.name == config[serverID]['channelName'])){
                                        respond(message, "role");
                                        config[serverID]['counter'] = 2;
                                }
                                else {
                                        respond(message, "channel_f");
                                }
                                break;
                        //role
                        case 2:
                                //check if no role should be mentioned
                                if(message.content.trim().toLowerCase() == "none")
                                        config[serverID]['role_name'] = "none";
                                //check for @everyone or @here
                                else if (await message.mentions.everyone){
                                        if (message.content.includes("@everyone")){
                                                config[serverID]['role_name'] = "everyone";
                                        } else {
                                                config[serverID]['role_name'] = "here";
                                        }
                                }
                                //check for role
                                else if (await message.mentions.roles.first()) {
                                        config[serverID]['role_name'] = message.mentions.roles.first();
                                }
                                //failed role -> return
                                else{
                                        respond(message, "role_f");
                                        return;
                                }
                                config[serverID]['counter'] = 3;
                                respond(message, "header");
                                break;
                        //header
                        case 3:
                                //set message-header to content
                                config[serverID]['header'] = message.content.trim();
                                config[serverID]['slot_message'].setTitle("__**" + message.content.trim() + "**__");
                                config[serverID]['counter'] = 4;
                                respond(message, "form");
                                break;
                        //form
                        case 4:
                                //check for DM instead of form
                                if(message.content.trim().toLowerCase() == "dm")
                                        config[serverID]['dm'] = `Please send ${message.author} a direct message in order to get more information on how to use these slots.`;
                                else{
                                        //set dm blank
                                        config[serverID]['dm'] = "";
                                        //check if valid link was passed
                                        if(await linkTest(message.content) == 1){
                                                respond(message, "link_f");
                                                return;
                                        }
                                        config[serverID]['formLink'] = message.content;
                                        config[serverID]['slot_message'].setURL(message.content);
                                }
                                config[serverID]['counter'] = 5;
                                respond(message, "fee");
                                break;
                        //fee
                        case 5:
                                //set fee and saveFee
                                config[serverID]['saveFee'] = message.content;
                                config[serverID]['fee'] = "_ _\n**Fee: **" + message.content;
                                config[serverID]['counter'] = 6;
                                respond(message, "retail");
                                break;
                        //retail
                        case 6:
                                //check if no retail price should be set
                                if(message.content.trim().toLowerCase() == "none")
                                        config[serverID]['retail'] = "none";
                                else {
                                        config[serverID]['retail'] = "\n\n**Retail: **" + message.content.trim();
                                }
                                config[serverID]['counter'] = 7;
                                respond(message, "date");
                                break;
                        //date
                        case 7:
                                //check if no date should be set
                                if(message.content.trim().toLowerCase() == "none")
                                        config[serverID]['release_date'] = "none";
                                else {
                                        config[serverID]['release_date'] = "\n\n**Release date: **" + message.content.trim();
                                }
                                config[serverID]['counter'] = 8;
                                respond(message, "resell");
                        //resell
                        case 8:
                                //check if no resell should be set
                                if(message.content.trim().toLowerCase() == "none")
                                        config[serverID]['resell_prediction'] = "none";
                                else {
                                        config[serverID]['resell_prediction'] = "\n\n**Resell prediction: **" + message.content.trim();
                                }
                                config[serverID]['counter'] = 9;
                                respond(message, "droplist");
                                break;
                        //droplist
                        case 9:
                                //check if no droplist should be set
                                if(message.content.trim().toLowerCase() == "none")
                                        config[serverID]['full_droplist'] = "none";
                                else {
                                        //check if valid link was passed
                                        if(await linkTest(message.content) == 1){
                                                respond(message, "link_f");
                                                return;
                                        }
                                        config[serverID]['full_droplist'] = "\n\n[**Droplist**](" + message.content.trim() + ")";
                                }
                                config[serverID]['counter'] = 10;
                                respond(message, "image");
                                break;
                        //image
                        case 10:

                                //check if image should be set
                                if(message.content.trim().toLowerCase() != "none"){
                                        //check if valid link was passed
                                        if(await linkTest(message.content) == 1){
                                                respond(message, "link_f");
                                                return;
                                        }
                                        config[serverID]['slot_message'].setImage(message.content);
                                }
                                config[serverID]['counter'] = 11;
                                //combine description text
                                textSet(server);
                                await respond(message, "slot_msg");
                                respond(message, "sure");
                                break;
                        //sure?
                        case 11:
                                switch(message.content.trim().toLowerCase()){
                                        //check for change
                                        case "no":
                                                //finished
                                                sendSlotMessage(message.author, server.channels.find(c => c.name == config[serverID]['channelName']), message.channel, server);
                                                break;
                                        case "yes":
                                                //enter change mode
                                                config[serverID]['changer'] = -1;
                                                respond(message, "change");
                                                break;
                                        default:
                                                //invalid response
                                                respond(message, "sure_f");
                                                break;
                                }
                                break;
                        }
        } else {
                if(config[serverID]['changer'] == -1){
                        switch (message.content.trim().toLowerCase()){
                                case "1":
                                        config[serverID]['changer'] = 1;
                                        respond(message, "channel");
                                        break;
                                case "2":
                                        config[serverID]['changer'] = 2;;
                                        respond(message, "role");
                                        break;
                                case "3":
                                        config[serverID]['changer'] = 3;
                                        respond(message, "header");
                                        break;
                                case "4":
                                        config[serverID]['changer'] = 4;
                                        respond(message, "form");
                                        break;
                                case "5":
                                        config[serverID]['changer'] = 5;
                                        respond(message, "fee");
                                        break;
                                case "6":
                                        config[serverID]['changer'] = 6;
                                        respond(message, "retail");
                                        break;
                                case "7":
                                        config[serverID]['changer'] = 7;
                                        respond(message, "date");
                                        break;
                                case "8":
                                        config[serverID]['changer'] = 8;
                                        respond(message, "resell");
                                        break;
                                case "9":
                                        config[serverID]['changer'] = 9;
                                        respond(message, "droplist");
                                        break;
                                case "10":
                                        config[serverID]['changer'] = 10;
                                        respond(message, "image");
                                        break;
                                case "message":
                                        config[serverID]['changer'] = 11;
                                        await respond(message, "slot_msg");
                                        respond(message, "sure");
                                        break;
                                case "finished":
                                        sendSlotMessage(message.author, server.channels.find(c => c.name == config[serverID]['channelName']), message.channel, server);
                                        break;
                                default:
                                        await respond(message, "change_answer_f");
                                        respond(message, "change");
                                        break;
                        }
                } else {
                        switch (config[serverID]['changer']){
                                case 1:
                                        config[serverID]['changer'] = -1;
                                        let changeChannelName = message.content.trim();
                                        if (server.channels.find(c => c.name == changeChannelName)){
                                                config[serverID]['channelName'] = changeChannelName;
                                                respond(message, "successful");
                                        }
                                        else {
                                                respond(message, "unsuccessful");
                                        }
                                        break;
                                case 2:
                                        config[serverID]['changer'] = -1;
                                        if(message.content.trim().toLowerCase() == "none") {
                                                config[serverID]['role_name'] = "none";
                                                respond(message, "successful");
                                        }else if (await message.mentions.everyone){
                                                if (message.content.includes("@everyone")){
                                                        config[serverID]['role_name'] = "everyone";
                                                } else {
                                                        config[serverID]['role_name'] = "here";
                                                }
                                        } else if (message.mentions.roles.first()) {
                                                config[serverID]['role_name'] = message.mentions.roles.first();
                                                respond(message, "successful");
                                        }
                                        else{
                                                respond(message, "unsuccessful");
                                        }
                                        break;
                                case 3:
                                        config[serverID]['changer'] = -1;
                                        config[serverID]['header'] = message.content.trim();
                                        slot_message.setTitle("__**" + message.content.trim() + "**__");
                                        respond(message, "successful");
                                        break;
                                case 4:
                                        config[serverID]['changer'] = -1;
                                        if(message.content.trim().toLowerCase() == "dm"){
                                                config[serverID]['formLink'] = null;
                                                config[serverID]['slot_message'].setURL(null);
                                                config[serverID]['dm'] = `Please send ${message.author} a direct message in order to get more information on how to use these slots.`;
                                                respond(message, "successful");
                                        } else {
                                                if(await linkTest(message.content) == 1){
                                                        respond(message, "unsuccessful");
                                                } else {
                                                        config[serverID]['formLink'] = message.content;
                                                        config[serverID]['slot_message'].setURL(message.content);
                                                        config[serverID]['dm'] = "";
                                                        respond(message, "successful");
                                                }
                                        }
                                        break;
                                case 5:
                                        config[serverID]['changer'] = -1;
                                        config[serverID]['saveFee'] = message.content;
                                        config[serverID]['fee'] = "_ _\n**Fee: **" + message.content;
                                        textSet(server);
                                        respond(message, "successful");
                                        break;
                                case 6:
                                        config[serverID]['changer'] = -1;
                                        if(message.content.trim().toLowerCase() == "none")
                                                config[serverID]['retail'] = "none";
                                        else{
                                                config[serverID]['retail'] = "\n\n**Retail: **" + message.content.trim();
                                        }
                                        respond(message, "successful");
                                        textSet(server);
                                        break;
                                case 7:
                                        config[serverID]['changer'] = -1;
                                        if(message.content.trim().toLowerCase() == "none"){
                                                config[serverID]['release_date'] = "none";
                                        }
                                        else{
                                                config[serverID]['release_date'] = "\n\n**Release date: **" + message.content.trim();
                                        }
                                        textSet(server);
                                        respond(message, "successful");
                                        break;
                                case 8:
                                        config[serverID]['changer'] = -1;
                                        if(message.content.trim().toLowerCase() == "none"){
                                                config[serverID]['resell_prediction'] = "none";
                                        } else {
                                                config[serverID]['resell_prediction'] = "\n\n**Resell prediction: **" + message.content.trim();
                                        }
                                        textSet(server);
                                        respond(message, "successful");
                                        break;
                                case 9:
                                        config[serverID]['changer'] = -1;
                                        if(message.content.trim().toLowerCase() == "none"){
                                                config[serverID]['full_droplist'] = "none";
                                                respond(message, "successful");
                                        } else {
                                                if(await linkTest(message.content.trim()) == 1){
                                                        respond(message, "unsuccessful");
                                                } else {
                                                        config[serverID]['full_droplist'] = "\n\n[**Droplist**](" + message.content.trim() + ")";
                                                        textSet(server);
                                                }
                                        }
                                        break;
                                case 10:
                                        config[serverID]['changer'] = -1;
                                        if(message.content.trim().toLowerCase() == "none"){
                                                config[serverID]['slot_message'].setImage(null);
                                                respond(message, "successful");
                                        } else {
                                                if(await linkTest(message.content) == 1){
                                                        respond(message, "unsuccessful");
                                                } else {
                                                        config[serverID]['slot_message'].setImage(message.content);
                                                        respond(message, "successful");
                                                }
                                        }
                                        break;
                                case 11:
                                switch(message.content.trim().toLowerCase()){
                                        case "no":
                                                sendSlotMessage(message.author, server.channels.find(c => c.name == config[serverID]['channelName']), message.channel, server);
                                                return;
                                        case "yes":
                                                config[serverID]['changer'] = -1;
                                                break;
                                        default:
                                                respond(message, "sure_f");
                                                return;
                                }
                                default: break;
                        }
                        respond(message, "change");
                }
        }
}
return;
});

client.login(setup.CartCopKey);
