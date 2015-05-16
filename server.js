var express = require("express");
var mysql = require("mysql");
var app = express();
app.use(express.static('public'));
var bodyParser = require('body-parser')
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

var MailComposer = require("mailcomposer").MailComposer;
var URLSafeBase64 = require('urlsafe-base64');
var fs = require("fs");
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

app.get('/sendMessage',function(req,res){
    var mailcomposer = new MailComposer();
    var emailMsg = JSON.parse(req.query.emailMsg),
        activeSpace = JSON.parse(req.query.activeSpace),
        fairySelected = JSON.parse(req.query.fairySelected),
        groupSelected = JSON.parse(req.query.groupSelected),
        attachedGroup = JSON.parse(req.query.attachedGroup),
        emailToSpace = req.query.emailToSpace,
        attachedFairy = JSON.parse(req.query.attachedFairy.split(','));
    
    var messageBody = emailMsg["body"].replace(/\r?\n/g, '<br />');
    var recipients = emailMsg['to'].split(';');
            mailcomposer.setMessageOption({
                from: emailMsg["from"],
                to: recipients,
                subject: emailMsg["subject"],
                //body: emailMsg["body"]
                html:messageBody
            });
            if(activeSpace){
                mailcomposer.addHeader("email-from-space",activeSpace);
            }else{
                mailcomposer.addHeader("email-from-space","");     
            }
            
            mailcomposer.addHeader("email-to-space",emailMsg['space']);
            var fairyVal = {"state":false,"space":[],"attachedFairy":attachedFairy,"group":false,"groupName":""};
            if (fairySelected){
                fairyVal.state=true;       
            }
            if(groupSelected){
                console.log("please don't come here");
                fairyVal.space = attachedGroup.spaces; 
                fairyVal.group = true;
                fairyVal.groupName = attachedGroup.groupName;
            }else{
                fairyVal.space.push(activeSpace); 
            }
            mailcomposer.addHeader("space-fairy",fairyVal); 
            if(emailMsg.reply){
                mailcomposer.setMessageOption({
                    inReplyTo:emailMsg.inReplyTo,
                    references:emailMsg.references
                });
            }
            /*//Adding attchment
            var attachment1 = {
                fileName: "photo2.jpg",
                filePath:"public/attch/photo2.jpg",
            };  
            var attachment2 = {
                fileName: "nycphoto1.jpg",
                filePath:"public/attch/nycphoto1.jpg",
            };
            var attachment3 = {
                fileName: "guidance_frenchfood.pdf",
                filePath:"public/attch/guidance_frenchfood.pdf",
            };
    
            mailcomposer.addAttachment(attachment1);
            mailcomposer.addAttachment(attachment3);*/
    
            if(emailMsg.attached.length){
                emailMsg.attached.forEach(function(attachedFile){
                    var attachment = {
                        fileName: attachedFile,
                        filePath:"public/attch/"+attachedFile,
                    };
                    mailcomposer.addAttachment(attachment);
                });
            }
    
            mailcomposer.buildMessage(function(err, emailStr){
            //console.log(emailStr);
            //var base64EncodedEmail = btoa(emailStr).replace(/\+/g, '-').replace(/\//g, '_');
            var base64EncodedEmail = URLSafeBase64.encode(new Buffer(emailStr.trim()));
            res.end(base64EncodedEmail);
        });             
});

app.get('/safeDecode',function(req,res){
    var decoded = URLSafeBase64.decode(req.query.encoded);
    res.end(decoded);
});

app.post('/decodeToFile',function(req,res){
    //console.log(req);
    var decoded = URLSafeBase64.decode(req.body.encoded);
    fs.stat('public/attachments/'+req.body.filename, function(err, stat) {
        if(err == null) {
            
        } else if(err.code == 'ENOENT') {
            fs.writeFile ('public/attachments/'+req.body.filename,decoded);
        } else {
            console.log('Some other error: ', err.code);
        }
    });
    //fs.writeFile ('public/attachments/'+req.body.filename,decoded);
    res.end(decoded);
});

