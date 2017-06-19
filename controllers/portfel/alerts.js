//P_alerts
var bot = require('../../app.js').bot
var userModel = require('../../models/userModel.js').userModel;
var alertMenu = {
    reply_markup: JSON.stringify({
    "keyboard": [['Утром','Вечером'],["Утром и вечером", 'Откл.'], ['Назад']], 
    "one_time_keyboard": true,
    "force_replay": true,
    "resize_keyboard": true
    })
}
var getTags = function(){
    return ['P_alerts'];
}
var name = 'Оповещения';

function alertsOnStart(msg, user){
    if (user != null){
        if (msg.text == 'Утром и вечером'){
            bot.sendMessage(msg.chat.id, 'Хорошо, будем оповещать утром и вечером');
            user.portfel_alert = 3;
        }
        else if (msg.text == 'Утром'){
            bot.sendMessage(msg.chat.id, 'Хорошо, будем оповещать утром');
            user.portfel_alert = 1;
        }
        else if (msg.text == 'Откл.'){
            bot.sendMessage(msg.chat.id, 'Оповещения по портфелю отключены');
            user.portfel_alert = 0;
        }
        else if (msg.text == 'Вечером'){
            bot.sendMessage(msg.chat.id, 'Хорошо, будем оповещать вечером');
            user.portfel_alert = 2;
        }
        else if (msg.text == 'Назад'){
            require('../../controllers/portfels.js').openMenu(msg, user)
        }
        else {
            bot.sendMessage(msg.chat.id, 'Выбери, как часто хочешь получать оповещения о состоянии своих портфелей?', alertMenu);
            user.lastMenu =  "P_alerts";
        }
        user.save();
    }
}

module.exports.alertsOnStart = alertsOnStart;
module.exports.getTags = getTags;
module.exports.name = name;