//Quotations
var bot = require('../app.js').bot
var userModel = require('../models/userModel.js').userModel;
var add = require('../controllers/alerts/add.js');
var del = require('../controllers/alerts/del.js');
var checkMenu = require('../models/dbModel').checkMenu;
var alertsMenu = {
    reply_markup: JSON.stringify({
    "keyboard": [["Мои оповещения"], [add.name, del.name], ['Назад']], 
    "one_time_keyboard": true,
    "force_replay": true,
    "resize_keyboard": true
    })
}
var name = '⏰ Оповещения';
var getTags = function(){
    let mass = []
    mass = mass.concat(add.getTags(), del.getTags());
    mass.push("alerts")
    return mass;
}

function alertsOnStart(msg, user){
        if(user!=null){
            if (msg.text == 'Мои оповещения'){
                sendAlerts(msg, user)
            } 
            else if (checkMenu(msg, user, add)){
                add.OnStart(msg, user)
            } 
            else if (checkMenu(msg, user, del)){
                del.OnStart(msg, user)
            } 
            else if (msg.text == 'Назад'){
                if(user.lastMenu == 'alerts'){
                    user.lastMenu = 'General'
                    user.save();
                    require('../controllers/main.js').mainOnStart(msg)
                }
                else
                    alertMenu(msg, user)
            }
            else {
                alertMenu(msg, user)
            }
        }
}

function alertMenu(msg, user){
    bot.sendMessage(msg.chat.id, 'Здесь ты можешь создать оповещение.', alertsMenu)
    user.lastMenu = "alerts";
    user.save();
}

function sendAlerts(msg, user){
    let text = '';
    if (user.alerts.length==0){
        text = 'У Вас пока нет оповещений.'
    } else {
        user.alerts.map(alert => {
            text += 'Тикер: '+alert.ticker+',  Цена: '+alert.price+'\n'
        })
    }
    bot.sendMessage(msg.chat.id, text)
}

module.exports.alertsOnStart = alertsOnStart;
module.exports.alertMenu = alertMenu;
module.exports.name = name;
module.exports.getTags = getTags;