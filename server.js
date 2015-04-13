var express = require("express");
var mysql = require("mysql");
var app = express();
app.use(express.static('public'));

var server = app.listen(9001,function(){
    var host = server.address().address;
    var port = server.address().port;
    console.log("It's started on "+host+" at port "+port);
})

var dbconnection = mysql.createConnection({
    host:"127.0.0.1",
    user:'root',
    password:'root',
    database: 'testing'
});

dbconnection.connect(function(error){
    if(error){
        console.log(error);
    }else{
        console.log("Connected with Database");
    }
});

app.get('/',function(req,res){
    res.sendFile('index.html');
});

app.get('/load',function(req,res){
    dbconnection.query("SELECT * from users",function(error,rows){
        if(error){
            console.log("Problem with MYSQL "+ error);
        }else {
            res.end(JSON.stringify(rows));
        }
    })
})


