const Discord = require("discord.js");
const client = new Discord.Client();
const setup = require("./setup.json");
const f = require("./functions.js");
const fs = require('fs')

var counter = 0;
var deleteCounter = "deleteReady";
var changer = 0;
var user_id;
var msg;
var ownerRole;

var green = 8313370;
var red = 12587561;
var blue = 767487;

var text;
var header;
var formLink;
var fee;
var saveFee;
var retail;
var release_date;
var resell_prediction;
var full_droplist;

var channel_id;
var change_channel_id;
var role_name;
var image;
var mention;
var dm = "";

var slot_message;

var list = [];
var slots = [];
var liveCounter = 0;

exports.getMessage = function(){
        return msg;
}

exports.getDiscord = function(){
        return Discord;
}

exports.getSlotMessage = function(){
        return slot_message;
}

class liveSlot {
        constructor(slotHeader, slotForm, slotFee) {
                this.slotHeader = slotHeader;
                this.slotForm = slotForm;
                this.slotFee = slotFee;
        }
}

async function readSlotsFile() {
        await fs.readFile('liveslots.txt', (err, data) => {
                if (err) throw err;
                data = data.toString();
                readSlots(data);
        })
}

async function readSlots(data) {
        slots = data.split("%next%");
        console.log(slots.length);
        liveCounter = slots.length - 1;
        for (var i = 0; i < slots.length; ++i) {
                slots[i] = slots[i].trim();
        }
        for (var i = 0; i < slots.length - 1; ++i) {
                var slot = slots[i].split("##");
                await list.push(new liveSlot(slot[0], slot[1], slot[2]));
        }
}

async function sendLive(){
        readSlotsFile();
        let liveMessage = new Discord.RichEmbed().setColor(blue).setTitle("**Live slots**").setDescription("These are all of our currently live slots:\n_ _\n_ _").setFooter(msg.guild.name + " Slot Notifications", msg.guild.iconURL);
        var i;
        if(liveCounter == 0){
                liveMessage.setDescription("Unfortunatly there are no live slots at the moment!")
        } else {
                for (i = 0; i <  liveCounter - 1; ++i){
                        if(list[i].slotForm.toString().charAt(0) == '+')
                        liveMessage.addField("\n\n" + list[i].slotHeader, "Fee: " + list[i].slotFee + "\nDm " + list[i].slotForm.slice(1) + "for more info\n_ _\n_ _");
                        else
                        liveMessage.addField("\n\n" + list[i].slotHeader, "Fee: " + list[i].slotFee + "\n[Form](" + list[i].slotForm + ")\n_ _\n_ _", false);
                }
                if(list[i].slotForm.toString().charAt(0) == '+')
                liveMessage.addField("\n\n" + list[i].slotHeader, "Fee: " + list[i].slotFee + "\nDm " + list[i].slotForm.slice(1) + " for more info!\n_ _\n_ _");
                else
                liveMessage.addField("\n\n" + list[i].slotHeader, "Fee: " + list[i].slotFee + "\n[Form](" + list[i].slotForm + ")\n_ _\n_ _", false);
        }
        msg.channel.send(liveMessage);
}

async function saveAll(){
        let output = "";
        for (var i = 0; i < liveCounter; i++){
                if(list[i] != undefined)
                        output = output + list[i].slotHeader + "##" + list[i].slotForm + "##" + list[i].slotFee + "%next%"; console.log("test");
        }
        output = output + "\n";
        fs.writeFile('liveslots.txt', output, (err) => {
                if (err) throw err;
        })
}

async function deleteSlot(n){
        if(n < list.length){
                liveCounter--;
                await console.log(list);
                await list.splice(n, 1);
                await f.respond("delete");
                deleteCounter = "deleteReady";
                console.log(list);
        } else
                f.respond("delete_f")
        saveAll();
        readSlotsFile();
}

async function sendSlotMessage(clientChannel, messageChannel) {
        if(!dm)
                await list.push(new liveSlot(header, formLink, saveFee));
        else
                await list.push(new liveSlot(header, "+" + `${msg.author}` , saveFee));
        saveAll();
        await clientChannel.send(slot_message);
        if(role_name === "none"){
                if(dm){ clientChannel.send(dm); }
        } else if (role_name === "everyone"){
                clientChannel.send(dm + " @everyone");
        } else if (role_name === "here"){
                clientChannel.send(dm + "@here ");
        } else {
                clientChannel.send(dm + ` ${role_name}`);
        }
        f.respond("finished");
        counter = 0;
        changer = 0;
        liveCounter++;
}

