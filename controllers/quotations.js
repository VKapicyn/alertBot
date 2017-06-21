//Quotations
var bot = require('../app.js').bot
var checkMenu = require('../models/dbModel').checkMenu;
var userModel = require('../models/userModel.js').userModel;
var onTicker = require('../controllers/quotations/onTicker.js');
//var usdrub = require('../controllers/quotations/usdrub.js');
//var eurrub = require('../controllers/quotations/eurrub.js');
//var eurusd = require('../controllers/quotations/eurusd.js');
var QuotMenu = {
    reply_markup: JSON.stringify({
    "keyboard": [[onTicker.name], ['USD/RUB','EUR/RUB','EUR/USD'], ['Назад']], 
    "one_time_keyboard": true,
    "force_replay": true,
    "resize_keyboard": true
    })
}
var name = '📈 Котировки';
var getTags = function(){
    let mass = []
    mass = mass.concat(onTicker.getTags()/*, usdrub.getTags(), eurrub.getTags(), eurusd.getTags()*/);
    mass.push("Quotations")
    return mass;
}

function quotationsOnStart(msg, user){
        if(user!=null){
            if (checkMenu(msg, user, onTicker)){
                onTicker.onTickerOnStart(msg, user)
            } 
            else if (msg.text == 'USD/RUB'){
                usdrub(msg, user)
            }
            else if (msg.text == 'EUR/RUB'){
                eurrub(msg, user)
            }
            else if (msg.text == 'EUR/USD'){
                eurusd(msg, user)
            }
            else if (msg.text == 'Назад'){
                if(user.lastMenu == 'Quotations'){
                    user.lastMenu = 'General'
                    user.save();
                    require('../controllers/main.js').mainOnStart(msg)
                }
                else
                    quotMenu(msg, user)
            }
            else {
                quotMenu(msg, user)
            }
        }
}

function quotMenu(msg, user){
    bot.sendMessage(msg.chat.id, 'Здесь ты можешь узнать цены и посмотреть графики.', QuotMenu)
    user.lastMenu = "Quotations";
    user.save();
}

function usdrub(msg, user) {
    require('./portfels.js').getCarrency().then(function(res, err){
        if(res!='err') {
            let tick = Math.floor(Math.random() * 1000000);
            let period = (user.period==null || user.period==undefined) ? 7 : user.period
            bot.sendMessage(msg.chat.id, 'Текущая цена: '+res+'\n'+'https://www.google.com/finance/getchart?q='+('USDRUB').toUpperCase()+'&i=300&p='+period+'d&'+tick)
        }
    })
}

function eurusd(msg, user) {
    require('./portfels.js').getCarrency('EURUSD').then(function(res, err){
        if(res!='err') {
            let tick = Math.floor(Math.random() * 1000000);
            let period = (user.period==null || user.period==undefined) ? 7 : user.period
            bot.sendMessage(msg.chat.id, 'Текущая цена: '+res+'\n'+'https://www.google.com/finance/getchart?q='+('EURUSD').toUpperCase()+'&i=300&p='+period+'d&'+tick)
        }
    })
}

function eurrub(msg, user) {
    require('./portfels.js').getCarrency('EURRUB').then(function(res, err){
        if(res!='err') {
            let tick = Math.floor(Math.random() * 1000000);
            let period = (user.period==null || user.period==undefined) ? 7 : user.period
            bot.sendMessage(msg.chat.id, 'Текущая цена: '+res+'\n'+'https://www.google.com/finance/getchart?q='+('EURRUB').toUpperCase()+'&i=300&p='+period+'d&'+tick)
        }
    })
}

module.exports.quotationsOnStart = quotationsOnStart;
module.exports.quotMenu = quotMenu;
module.exports.name = name;
module.exports.getTags = getTags;