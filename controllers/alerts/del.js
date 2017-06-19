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
var name = 'Удалить';
var getTags = function(){
    let mass = []
    mass.push("Q_del")
    return mass;
}

//TODO
function OnStart(msg, user){
        if (user != null){
            user.lastMenu = "Q_del";
            user.save();
            if (msg.text == 'Назад'){
                require('../../controllers/alerts.js').alertMenu(msg, user)
            } 
            else if (msg.text == name){
                let menu = {"keyboard": [], "one_time_keyboard": true,"force_replay": true,"resize_keyboard": true}
                user.alerts.map(alert => {
                    menu.keyboard.push([alert.ticker+' по '+alert.price])
                })
                menu.keyboard.push(['Назад']);
                bot.sendMessage(msg.chat.id, 'Выберите оповещение которое хотите удалить', {reply_markup:JSON.stringify(menu)})
            }
            else {
                let obj = {'ticker':msg.text.split(' по ')[0], 'price':msg.text.split(' по ')[1]}
                let mass = [];
                for(let i=0; i<user.alerts.length; i++){
                    if (user.alerts[i].ticker == obj.ticker && user.alerts[i].price == obj.price){
                        mass.push(i);
                    }
                }

                let j = 0;            
                mass.map( i => {
                    user.alerts.splice(i-j, 1)
                    --j
                })

                j = 0;
                user.alerts.map(alert => {
                    if (alert.ticker == obj.ticker)
                        ++j;
                })

                //console.log(user)
                if (j==0)
                    alertsModel.findOne({ticker:obj.ticker}).then(function(alert){
                        //console.log(alert)
                        alert.users.splice(alert.users.indexOf(user.chatId),1)
                        alert.save()
                    })
                
                if(mass.length > 0)
                    bot.sendMessage(msg.chat.id, obj.ticker+' по '+obj.price+'. '+'Удалено!')
                 
                require('../../controllers/alerts.js').alertMenu(msg, user)
            }
        }
}


module.exports.OnStart = OnStart;
module.exports.name = name;
module.exports.getTags = getTags;