var bot = require('../app.js').bot
var request = require('request')
var userModel = require('../models/userModel.js').userModel;
var checkMenu = require('../models/dbModel').checkMenu;
var cNews  = require('../controllers/news/cNews.js'), macro = require('../controllers/news/macro.js');
var newsMenu = {
    reply_markup: JSON.stringify({
    "keyboard": [[cNews.name], [macro.name], ['Назад']], 
    "one_time_keyboard": true,
    "force_replay": true,
    "resize_keyboard": true
    })
}
var name = '📰 Новости';
var getTags = function(){
    let mass = []
    mass = mass.concat(cNews.getTags(), macro.getTags());
    mass.push("News")
    return mass;
}

function newsOnStart(msg, user){
        if (user != null){
            if (checkMenu(msg, user, cNews)){
                cNews.cNewsOnStart(msg, user)
            } 
            else if (checkMenu(msg, user, macro)){
                bot.sendMessage(msg.chat.id, '⚙ Данный раздел находится в стадии разработки. \n\nМы сразу сообщим, как только он будет готов :)\n');
                //macro.macroOnStart(msg, user)
            } 
            else if (msg.text == 'Назад'){
                if(user.lastMenu == 'News'){
                    user.lastMenu = 'General'
                    user.save();
                    require('../controllers/main.js').mainOnStart(msg)
                }
                else
                    openMenu(msg, user)
            }
            else {
                openMenu(msg, user)
            }
        }
}

function openMenu(msg, user){
    bot.sendMessage(msg.chat.id, 'Выберите раздел новостей', newsMenu)
    user.lastMenu = "News";
    user.save();
}

module.exports.newsOnStart = newsOnStart;
module.exports.openMenu = openMenu;
module.exports.name = name;
module.exports.getTags = getTags;