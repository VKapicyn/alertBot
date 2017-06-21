var bot = require('../app.js').bot
var userModel = require('../models/userModel.js').userModel;
var checkMenu = require('../models/dbModel').checkMenu;
var message = require('./admin/message');
//var stats = require('./admin/stats').stats;
var Menu = {
    reply_markup: JSON.stringify({
    "keyboard": [["7 дней", "30 дней", "90 дней"],['Назад']], 
    "one_time_keyboard": true,
    "force_replay": true,
    "resize_keyboard": true
    })
}
var name = '🔧 Настройки';
var getTags = function(){
    let mass = []
    //mass = mass.concat( message.getTags());
    mass.push("settings")
    return mass;
}

function OnStart(msg, user){
        if(user!=null && user.admin==true){
            user.lastMenu = 'settings';
            user.save();
            if (msg.text == name){
                bot.sendMessage(user.chatId,'Выбрите период для графиков', Menu)
            } 
            else if (msg.text == '7 дней'){
                bot.sendMessage(user.chatId,'Выбран период в 7 дней.')
                user.period = 7;
                user.save()
            } 
            else if (msg.text == '30 дней'){
                bot.sendMessage(user.chatId,'Выбран период в 30 дней.')
                user.period = 30;
                user.save()
            }
            else if (msg.text == '90 дней'){
                bot.sendMessage(user.chatId,'Выбран период в 90 дней.')
                user.period = 90;
                user.save()
            } 
            else if (msg.text == 'Назад'){
                if(user.lastMenu == 'settings'){
                    user.lastMenu = 'General'
                    user.save();
                    require('../controllers/main.js').mainOnStart(msg)
                }
                else
                    Menu(msg, user)
            }
            else {
                Menu(msg, user)
            }

        }
}

module.exports.OnStart = OnStart;
module.exports.Menu = Menu;
module.exports.name = name;
module.exports.getTags = getTags;