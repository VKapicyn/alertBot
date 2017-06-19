var mongoose = require('mongoose');
var googleFinance = require('google-finance2');

var News = new mongoose.Schema({
    ticker: String,
    date: String,
    update: Number
})
var newsModel = mongoose.model('News', News);

function update(users, ticker, bot){
    googleFinance.companyNews({
        symbol: ticker
    }, function (err, news) {
        newsModel.findOne({ticker:ticker}).then(function(last_news){ 
            news.sort((a,b) => {
                return a.date-b.date;
            }) 
            if (last_news!=null) {
                if(last_news.ticker.toLowerCase() == ticker.toLowerCase()){
                    if(last_news.date != news[news.length-1]['date']){
                        last_news.date = news[news.length-1]['date'];
                        ++last_news.update;
                        let _news = 'Опубликована новость по '+ticker
                        _news +='\n'+ news[news.length-1]['link']
                        sendMess(users, _news, bot)
                        last_news.save()
                    }
                }        
            } else {
                let _news = new newsModel();
                _news.ticker = ticker
                _news.date = news[news.length-1]['date']
                _news.update = 0
                _news.save();
            }
        })
    })
}

function sendMess(users, news, bot){
    users.map(user => {
        bot.sendMessage(user.chatId, news)
    })
}

module.exports.newsModel = newsModel;
module.exports.update = update;