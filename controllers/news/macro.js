var bot = require('../../app.js').bot
var request = require('request')
var userModel = require('../../models/userModel.js').userModel;
var checkMenu = require('../../models/dbModel').checkMenu;
var newsMenu = {
    reply_markup: JSON.stringify({
    "keyboard": [["Включить", "Отключить"], ['Назад']], 
    "one_time_keyboard": true,
    "force_replay": true,
    "resize_keyboard": true
    })
}
var name = 'Макростатистика';
var getTags = function(){
    let mass = []
    //mass = mass.concat(cNews.getTags(), macro.getTags());
    mass.push("macro")
    return mass;
}

function macroOnStart(msg, user){
        if (user != null){
            if (msg.text == 'Включить'){
                bot.sendMessage(msg.chat.id, 'Рассылка новостей включена!', newsMenu)
                user.macro_alert = 1;
                user.save();
            } 
            else if (mВыключитьsg.text == 'Отключить'){
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

function openMenu(msg, user){
    bot.sendMessage(msg.chat.id, 'Здесь Вы можете включить/отключить рассылку макростатистики.', newsMenu)
    user.lastMenu = "macro";
    user.save();
}

module.exports.macroOnStart = macroOnStart;
module.exports.openMenu = openMenu;
module.exports.name = name;
module.exports.getTags = getTags;