var TelegramBot = require('node-telegram-bot-api');
var googleFinance = require('google-finance2');
var token = '365465938:AAHdI3StI5QK09z41U36VK_lYFym84gHcfU';
var bot = new TelegramBot(token, {polling: true});
var dbModel = require('./models/dbModel');
var mongoose = require("mongoose")
var userModel = require('./models/userModel.js').userModel;
var newsModel = require('./models/portfelModel.js');
var alertModel = require('./models/alertModel');
module.exports.bot = bot;
require('./controllers/main.js')
var portfels = require('./controllers/portfels.js');

//Обновление портфелей
setTimeout(function run() {
    setTimeout(run, 60000);
    let a = new Date()
    //утро
    if(a.getMinutes() == 0 && a.getHours() == 10)
    {
        userModel.find({$or: [{portfel_alert: 3},{portfel_alert:1}]}).then(function(users){
            users.map(user => {
                let msg = {chat:{}};
                msg.chat.id = user.chatId;
                portfels.UpdatePortfelPromise(msg, user);
            })
        })
    }
    //вечер
    if(a.getMinutes() == 0 && a.getHours() == 22){
        userModel.find({$or: [{portfel_alert: 3},{portfel_alert:2}]}).then(function(users){
            users.map(user => {
                let msg = {chat:{}};
                msg.chat.id = user.chatId;
                portfels.UpdatePortfelPromise(msg, user);
            })
        })
    }
},10);


//_______________________Синхронизировать с другими таймерами

//Обновление новостей
setTimeout(function run(){
    let a = new Date()
    setTimeout(run, 3600000)
    if(a.getMinutes()<20 && (a.getHours() == 22 || a.getHours() == 10)){
        setTimeout(600000);
    } else {
        newsModel.newsModel.find().then(function(n_tickers){
            n_tickers.map(n_ticker => {
                userModel.find({news_alert: 1}).elemMatch('portfel',function(elem){
                    elem.where({'ticker':{$regex:n_ticker.ticker, $options:'i'}})
                }).then(function(users){
                    newsModel.update(users, n_ticker.ticker, bot);
                }) 
            })
        })
    }
}, 10)

//Обновление стопов

setTimeout(function run(){
    setTimeout(run, 900000)
        alertModel.alertsModel.find().then(function(alerts){
            alerts.map( alert => {
                //Здесь получаем инфу о ценах alert.ticker
                //Через google history
            alertModel.getPrice(alert.ticker.toUpperCase()).then(function(res, rej){
                let high, low;
                if(res == false){
                    high = 99999
                    low = -99999
                } else {
                    high = res.high;
                    low = res.low;
                }
                //console.log(high, low)
                alert.users.map(user => {
                    userModel.findOne({chatId:user}).then(function(_user){
                        let del_mass = [];
                        let j = 0;//
                        for(let i=0; i<_user.alerts.length; i++){
                            if(_user.alerts[i].ticker == alert.ticker){
                                ++j;
                                //тут сравнение по цене
                                //if (_user.alerts[i].price>100){
                                if (_user.alerts[i].price<=high || _user.alert[i].price>=low){
                                    bot.sendMessage(user,'Тикер '+_user.alerts[i].ticker+' достиг цены '+_user.alerts[i].price)
                                    require('./controllers/quotations/onTicker').showGraph({chat:{id:_user.chatId}},_user,_user.alerts[i].ticker)
                                    del_mass.push(i);

                                }
                            }
                        }
                        if (j==del_mass.length)
                            alertModel.alertsModel.findOne({ticker:alert.ticker}).then(function(alert_){
                                alert_.users.splice(alert_.users.indexOf(_user.chatId),1)
                                alert_.save()
                            })
                        
                        let k =0;
                        del_mass.map(i => {
                            _user.alerts.splice(i-k, 1);
                            ++k;
                        })
                        _user.save()
                    })
                })
                if (alert.users.length==0)
                    alerts.splice(alerts.indexOf(alert),1)
                //alerts.save();
            })      
        })
    })
}, 10)

//______________________________________________________________s




console.log('startted')


