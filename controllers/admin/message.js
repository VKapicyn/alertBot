var bot = require('../../app.js').bot
var request = require('request')
var userModel = require('../../models/userModel.js').userModel;
var Menu = {
    reply_markup: JSON.stringify({
    "keyboard": [['Отмена']], 
    "one_time_keyboard": true,
    "force_replay": true,
    "resize_keyboard": true
    })
}
var getTags = function(){
    return ['message'];
}
var name = 'Отправить сообщение';

function OnStart(msg, user){
        if (user != null){
            if (msg.text == 'Отправить сообщение'){
                bot.sendMessage(msg.chat.id, 'Введи сообщение для рассылки', newsMenu)
                user.admin_buf = 1;
                user.save();
            } 
            else if (msg.text == 'Отключить'){
                bot.sendMessage(msg.chat.id, 'Рассылка новостей отключена!', newsMenu)
                user.macro_alert = 0;
                user.save();
            }
            else if (msg.text == 'Назад'){
                require('../../controllers/news.js').openMenu(msg, user)
            }
            else {
                openMenu(msg, user)
            }
        }
}

module.exports.OnStart = OnStart;
module.exports.getTags = getTags;
module.exports.name = name;