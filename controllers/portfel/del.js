var bot = require('../../app.js').bot
var request = require('request')
var userModel = require('../../models/userModel.js').userModel;
var portfels = require('../../controllers/portfels.js');
var getTags = function(){
    return ['P_del'];
}
var name = 'Удалить';


function delOnStart(msg, user){
    if (user != null){
        if (msg.text == 'Назад'){
            portfels.openMenu(msg, user);
        } else if (msg.text == 'Удалить'){
            var delMenu = {}; delMenu.reply_markup = {};
            delMenu.reply_markup.one_time_keyboard = true;
            delMenu.reply_markup.force_replay = true;
            delMenu.reply_markup.resize_keyboard = true;
            delMenu.reply_markup.keyboard = [];
            user.portfel.map(stock => {
                let local_mass = [stock.ticker]
                delMenu.reply_markup.keyboard.push(local_mass);
            })
            delMenu.reply_markup.keyboard.push(['Назад']);
            delMenu.reply_markup = JSON.stringify(delMenu.reply_markup);
            bot.sendMessage(msg.chat.id, 'Выберите тикер, который хотите удалить', delMenu); 
            user.lastMenu =  'P_del';
        } else {
            let flag = 0;
            let tick = '';
            user.portfel.map(stock => {
                if (msg.text == stock.ticker){
                    tick = stock.ticker;
                    user.portfel.splice(user.portfel.indexOf(stock),1);
                    ++flag;
                }
            })
            if (flag != 0){
                bot.sendMessage(msg.chat.id, tick+' удален'); 
            } else {
                bot.sendMessage(msg.chat.id, 'Нет такого тикера'); 
            }
        }
        user.save();
    }
}


module.exports.delOnStart = delOnStart;
module.exports.getTags = getTags;
module.exports.name = name;