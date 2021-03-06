var mongoose = require('mongoose');
var request = require('request')

var Alerts = new mongoose.Schema({
    ticker: String,
    users: [String]
})

function getPrice(ticker){
    return new Promise((res, rej) => {
        request({
            url: 'https://www.google.com/finance/getprices?q='+ticker+'&i=900&p=1d&f=h,l',
            json: true
            }, 
            function (error, response, body) {
                if (!error && response.statusCode === 200) {
                    body = body.split('\n');
                    //console.log(body)
                    if (body.length<8 || body[7]=='')
                        res(false)
                    else
                    {
                        //console.log(body.length)
                        body = body[body.length-2].split(',')
                        res({high:body[0], low:body[1]})
                    }
                }
                else {
                    res(false)
                } 
        });
    })
}
var alertsModel = mongoose.model('Alerts', Alerts);
module.exports.alertsModel = alertsModel;
module.exports.getPrice = getPrice;