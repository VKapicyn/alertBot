var bot = require('../app.js').bot
var userModel = require('../models/userModel.js').userModel;
var checkMenu = require('../models/dbModel').checkMenu;
var message = require('./admin/message');
//var stats = require('./admin/stats').stats;
var Menu = {
    reply_markup: JSON.stringify({
    "keyboard": [["Статистика"], [message.name], ['Назад']], 
    "one_time_keyboard": true,
    "force_replay": true,
    "resize_keyboard": true
    })
}
var name = '/admin';
var getTags = function(){
    let mass = []
    mass = mass.concat( message.getTags());
    mass.push("admin")
    return mass;
}

function OnStart(msg, user){
        if(user!=null && user.admin==true){
            user.lastMenu = 'admin';
            user.save();
            if (msg.text == '/admin'){
                bot.sendMessage(user.chatId,'Зашел в админку', Menu)
            } 
            else if (msg.text == 'Статистика'){
                userModel.find().then(function(users){
                    bot.sendMessage(user.chatId,'Всего пользователей: '+users.length)
                })
            } 
            else if (checkMenu(msg, user, message)){
                message.OnStart(msg, user)
            } 
            else if (msg.text == 'Назад'){
                if(user.lastMenu == 'admin'){
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