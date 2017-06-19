//Portfels
var bot = require('../app.js').bot
var request = require('request')
var alerts = require('../controllers/portfel/alerts.js');
var add = require('../controllers/portfel/add.js');
var del = require('../controllers/portfel/del.js');
var userModel = require('../models/userModel.js').userModel;
var checkMenu = require('../models/dbModel').checkMenu;
var portfelMenu = {
    reply_markup: JSON.stringify({
    "keyboard": [["Обновить", alerts.name], [add.name, del.name,], ['Назад']], 
    "one_time_keyboard": true,
    "force_replay": true,
    "resize_keyboard": true
    })
}
var name = '🎒 Мои портфели';
var getTags = function(){
    let mass = []
    mass = mass.concat(alerts.getTags(), add.getTags(), del.getTags());
    mass.push("Portfels")
    return mass;
}

function portfelOnStart(msg, user){
        if (user != null){
            if (msg.text == 'Обновить'){
                UpdatePortfelPromise(msg, user)
            } 
            else if (checkMenu(msg, user, alerts)){
                alerts.alertsOnStart(msg, user)
            } 
            else if (checkMenu(msg, user, add)){
                add.addOnStart(msg, user)
            } 
            else if (checkMenu(msg, user, del)){
                //bot.sendMessage(msg.chat.id, 'Удалить');
                del.delOnStart(msg, user);
            } 
            else if (msg.text == 'Назад'){
                if(user.lastMenu == 'Portfels'){
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
    bot.sendMessage(msg.chat.id, 'Здесь ты можешь следить за состоянием своего портфеля. Что бы узнать его текующую стоимость, нажми "Обновить"', portfelMenu)
    user.lastMenu = "Portfels";
    user.save();
}

function UpdatePortfelPromise(msg, user){
    var a,b;
    new Promise((resolve, reject) => {
        //a = Date.now();
        if (user.portfel.length != 0){
            let text = '';
            let itog_rub = 0, itog_usd = 0, start_rub = 0, start_usd = 0;//start == procent
            getCarrency().then(function(rub, err){
                function recurs (i){
                    getTickerPrice(user.portfel[i].ticker).then(function(result, err){
                        let priceNow = 0;
                        let currency = '';//₽
                        if(result!='err'){
                            priceNow = result.price;
                            currency = (result.currency.slice(0,3) != 'RUB') ? '$' : '₽'
                        }
                        else console.log('trables');
                            
                        let procent = (user.portfel[i].count > 0) ? Math.round(priceNow*100/user.portfel[i].price-100) : Math.round(priceNow*100/user.portfel[i].price-100)*(-1);
                        procent = (procent >= 0) ? ('+'+procent+'%') : ('-'+procent+'%');
                        text += (i+1)+'. '+user.portfel[i].ticker.toUpperCase()+' ('+user.portfel[i].count+' по '+user.portfel[i].price + currency +')  '+priceNow+currency+' '+procent+'\n';
                        if(currency != '₽') {
                            itog_rub = (Number(itog_rub) + user.portfel[i].count*priceNow*Number(rub)-user.portfel[i].count*user.portfel[i].price*Number(rub))
                            start_rub = (user.portfel[i].count > 0) ? (start_rub + user.portfel[i].count*user.portfel[i].price*Number(rub)) : (start_rub + user.portfel[i].count*user.portfel[i].price*Number(rub)*(-1));
                            itog_usd = itog_usd + user.portfel[i].count*priceNow-user.portfel[i].count*user.portfel[i].price;
                            start_usd = (user.portfel[i].count > 0) ? (start_usd + user.portfel[i].count*user.portfel[i].price) : (start_usd + user.portfel[i].count*user.portfel[i].price*(-1));
                        } else {
                            itog_rub = (itog_rub + user.portfel[i].count*priceNow-user.portfel[i].count*user.portfel[i].price);
                            start_rub = (user.portfel[i].count > 0) ? (start_rub + user.portfel[i].count*user.portfel[i].price) : (start_rub + user.portfel[i].count*user.portfel[i].price*(-1));
                            itog_usd = (itog_usd + user.portfel[i].count*priceNow/Number(rub)-user.portfel[i].count*user.portfel[i].price/Number(rub));
                            start_usd = (user.portfel[i].count > 0) ? (start_usd + user.portfel[i].count*user.portfel[i].price/Number(rub)) : (start_usd + user.portfel[i].count*user.portfel[i].price*(-1)/Number(rub));
                            console.log(start_rub, itog_rub);    
                        }
                        if(i<user.portfel.length-1){
                            ++i;
                            recurs(i)
                        } else {
                            let obj = {};
                            obj.text = text;
                            obj.rub = Number(rub);
                            obj.itog_rub = itog_rub;
                            obj.start_rub = start_rub;
                            obj.start_usd = start_usd;
                            obj.itog_usd = itog_usd;
                            resolve(obj)
                        }
                    })
                }
                a = Date.now();
                recurs(0);
            });
        }
        else
            resolve('error');
    }).then(function(result, err){

        result.text += '-----------------------------\n';
        let st_U = Math.round(result.itog_usd*10000/result.start_usd)/100;
        let st_R = Math.round(result.itog_rub*10000/result.start_rub)/100;
        console.log(st_U, st_R, result.itog_rub, result.itog_usd)
        result.itog_usd = Math.round(result.start_usd*(st_U+100))/100;
        result.itog_rub = Math.round(result.start_rub*(st_R+100))/100;
        result.start_rub = (st_R >= 0) ? ('+'+st_R+'% ✅') : ('-'+st_R+'% ❌');
        result.start_usd = (st_U >= 0) ? ('+'+st_U+'% ✅') : ('-'+st_U+'% ❌');

        result.text += 'Цена портфеля:  \n'+result.itog_rub+'₽ ('+result.itog_usd+'$) '+result.start_rub + '\n';
        //result.text += result.itog_usd+'$ '+result.start_usd + '\n';
        result.text += '-----------------------------\n';
        result.text += 'Обновлено: \n'+new Date().toLocaleString('ru')+'\n';

        if(result=='error'){
            bot.sendMessage(msg.chat.id, 'У Вас пока нет акций в портфеле');
        } 
        else 
        {
            b = Date.now();
            console.log((a-b)+' ms')
            bot.sendMessage(msg.chat.id, result.text);
        }
    })
}

function getTickerPrice(ticker){
    return new Promise((res, rej) => {
        var url = 'https://www.google.com/finance/info?q=mcx:'+ticker;
        let flag = 0;
        getTick(url, ticker)
        function getTick(url, ticker){
            request({
                url: url,
                json: true
                }, 
                function (error, response, body) {
                    if (!error && response.statusCode === 200) {
                        body = body.replace('// ','').replace(' ','').replace('[','').replace(']','');
                        let obj = { currency: JSON.parse(body).l_cur, price : JSON.parse(body).l_fix}
                        res(obj);
                    }
                    else if (flag==0){
                        url = 'https://www.google.com/finance/info?q='+ticker;
                        ++flag;
                        getTick(url, ticker)
                    } else 
                        res('err')  
            });
        }
    })    
}

function getCarrency(test){
    if(test==null)
        test = 'USDRUB'
    return new Promise((res, rej) => {
        var url = 'http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.xchange%20where%20pair%20in%20(%22'+test+'%22)&format=json&env=store://datatables.org/alltableswithkeys&callback='
                request({
                url: url,
                json: true
                }, 
                function (error, response, body) {
                    if (!error && response.statusCode === 200) {
                        let flag = 0;
                        if (flag <= 3)
                            getRes();

                        function getRes(){
                            try{
                                res(JSON.parse(body["query"]["results"]["rate"]["Ask"]));
                            }
                            catch(e) {
                                ++flag;
                                getRes();
                            }
                        }
                    }
                    else
                        res('err')
                });
        });
}

module.exports.getTickerPrice = getTickerPrice;
module.exports.getCarrency = getCarrency;
module.exports.portfelOnStart = portfelOnStart;
module.exports.UpdatePortfelPromise = UpdatePortfelPromise;
module.exports.openMenu = openMenu;
module.exports.name = name;
module.exports.getTags = getTags;