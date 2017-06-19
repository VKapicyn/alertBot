var bot = require('../../app.js').bot
var request = require('request')
var userModel = require('../../models/userModel.js').userModel;
var alertsModel = require('../../models/alertModel.js').alertsModel;
var checkMenu = require('../../models/dbModel').checkMenu;
var onTickerMenu = {
    reply_markup: JSON.stringify({
    "keyboard": [['Назад']], 
    "one_time_keyboard": true,
    "force_replay": true,
    "resize_keyboard": true
    })
}
var name = 'Добавить';
var getTags = function(){
    let mass = []
    //mass = mass.concat(cNews.getTags(), macro.getTags());
    mass.push("Q_add")
    return mass;
}

//TODO
function OnStart(msg, user){
        if (user != null){
            user.lastMenu = "Q_add";
            user.save();
            if (msg.text == 'Назад'){
                user.ta_buffer = '0';
                user.save();
                require('../../controllers/alerts.js').alertMenu(msg, user)
            } 
            else if(msg.text == 'Добавить'){
                if((user.ta_buffer==0 || user.ta_buffer==null) && user.alerts.length<5){
                    bot.sendMessage(msg.chat.id, 'Введите тикер', onTickerMenu)
                    user.ta_buffer = 1;
                    user.save();
                } else {
                    bot.sendMessage(msg.chat.id, 'Вы не можете добавить более 5 оповещения одновременно.', onTickerMenu)
                } 
            } else {
                if (user.ta_buffer == 1){
                    showGraph(msg, user)
                } else if (user.ta_buffer == 2) {
                    savePrice(msg, user)
                }
            }

        }
}

function openMenu(msg, user){
    bot.sendMessage(msg.chat.id, 'Введите тикер', onTickerMenu)
}

function savePrice(msg, user){
    msg.text = msg.text.replace(',','.')
    console.log('tftft', isNumber(msg.text))
    if (isNumber(msg.text)){
        user.ta_buffer = 0;
        user.alerts[user.alerts.length-1].price = msg.text
        bot.sendMessage(msg.chat.id, 'Добавлено')
        require('../../controllers/alerts.js').alertMenu(msg, user)
    } else {
        bot.sendMessage(msg.chat.id, 'Некорректный ввод, попробуйте еще раз')
    }
    
}

function showGraph(msg, user){
    new Promise((res, rej) => {
        var url = 'https://www.google.com/finance/info?q='+msg.text;
            request({
                url: url,
                json: true
            }, function (error, response, body) {
                if (!error && response.statusCode === 200) {
                    res(true);
                }
                else
                    res(false)
            });     
        }).then(function(result, err){
            
            if(result==false){
                user.ta_buffer = 1;
                bot.sendMessage(msg.chat.id, 'Не удалось найти тикер, попробуй еще раз...', onTickerMenu)
            }
            else
            {
                user.ta_buffer = 2;
                bot.sendMessage(msg.chat.id,'Введите цену.(По ее достижению отправим оповещение)',onTickerMenu)
                alertsModel.findOne({ticker:msg.text.toLowerCase()}).then(function(alert){
                        if(alert!=null && alert.length!=0) {
                            if (find(user.chatId, alert) == -1){
                                alert.users.push(user.chatId);
                                alert.save();
                            }
                        } else {
                           
                                let _alert = new alertsModel();
                                _alert.ticker = msg.text.toLowerCase();
                                _alert.users = [user.chatId]
                                _alert.save();
                            //}
                    }
                })
                user.alerts.push({ticker:msg.text.toLowerCase()})
            }
            user.save();
        })
}

function find(key, mass){
    let i =0;
    mass.users.map(x => {
        //console.log(key, x)
        if (key.toString() == x.toString())
            ++i;
    })
    if (i>0)
        return 0;
    else
        return -1;
}

function isNumber(text){
    let mass = text.split('');
    console.log(mass)
    let j = 0;
    mass.map(x => {
        let flag = false;
        for (let i = 0; i<=9; i++){
            if (x==i)
                flag = true
        }
        console.log(!flag && x != '.')
        if(!flag && x != '.')
            j++;
    })
    if (j==0)
        return true
    else
        return false
}


module.exports.OnStart = OnStart;
module.exports.openMenu = openMenu;
module.exports.name = name;
module.exports.getTags = getTags;