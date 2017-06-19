var mongoose = require('mongoose');

var User = new mongoose.Schema({
    userId: Number,
    chatId: Number,
    userName: String,
    questionare: {
        accept: String,
        sex: String,
        age: String
    },
    lastMenu: String,
    portfel: [{
        ticker: String,
        count: Number,
        price: Number,
        usdrub: Number
    }],
    alerts:[{
        ticker: String,
        price: String
    }],
    buffer: Number,
    ticker_buffer: Number,
    ta_buffer: String,
    portfel_alert: Number,//0 не оповещать, 1 утром, 2 вечером, 3 утром и вечером
    news_alert: Number,//0 не оповещать, не оповещать
    macro_alert: Number
})
var userModel = mongoose.model('User', User);
module.exports.userModel = userModel;

exports.regUser = function(userInfo){

}