async function sendDelete(){
        let deleteMessage = new Discord.RichEmbed().setColor(blue).setTitle("Which slot would you like to delete? Please respond with the according number.").setFooter(msg.guild.name + " Slot Notifications", msg.guild.iconURL);
        for (i = 1; i < list.length + 1; ++i){
                if(i == 1)
                        deleteMessage.addField("**1. " + list[i - 1].slotHeader + "**", "_ _", false);
                else
                        deleteMessage.addField("\n_ _\n**" + i + ". " + list[i - 1].slotHeader + "**", "_ _", false);
        }
        msg.channel.send(deleteMessage);
}

async function linkTest(link) {
        var link_number = 0;
        let testMessageLink = new Discord.RichEmbed().setColor(green).setTitle("link test");
        testMessageLink.setURL(link);
        await client.channels.get("554647142808158209").send(testMessageLink).catch(err => {
                link_number = 1;
        });
        return link_number;
}

function textSet() {
        text = fee;
        if (retail != "none") {text = text + retail;}
        if (release_date != "none") {text = text + release_date;}
        if (resell_prediction != "none") {text = text + resell_prediction;}
        if (full_droplist != "none") {text = text + full_droplist;}
        slot_message.setDescription(text);
}

function isPositiveInteger(s) {
        return /^\+?[1-9][\d]*$/.test(s);
}


client.on("ready", () => {
        readSlotsFile();
        f.start();
        console.log(`Bot is running! ${client.user.username}`);
        client.generateInvite(["ADMINISTRATOR"]).then(link =>{
                console.log(link);
        }).catch(err => {
                console.log(err.stack);
        });
});

