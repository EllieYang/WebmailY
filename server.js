var express = require("express");
var mysql = require("mysql");
var app = express();
app.use(express.static('public'));
var bodyParser = require('body-parser')
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

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

app.get('/load*',function(req,res){
    var emailAddress = req.query.user;
    console.log(emailAddress);
    var newQuery = "SELECT * from spaces where user='"+emailAddress+"'";
    
    dbconnection.query(newQuery,function(error,rows){
        if(error){
            console.log("Problem with MYSQL "+ error);
        }else {
            res.end(JSON.stringify(rows));
        }
    })
});
app.get('/addSpace*',function(req,res){
    
    var emailAddress = req.query.user;
    var spaceId = req.query.spaceId;
    var spaceName = req.query.spaceName;
    var spaceSub="";
    console.log(req.query.subSpace);
    if(JSON.parse(req.query.subSpace)){
        var subList = JSON.parse(req.query.subSpace);
        subList.forEach(function(sub,index){
            if(index==(subList.length-1)){
                spaceSub += sub.name;
            }else{
                spaceSub += sub.name+",";
            }
        });
    }
    var post = {id:spaceId,name:spaceName,subSpace:spaceSub,user:emailAddress};
    dbconnection.query("INSERT into spaces SET ?",post,function(error,rows){
        if(error){
            console.log("Problem with MYSQL "+ error);
        }else {
            res.end();
        }
    });
});
app.get('/removeSpace*',function(req,res){
    
    var newQuery = "DELETE from spaces where name='"+req.query.spaceName+"'";
    
    dbconnection.query(newQuery,function(error,rows){
        if(error){
            console.log("Problem with MYSQL "+ error);
        }else {
            res.end();
        }
    })
})


