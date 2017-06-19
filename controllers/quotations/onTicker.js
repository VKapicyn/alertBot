var bot = require('../../app.js').bot
var request = require('request')
var userModel = require('../../models/userModel.js').userModel;
var checkMenu = require('../../models/dbModel').checkMenu;
var onTickerMenu = {
    reply_markup: JSON.stringify({
    "keyboard": [['Назад']], 
    "one_time_keyboard": true,
    "force_replay": true,
    "resize_keyboard": true
    })
}
var name = 'По тикеру';
var getTags = function(){
    let mass = []
    //mass = mass.concat(cNews.getTags(), macro.getTags());
    mass.push("onTicker")
    return mass;
}

//TODO
function onTickerOnStart(msg, user){
        if (user != null){
            console.log(msg.text)
            if (msg.text == 'Назад'){
                user.ticker_buffer = '0';
                user.save();
                require('../../controllers/quotations.js').quotMenu(msg, user)
           } 
            else {
                console.log('---')
                if(user.ticker_buffer==0 || user.ticker_buffer==null){
                    openMenu(msg, user)
                    console.log(1)
                } 
                else if (user.ticker_buffer==1){
                    showGraph(msg, user)
                    console.log(2)
                } 
                user.lastMenu = "onTicker";
                user.save();
            }
        }
}

function openMenu(msg, user){
    bot.sendMessage(msg.chat.id, 'Введите тикер', onTickerMenu)
    user.ticker_buffer = 1;
    user.save();
}

function showGraph(msg, user, ticker){
    //bot.sendMessage(msg.chat.id, '');
    //user.ticker_buffer = 0;
    //здесь чекаем тикер 
    if( ticker=='' || ticker==null || ticker==undefined)
        ticker = msg.text

    new Promise((res, rej) => {
        var url = 'https://www.google.com/finance/info?q='+ticker;
            request({
                url: url,
                json: true
            }, function (error, response, body) {
                if (!error && response.statusCode === 200) {
                    body = body.replace('// ','').replace(' ','').replace('[','').replace(']','');
                    res(JSON.parse(body).l_fix);
                }
                else
                    res(false)
            });     
        }).then(function(result, err){
            if(result==false||result==''){
                user.ticker_buffer = 1;
                bot.sendMessage(msg.chat.id, 'Не удалось найти тикер, попробуй еще раз...', onTickerMenu)
            }
            else
            {
                bot.sendMessage(msg.chat.id, 'Текущая цена: '+result+'\n'+'https://www.google.com/finance/getchart?q='+(ticker).toUpperCase()+'&i=300')
            }
            user.save();
        })
}

module.exports.onTickerOnStart = onTickerOnStart;
module.exports.showGraph = showGraph;
module.exports.openMenu = openMenu;
module.exports.name = name;
module.exports.getTags = getTags;