client.on("message",async (message) => {
        //respondeMessage.setFooter(message.guild.name + " Slot Notifications", message.guild.iconURL);
        if (message.author.bot) return;
        if (message.channel.type === "dm") return;
        const command = message.content.slice(setup.prefix.length).trim().toLowerCase();
        if (await message.mentions.roles.first() != null) {
                message.channel.send(message.mentions.roles.first());
        }

        if(message.content.includes("discord.gg") && !message.member.roles.find(r => r.name === "Support")){
                ownerRole = await message.guild.roles.find(r => r.name === "Owner");
                message.delete();
                message.author.send("This is your final warning, the next time you send an invite to another server you will get kicked from the server!")
                client.channels.get("567701238297395231").send(`${message.author} has been warned for posting a invite link! ${ownerRole}`);
                message.channel.send(`These links are not allowed in here! If you post that link again you will get kicked out ${message.author}!`).then(msg => {
                        msg.delete(10000);
                });
        }

        if(message.content.includes("jig")){
                ownerRole = await message.guild.roles.find(r => r.name === "Owner");
                message.delete();
                message.author.send(`You are not allowed to say 'jig', this could lead to this servers deletion! Final warning, next time we will have to ban you!`)
                client.channels.get("567701238297395231").send(`${message.author} has been warned for writing 'j!g' in the chat! ${ownerRole}`);
                message.channel.send(`You are not allowed to say 'j!g', this could lead to this servers deletion! ${message.author}`).then(msg => {
                        msg.delete(10000);
                });
        }

        if(message.content.startsWith(setup.prefix) && command == "live"){
                await f.startRespond(message.guild);
                msg = message;
                await sendLive();
                return;
        }

        if(message.content.startsWith(setup.prefix) && command == "help"){
                await f.startRespond(message.guild);
                msg = message;
                await f.respond("help");
                return;
        }

        if(deleteCounter == "deleteReady"){
                if(!message.member.hasPermission("ADMINISTRATOR") && !message.member.roles.find(r => r.name === "Providers") && message.author.id != "423492556052103179") return;
                if(message.content.startsWith(setup.prefix) && command == "delete"){
                        await f.startRespond(message.guild);
                        msg = message;
                        deleteCounter = "deleteLive";
                        await sendDelete();
                        return;
                }
        }

        if(deleteCounter == "deleteLive") {
                if(isPositiveInteger(message.content.trim()) == 1){
                        deleteSlot(parseInt(message.content.trim()) - 1);
                } else {
                        f.respond("delete_f");
                }

        }

        if(counter === 0){
                if(!message.member.hasPermission("ADMINISTRATOR") && !message.member.roles.find(r => r.name === "Providers") && message.author.id != "423492556052103179") return;
                if(message.content.startsWith(setup.prefix) && command == "slot"){
                        f.startRespond(message.guild);
                        slot_message = new Discord.RichEmbed().setColor(blue).setFooter(message.guild.name + " Slot Notifications", client.user.avatarURL);
                        msg = message;
                        f.respond("channel");
                        user_id = message.author.id;
                        counter = 1;
                }
        } else if (user_id == message.author.id) {

                msg = message;

        if (message.content.trim() == "stop"){
                f.respond("stop");
                counter = 0;
                changer = 0;
                return;
        }

        if(changer == 0){
                if(counter === 1){
                        //channel
                        channel_id = message.content.trim();
                        if (client.channels.get(channel_id)){
                                f.respond("role");
                                counter = 2;
                        }
                        else {
                                f.respond("channel_f");
                        }
                }else if(counter === 2){
                        //role
                        if(message.content.trim().toLowerCase() == "none") role_name = "none";
                        else if (await message.mentions.everyone){
                                if (message.content.includes("@everyone")){
                                        role_name = "everyone";
                                } else {
                                        role_name = "here";
                                }
                        }
                        else if (await message.mentions.roles.first()) {
                                role_name = message.mentions.roles.first();
                        }
                        else{
                                f.respond("role_f");
                                return;
                        }
                        counter = 3;
                        f.respond("header");
                }else if(counter === 3){
                        //header
                        counter = 4;
                        header = message.content;
                        slot_message.setTitle("__**" + message.content + "**__");
                        f.respond("form");
                }else if(counter === 4){
                        //form
                        if(message.content.trim().toLowerCase() === "dm"){
                                dm = `Please send ${message.author} a direct message in order to get more information on how to use these slots.`;
                        }
                        else{
                                dm = "";
                                if(await linkTest(message.content) == 1){
                                        f.respond("link_f");
                                        return;
                                }
                                formLink = message.content;
                                slot_message.setURL(message.content);
                        }
                        counter = 5;
                        f.respond("fee");
                }else if(counter === 5){
                        //fee
                        saveFee = message.content;
                        fee = "_ _\n**Fee: **" + message.content;
                        counter = 6;
                        f.respond("retail");
                }else if(counter === 6){
                        //retail
                        if(message.content.trim().toLowerCase() === "none"){
                                retail = "none";
                        } else {
                                retail = "\n\n**Retail: **" + message.content.trim();
                        }
                        counter = 7;
                        f.respond("date");
                }else if(counter === 7){
                        //date
                        if(message.content.trim().toLowerCase() === "none"){
                                release_date = "none";
                        } else {
                                release_date = "\n\n**Release date: **" + message.content.trim();
                        }
                        counter = 8;
                        f.respond("resell");
                }else if(counter === 8){
                        //resell
                        if(message.content.trim().toLowerCase() === "none"){
                                resell_prediction = "none";
                        } else {
                                resell_prediction = "\n\n**Resell prediction: **" + message.content.trim();
                        }
                        counter = 9;
                        f.respond("droplist");
                }else if(counter === 9){
                        //droplist
                        if(message.content.trim().toLowerCase() === "none"){
                                full_droplist = "none";
                        } else {
                                if(await linkTest(message.content) == 1){
                                        f.respond("link_f");
                                        return;
                                }
                                full_droplist = "\n\n[**Droplist**](" + message.content.trim() + ")";
                        }
                        counter = 10;
                        f.respond("image");
                }else if(counter === 10){
                        //image
                        if(message.content.trim().toLowerCase() === "none"){}
                        else{
                                if(await linkTest(message.content) == 1){
                                        f.respond("link_f");
                                        return;
                                }
                                slot_message.setImage(message.content);
                        }
                        counter = 11;
                        textSet();
                        await f.respond("slot_msg");
                        f.respond("sure");
                }else if(counter === 11){
                        //sure
                        switch(message.content.trim().toLowerCase()){
                                case "no":
                                        sendSlotMessage(client.channels.get(channel_id), message.channel);
                                        break;
                                case "yes":
                                        f.respond("change");
                                        changer = -1;
                                        break;
                                default:
                                        f.respond("sure_f");
                                        break;
                        }
                } else { return; }
        } else {
                if(changer == -1){
                        switch (message.content.trim().toLowerCase()){
                                case "1":
                                        changer = 1;
                                        f.respond("channel");
                                        break;
                                case "2":
                                        changer = 2;;
                                        f.respond("role");
                                        break;
                                case "3":
                                        changer = 3;
                                        f.respond("header");
                                        break;
                                case "4":
                                        changer = 4;
                                        f.respond("form");
                                        break;
                                case "5":
                                        changer = 5;
                                        f.respond("fee");
                                        break;
                                case "6":
                                        changer = 6;
                                        f.respond("retail");
                                        break;
                                case "7":
                                        changer = 7;
                                        f.respond("date");
                                        break;
                                case "8":
                                        changer = 8;
                                        f.respond("resell");
                                        break;
                                case "9":
                                        changer = 9;
                                        f.respond("droplist");
                                        break;
                                case "10":
                                        changer = 10;
                                        f.respond("image");
                                        break;
                                case "message":
                                        await f.respond("slot_msg");
                                        f.respond("sure");
                                        changer = 11;
                                        break;
                                case "finished":
                                        sendSlotMessage(client.channels.get(channel_id), message.channel);
                                        break;
                                default:
                                        await f.respond("change_answer_f");
                                        f.respond("change");
                                        break;
                        }
                } else {
                        switch (changer){
                                case 1:
                                        changer = -1;
                                        change_channel_id = message.content.trim();
                                        if (client.channels.get(change_channel_id)){
                                                channel_id = change_channel_id;
                                                f.respond("successful");
                                        }
                                        else {
                                                f.respond("unsuccessful");
                                        }
                                        break;
                                case 2:
                                        changer = -1;
                                        if(message.content.trim().toLowerCase() == "none") {
                                                role_name = "none";
                                                f.respond("successful");
                                        }else if (await message.mentions.everyone){
                                                if (message.content.includes("@everyone")){
                                                        role_name = "everyone";
                                                } else {
                                                        role_name = "here";
                                                }
                                        } else if (message.mentions.roles.first()) {
                                                role_name = message.mentions.roles.first();
                                                f.respond("successful");
                                        }
                                        else{
                                                f.respond("unsuccessful");
                                        }
                                        break;
                                case 3:
                                        changer = -1;
                                        header = message.content;
                                        slot_message.setTitle("__**" + message.content + "**__");
                                        f.respond("successful");
                                        break;
                                case 4:
                                        changer = -1;
                                        if(message.content.trim().toLowerCase() === "dm"){
                                                formLink = null;
                                                slot_message.setURL(null);
                                                dm = `Please send ${message.author} a direct message in order to get more information on how to use these slots.`;
                                                f.respond("successful");
                                        } else {
                                                if(await linkTest(message.content) == 1){
                                                        f.respond("unsuccessful");
                                                } else {
                                                        formLink = message.content;
                                                        slot_message.setURL(message.content);
                                                        dm = "";
                                                        f.respond("successful");
                                                }
                                        }
                                        break;
                                case 5:
                                        changer = -1;
                                        saveFee = message.content;
                                        fee = "_ _\n**Fee: **" + message.content;
                                        textSet();
                                        f.respond("successful");
                                        break;
                                case 6:
                                        changer = -1;
                                        if(message.content.trim().toLowerCase() === "none"){
                                                retail = "none";
                                        }
                                        else{
                                                retail = "\n\n**Retail: **" + message.content.trim();
                                        }
                                        f.respond("successful");
                                        textSet();
                                        break;
                                case 7:
                                        changer = -1;
                                        if(message.content.trim().toLowerCase() === "none"){
                                                release_date = "none";
                                        }
                                        else{
                                                release_date = "\n\n**Release date: **" + message.content.trim();
                                        }
                                        textSet();
                                        f.respond("successful");
                                        break;
                                case 8:
                                        changer = -1;
                                        if(message.content.trim().toLowerCase() === "none"){
                                                resell_prediction = "none";
                                        } else {
                                                resell_prediction = "\n\n**Resell prediction: **" + message.content.trim();
                                        }
                                        textSet();
                                        f.respond("successful");
                                        break;
                                case 9:
                                        changer = -1;
                                        if(message.content.trim().toLowerCase() === "none"){
                                                full_droplist = "none";
                                                f.respond("successful");
                                        } else {
                                                if(await linkTest(message.content.trim()) == 1){
                                                        f.respond("unsuccessful");
                                                } else {
                                                        full_droplist = "\n\n[**Droplist**](" + message.content.trim() + ")";
                                                        textSet();
                                                }
                                        }
                                        break;
                                case 10:
                                        changer = -1;
                                        if(message.content.trim().toLowerCase() === "none"){
                                                slot_message.setImage(null);
                                                f.respond("successful");
                                        } else {
                                                if(await linkTest(message.content) == 1){
                                                        f.respond("unsuccessful");
                                                } else {
                                                        slot_message.setImage(message.content);
                                                        f.respond("successful");
                                                }
                                        }
                                        break;
                                case 11:
                                switch(message.content.trim().toLowerCase()){
                                        case "no":
                                                sendSlotMessage(client.channels.get(channel_id), message.channel);
                                                return;
                                        case "yes":
                                                changer = -1;
                                                break;
                                        default:
                                                f.respond("sure_f");
                                                return;
                                }
                                default: break;
                        }
                        f.respond("change");
                }
        }
}
return;
});

client.login(process.env.BOT_TOKEN);
