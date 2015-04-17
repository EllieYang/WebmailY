var express = require("express");
var mysql = require("mysql");
var app = express();
app.use(express.static('public'));
var bodyParser = require('body-parser')
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

var server = app.listen(9001,'0.0.0.0',function(){
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
    var newQuery = "SELECT * from spaces where level=0 && user='"+emailAddress+"'";
    
    dbconnection.query(newQuery,function(error,rows){
        if(error){
            console.log("Problem with MYSQL "+ error);
        }else {
            res.end(JSON.stringify(rows));
        }
    })
});

app.get('/loadAllSpaces*',function(req,res){
    var emailAddress = req.query.user;
    var newQuery = "SELECT * from spaces where user='"+emailAddress+"'";
    
    dbconnection.query(newQuery,function(error,rows){
        if(error){
            console.log("Problem with MYSQL "+ error);
        }else {
            res.end(JSON.stringify(rows));
        }
    })
});

app.get('/addFairy*',function(req,res){
    
    var emailAddress = req.query.user;
    var post = {owner:emailAddress};
    dbconnection.query("INSERT into fairies SET ?",post,function(error,rows){
        if(error){
            console.log("Problem with MYSQL "+ error);
        }else {
            res.end();
        }
    });
});

app.get('/addSpace*',function(req,res){
    
    var emailAddress = req.query.user;
    var spaceId = req.query.spaceId;
    var spaceName = req.query.spaceName;
    var spaceSub="";
    //var fairyId = req.query.fairy;
    var level = req.query.level;
    
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
    var fairyId = req.query.fairy;
    console.log((fairyId<0));
    if(fairyId !== '-1'){//
        //var fairyId = req.query.fairy;
        console.log(fairyId);
        var post = {id:spaceId,name:spaceName,subSpace:spaceSub,user:emailAddress,level:level,fairy:fairyId};
        dbconnection.query("INSERT into spaces SET ?",post,function(error,rows){
            if(error){
                console.log("Problem with MYSQL "+ error);
            }else {
                res.end();
            }
        });
        
    }else{
        var fairyId = 0;
        dbconnection.query("SELECT LAST_INSERT_ID()",function(error,rows){
            if(error){
                console.log("Problem with MYSQL "+ error);
            }else {
                var data = rows;
                fairyId = data[0]['LAST_INSERT_ID()'];
                //res.end(JSON.stringify(rows));
                var post = {id:spaceId,name:spaceName,subSpace:spaceSub,user:emailAddress,level:level,fairy:fairyId};
                dbconnection.query("INSERT into spaces SET ?",post,function(error,rows){
                    if(error){
                        console.log("Problem with MYSQL "+ error);
                    }else {
                        res.end();
                    }
                });
            }
        })
    }
    
    
    
    
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

app.get('/getLastId*',function(req,res){
    var emailAddress = req.query.user;
    var newQuery = "SELECT LAST_INSERT_ID()";
    
    dbconnection.query(newQuery,function(error,rows){
        if(error){
            console.log("Problem with MYSQL "+ error);
        }else {
            res.end(JSON.stringify(rows));
        }
    })
});

