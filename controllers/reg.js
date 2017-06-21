var bot = require('../app.js').bot;
var userModel = require('../models/userModel.js').userModel;

var reg1 = {
      reply_markup: JSON.stringify({
        inline_keyboard: [
          [{ text: 'Мужской', callback_data: '1_man' }],
          [{ text: 'Женский', callback_data: '1_woman' }]
        ]
      })
    };
var reg2 = {
      reply_markup: JSON.stringify({
        inline_keyboard: [
          [{ text: 'Меньше 18', callback_data: '2_0-18' }],
          [{ text: '18-25', callback_data: '2_18-25' }],
          [{ text: '25-35', callback_data: '2_25-35' }],
          [{ text: '35-50', callback_data: '2_35-50' }],
          [{ text: 'Старше 50', callback_data: '2_50-100' }],
        ]
      })
    };

bot.on('callback_query', function(msg){
    mass = msg.data.split('_');
    key = mass[0];
    data = mass[1];
    console.log(msg)

    //сделать сохранение в БД   
    switch(key){
        case '0':{ 
            switch(data){
                case 'accept':
                    let user;
                    userModel.findOne({userId:msg.from.id}).then(function(_user){
                        if(_user==null){
                            user = new userModel();
                            user.userId = msg.from.id;
                            user.chatId = msg.message.chat.id;
                            user.userName = msg.from.first_name;
                            user.questionare.accept = true;
                            user.lastMenu = "General";
                            user.portfel_alert = 3;
                            user.news_alert = 1;
                            user.save();
                        }
                        else {
                            _user.userId = msg.from.id;
                            _user.chatId = msg.message.chat.id;
                            _user.userName = msg.from.first_name;
                            _user.questionare.accept = true;
                            _user.lastMenu = "General";
                            _user.portfel_alert = 3;
                            _user.news_alert = 1;
                            _user.save();
                        }
                        bot.sendMessage(msg.message.chat.id, 'Укажите Ваш пол', reg1)
                    })
                    break;
                case 'not-accept':
                    bot.sendMessage(msg.message.chat.id, 'К сожалению, Вы не можете воспользоваться ботом.')
                    break;
                }
            }break;
        case '1':
            console.log(data)
            userModel.findOne({userId:msg.from.id}).then(function(_user){
                _user.questionare.sex = mass[1];
                _user.save();
                bot.sendMessage(msg.message.chat.id, 'Укажите Ваш возраст', reg2)
            });
            break;
        case '2':
            console.log(data)
            userModel.findOne({userId:msg.from.id}).then(function(_user){
                _user.questionare.age = mass[1];
                _user.save();
                bot.sendMessage(msg.message.chat.id, 'Спасибо за регистраицию! Что бы начать пользоваться ботом введите /start. Удалить свои персональные данные Вы можете в разделе "О программе"')
            });
        }
})