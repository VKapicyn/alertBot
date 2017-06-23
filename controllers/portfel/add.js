var bot = require('../../app.js').bot
var request = require('request')
var userModel = require('../../models/userModel.js').userModel;
var newsModel = require('../../models/portfelModel.js').newsModel;
var portfels = require('../../controllers/portfels.js');
var addMenu = {
    reply_markup: JSON.stringify({
    "keyboard": [['Отмена']], 
    "one_time_keyboard": true,
    "force_replay": true,
    "resize_keyboard": true
    })
}
var backMenu = {
    reply_markup: JSON.stringify({
        inline_keyboard: [
          [{ text: '<< Вернуться в меню', callback_data: 'P_add-1' }]
        ]
    })
}
var getTags = function(){
    return ['P_add'];
}
var name = 'Добавить';

function addOnStart(msg, user){
    if (user != null){
        if (msg.text == 'Отмена'){
            console.log(user.buffer + 'buffer')
            if (user.buffer != 0 && user.buffer!=1){
                user.portfel.pop();
            }
            user.buffer = 0
            user.save();
            portfels.openMenu(msg, user)
        }
        else {
            addTicker(msg, user)
        }
    }
}

bot.on('callback_query', function(msg){
    if (msg.data == 'P_add-1'){
        userModel.findOne({userId:msg.from.id}).then(function(user){
            portfels.openMenu(msg.message, user)
        });
    }
});

function addTicker(msg, user){
    if(user != null){
        if (user.portfel.length <= 10 || user.portfel == null){
            if (user.buffer == 0 || user.buffer == null){
                user.buffer = 1;
                bot.sendMessage(msg.chat.id, 'Введи тикер', addMenu);
            } else if (user.buffer == 1){
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
                    console.log(result, err)
                    if(!result){
                        user.buffer = 1;
                        bot.sendMessage(msg.chat.id, 'Не удалось найти тикер, попробуй еще раз...', addMenu)
                    }
                    else
                    {
                        //если портфель пустой
                        let obj = {};
                        obj.ticker = msg.text
                        if (user.portfel == null){
                            user.portfel = []
                        }

                        //проверка на наличие тикера в портеле
                        let flag = -1;
                        for(let i=0; i<user.portfel.length; i++){
                            if (msg.text.toUpperCase() == user.portfel[i].ticker.toUpperCase()){
                                flag = i;
                                break;
                            }
                        }

                        console.log(flag,'---')

                        if (flag == -1){
                            user.portfel.push(obj)
                        } else {
                            let buf = user.portfel[flag];
                            user.portfel.splice(flag, 1);
                            user.portfel.push(buf);
                        }
                        user.buffer = 2;
                        bot.sendMessage(msg.chat.id, 'Введи число акций', addMenu);
                    }
                    user.save();
                })
            } else if (user.buffer == 2){
                if (user.portfel[user.portfel.length-1].count == undefined){
                    //если тикер новый
                    user.portfel[user.portfel.length-1].count = msg.text;
                } else {
                    //user.portfel[user.portfel.length-1].count += ';';
                    user.portfel[user.portfel.length-1].count = user.portfel[user.portfel.length-1].count+';'+msg.text;
                }
                user.buffer = 3
                bot.sendMessage(msg.chat.id, 'Введите начальную цену', addMenu);
            } else if (user.buffer == 3){
                msg.text = msg.text.replace(',','.'); 
                if (user.portfel[user.portfel.length-1].price == undefined){
                    //если тикер новый
                    user.portfel[user.portfel.length-1].price = msg.text
                } else {
                    
                    let count = user.portfel[user.portfel.length-1].count.split(';');
                    
                    if ((count[0] >= 0 && count[1] >= 0) || (count[0] < 0 && count[1] < 0)){
                        if((count[0] >= 0 && count[1] >= 0)){
                            
                            let all = Number(count[0])*Number(user.portfel[user.portfel.length-1].price);
                            all = Number(all) + Number(count[1])*Number(msg.text);
                            user.portfel[user.portfel.length-1].price = Math.round(all/(Number(count[0])+Number(count[1]))*100)/100;
                        } else if (count[0] < 0 && count[1] < 0){
                            let all = count[0]*user.portfel[user.portfel.length-1].price*(-1);
                            console.log('__',all)
                            all += count[1]*Number(msg.text)*(-1);
                            console.log('____',all)
                            user.portfel[user.portfel.length-1].price = Math.round(all/(Number(count[0])+Number(count[1]))*(-100))/100;
                        }
                        user.portfel[user.portfel.length-1].count = Number(count[0]) + Number(count[1]);
                    }
                    else if(count[0] >= 0 && count[1] < 0) {
                        if ((Number(count[0])+Number(count[1])) > 0)
                            user.portfel[user.portfel.length-1].count = (Number(count[0])+Number(count[1]));
                        else if ((Number(count[0])+Number(count[1])) != 0){
                            console.log('меньше')
                            user.portfel[user.portfel.length-1].count = Number(count[0])+Number(count[1]);
                            user.portfel[user.portfel.length-1].price = Number(msg.text);
                        } else {
                            user.portfel.pop();

                            //функция удаления
                        }
                    }
                    else if(count[0] < 0 && count[1] >= 0) {
                        if ((Number(count[0])+Number(count[1])) < 0){
                            user.portfel[user.portfel.length-1].count = (Number(count[0])+Number(count[1]));
                        } else if ((Number(count[0])+Number(count[1])) != 0) {
                            user.portfel[user.portfel.length-1].count = (Number(count[0])*(-1)+Number(count[1])*(-1));
                            user.portfel[user.portfel.length-1].price = Number(msg.text);
                        } else {
                            //функция удаления
                            user.portfel.pop();
                        }

                    }
                }
                user.buffer = 0;
                if(user.portfel.length!=0){
                    let _flag=0;
                    newsModel.find().then(function(tickers){ 
                        console.log(tickers)  
                        for(let i=0; i<tickers.length; i++){
                            if(tickers[i].ticker.toLowerCase() == user.portfel[user.portfel.length-1].ticker.toLowerCase()){
                                ++_flag;
                                break;
                            }
                        }
                    
                    console.log(_flag)
                    if (_flag==0){
                        let _news = new newsModel();
                        _news.ticker = user.portfel[user.portfel.length-1].ticker
                        _news.date = '0'
                        _news.update = 0
                        _news.save();
                    }
                    bot.sendMessage(msg.chat.id, 'Тикер успешно добавлен в портфель!', backMenu);
                    })
                }
            }
        } else {
            bot.sendMessage(msg.chat.id, 'К сожалению в портфель нельзя внести более 10 различных бумаг одновременно');
        }
        user.lastMenu =  "P_add";
        user.save();
    }
}

module.exports.addOnStart = addOnStart;
module.exports.getTags = getTags;
module.exports.name = name;