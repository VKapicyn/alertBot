var bot = require('../../app.js').bot
var request = require('request')
var userModel = require('../../models/userModel.js').userModel;
var Otmena = {
    reply_markup: JSON.stringify({
    "keyboard": [['Отмена']], 
    "one_time_keyboard": true,
    "force_replay": true,
    "resize_keyboard": true
    })
}
var DaNet = {
    reply_markup: JSON.stringify({
    "keyboard": [['Да'],['Нет']], 
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
        if (user != null && user.admin == true){
            user.lastMenu='message';
            user.save();
            if (user.admin_buf == 0 || user.admin_buf == null){
                if (msg.text == 'Отправить сообщение'){
                    bot.sendMessage(msg.chat.id, 'Введи сообщение для рассылки', Otmena)
                    user.admin_buf = 1;
                    user.save();
                } 
                else if (msg.text == 'Назад'){
                    require('../../controllers/admin.js').adminMenu(msg, user)
                }
                else {
                    require('../../controllers/admin.js').adminMenu(msg, user)
                }
            }
            else if (user.admin_buf == 1)
            {
                if (msg.text == 'Отмена'){
                    user.admin_buf = 0;
                    user.save();
                }
                else {
                    user.admin_buf = msg.text;
                    user.save();
                    bot.sendMessage(msg.chat.id,'Отправить?\n\n'+user.admin_buf, DaNet);
                }
            }
            else
            {
                if (msg.text == 'Да'){
                    let text = user.admin_buf;
                    userModel.find().then(function(users){
                        let i = 0;
                        setTimeout(function run(){
                            if(i<users.length){
                                bot.sendMessage(users[i].chatId, text);
                                ++i;
                                setTimeout(run, 30)
                            }
                        }, 30)
                    user.admin_buf = 0;
                    user.save();
                    })
                }
                require('../../controllers/admin.js').adminMenu(msg, user)
            }
        }
}

module.exports.OnStart = OnStart;
module.exports.getTags = getTags;
module.exports.name = name;