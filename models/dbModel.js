var url = '';
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var db = mongoose.connect(url)//конектимсся к БД
var conn = mongoose.connection;
var fs = require('fs');

function checkMenu(msg, user, context){
    let tags = context.getTags();
    if(context.name == msg.text)
        return true;
    for(let i=0; i<tags.length; i++){
        if(tags[i] == user.lastMenu)
            return true;
    }
    return false;
}

module.exports.checkMenu = checkMenu;
module.exports.db = db;
module.exports.fs = fs;
module.exports.url = url;