app.get('/',function(req,res){
    res.sendFile('index.html');
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
   
    var group=req.query.groupId;
    
    var fairyId = req.query.fairy;
    if(fairyId !== '-1'){
        
        var post = {id:spaceId,name:spaceName,user:emailAddress,fairy:fairyId,groupId:group};
        dbconnection.query("INSERT into spaces SET ?",post,function(error,rows){
            if(error){
                console.log("Problem with MYSQL "+ error);
            }else {
                res.end(JSON.stringify(rows));
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
                var post = {id:spaceId,name:spaceName,user:emailAddress,fairy:fairyId,groupId:group};
                dbconnection.query("INSERT into spaces SET ?",post,function(error,rows){
                    if(error){
                        console.log("Problem with MYSQL "+ error);
                    }else {
                        res.end(JSON.stringify(rows));
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
});

app.get('/updateSpace*',function(req,res){
    
    dbconnection.query("SELECT fairy from spaces WHERE uniqId='"+req.query.uniqId+"'",function(error,rows){
        if(error){
            console.log("Problem with MYSQL "+ error);
        }else {
            var newFairyVal = rows[0].fairy + ','+req.query.fairyId;
            var newQuery = "UPDATE spaces SET fairy='"+newFairyVal+"' WHERE uniqId='"+req.query.uniqId+"'";
            dbconnection.query(newQuery,function(error,rows){
                if(error){
                    console.log("Problem with MYSQL "+ error);
                }else {
                    res.end();
                }
            })
        }
    })
});

app.get('/updateGroupVal*',function(req,res){
    
    var groupId = req.query.option=='insert'? req.query.groupId : -1;
    var newQuery = "UPDATE spaces SET groupId='"+groupId+"' WHERE uniqId='"+req.query.uniqId+"'";
    dbconnection.query(newQuery,function(error,rows){
        if(error){
            console.log("Problem with MYSQL "+ error);
        }else {
            res.end();
        }
    })
});
app.get('/updateGroupTable*',function(req,res){
     
    dbconnection.query("SELECT spaces from groups WHERE id='"+req.query.groupId+"'",function(error,rows){
        if(error){
            console.log("Problem with MYSQL "+ error);
        }else {
            if (req.query.option=='insert'){
                var newSpaceVal = rows[0].spaces=="" ? (req.query.uniqId) : (rows[0].spaces + ','+req.query.uniqId);
            }else{
                if(rows[0].spaces!==""){
                    var spaceArray = rows[0].spaces.split(',');
                    var removedIndex = spaceArray.indexOf(req.query.uniqId);
                    spaceArray.splice(removedIndex,1);
                    var newSpaceVal = spaceArray.join();
                }
                
            }
            var newQuery = "UPDATE groups SET spaces='"+newSpaceVal+"' WHERE id='"+req.query.groupId+"'";
            dbconnection.query(newQuery,function(error,rows){
                if(error){
                    console.log("Problem with MYSQL "+ error);
                }else {
                    res.end();
                }
            })
        }
    })
});

app.get('/getLastId*',function(req,res){
    dbconnection.query("SELECT LAST_INSERT_ID()",function(error,rows){
            if(error){
                console.log("Problem with MYSQL "+ error);
            }else {
                console.log(rows[0]['LAST_INSERT_ID()']);
                res.end(JSON.stringify(rows[0]['LAST_INSERT_ID()']));
            }
        })
});

app.get('/getGroups*',function(req,res){
    var emailAddress = req.query.user;
    var newQuery = "SELECT * from groups where user='"+emailAddress+"'";
    
    dbconnection.query(newQuery,function(error,rows){
        if(error){
            console.log("Problem with MYSQL "+ error);
        }else {
            res.end(JSON.stringify(rows));
        }
    })
});

app.get('/getUsers*',function(req,res){
    var newQuery = "SELECT * from users";
    
    dbconnection.query(newQuery,function(error,rows){
        if(error){
            console.log("Problem with MYSQL "+ error);
        }else {
            res.end(JSON.stringify(rows));
        }
    })
});

app.get('/getFairies*',function(req,res){
    var newQuery = "SELECT * from fairies";
    
    dbconnection.query(newQuery,function(error,rows){
        if(error){
            console.log("Problem with MYSQL "+ error);
        }else {
            res.end(JSON.stringify(rows));
        }
    })
});

app.get('/addGroup*',function(req,res){
    
    var emailAddress = req.query.user;
    var groupName = req.query.groupName;
    var spaces = req.query.spaces;
    
    var post = {name:groupName,spaces:spaces,user:emailAddress};
    dbconnection.query("INSERT into groups SET ?",post,function(error,rows){
        if(error){
            console.log("Problem with MYSQL "+ error);
        }else {
            res.end();
        }
    });
});

