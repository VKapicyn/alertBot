//General
var bot = require('../app.js').bot
var checkMenu = require('../models/dbModel').checkMenu;
var portfels = require('../controllers/portfels.js'); 
var alerts = require('../controllers/alerts.js'); 
var quotations = require('../controllers/quotations.js')
var news = require('../controllers/news.js'); 
var admin = require('../controllers/admin.js');
var settings =  require('../controllers/settings.js');
var userModel = require('../models/userModel.js').userModel;
var reg0 = {
    reply_markup: JSON.stringify({
        inline_keyboard: [
          [{ text: 'Согласен', callback_data: '0_accept' }],
          [{ text: 'Не согласен', callback_data: '0_not-accept' }]
        ]
    })
}
var mainMenu = {
    reply_markup: JSON.stringify({
    "keyboard": [[portfels.name, quotations.name], ['📰 Новости', '⏰ Оповещения'], ['🔧 Настройки', '☎ О нас']], 
    "one_time_keyboard": true,
    "force_replay": true,
    "resize_keyboard": true
    })
}

bot.on('message', function (msg) {
    mainOnStart(msg)
})


//Переделать роутинг более лаконично (через фабрику)
function mainOnStart(msg){
    userModel.findOne({userId: msg.from.id}).then(function(user){
        if(user != null && user.questionare.accept == "true"){
            //console.log(user.lastMenu)
            //портфели
            if (checkMenu(msg, user, portfels)){
                portfels.portfelOnStart(msg, user)
            }
            else if (checkMenu(msg, user, quotations)){
                quotations.quotationsOnStart(msg, user)
            }
            else if (checkMenu(msg, user, news)){
                news.newsOnStart(msg, user)
            }
            else if (checkMenu(msg, user, alerts)){
                require('../controllers/alerts.js').alertsOnStart(msg, user)
            }
            else if (checkMenu(msg, user, settings)){
                //TODO
                settings.OnStart(msg, user)
                //bot.sendMessage(msg.chat.id, '⚙ Данный раздел находится в стадии разработки. \n\nМы сразу сообщим, как только он будет готов :)\n');
            }
            else if (msg.text == '☎ О нас'){
                bot.sendMessage(msg.chat.id, 'Спасибо Вам за использование нашего бота!\n\n'
                +'📩 @VKapicyn Мы всегда готовы услышать отзывы и предложения\n'
                +'🗂 В данном разделе Вы всегда сможете увидеть ссылки на все наши проекты.\n'
                +'⚙ Также, мы разрабатываем серию ботов по финансовой сфере и готовы услышать ваши идеи.\n'
                +'📅 А пока, у нас готовы следующие проеты:\n\n'
                +'📜 @alor_iis_bot - консультант по счетам ИИС');
            }
            else if (checkMenu(msg, user, admin)){
                if (user.admin)
                    require('../controllers/admin.js').OnStart(msg, user)
                else
                    bot.sendMessage(msg.chat.id, 'Нет доступа')
            }
            else {
                bot.sendMessage(msg.chat.id, user.userName + ', что будем делать?', mainMenu)
                user.lastMenu = "General"
                user.save();
            }  
        }
	    else if(msg.text=='/reg'){
            require('../controllers/reg.js')
            bot.sendMessage(msg.chat.id, 'Подтвердите свое согласние на обработку данных', reg0);
        } else {
            bot.sendMessage(msg.chat.id, 'Вы впервые воспользовались нашим ботом. Для того что бы начать работу, необходимо зарегистрироваться, для этого введите /reg в чате.')
        }
    })
}

module.exports.mainOnStart = mainOnStart;
