
//Setting up Google Authorization
  var clientId = '130554426228-5n2t4fcm2k9g977mvodfh9vo9591u69t.apps.googleusercontent.com';
  var apiKey = 'AIzaSyCeE7WUuVzyOQUlQuRuSZ5O_h_cw4MLn2k';
  var scopes = 'https://www.googleapis.com/auth/gmail.readonly';
  
  // Use a button to handle authentication the first time.
  function handleClientLoad() {
    gapi.client.setApiKey(apiKey);
    window.setTimeout(checkAuth,1);
  }

  function checkAuth() {
    gapi.auth.authorize({client_id: clientId, scope: scopes, immediate: true}, handleAuthResult);
  }

    function handleAuthResult(authResult) {
    var authorizeButton = document.getElementById('authorize-button');
    if (authResult && !authResult.error) {
      authorizeButton.style.visibility = 'hidden';
      makeApiCall();
    } else {
      authorizeButton.style.visibility = '';
      authorizeButton.onclick = handleAuthClick;
    }
  }

  function handleAuthClick(event) {
    gapi.auth.authorize({client_id: clientId, scope: scopes, immediate: false}, handleAuthResult);
    return false;
  }

//Set values inside an Angular scope.

  function change(name,value) {  
      var scope = angular.element($("#controllerTag")).scope();
      scope.$apply(function(){
        scope[name] = value;
    })
  }

  // Load the API and make an API call.  Display the results on the screen.
  function makeApiCall() {
      
      gapi.client.load('gmail','v1',function(){
        
        //Get User Profile
        var userProfileReq = gapi.client.gmail.users.getProfile({
            'userId':'me'
        }); 
          
        userProfileReq.execute(function(resp){
            var logInfo = document.getElementById('logInfo');
            logInfo.innerHTML = resp.emailAddress+'<br/>';
        });
        
        var spaces = [{"id":"space_1", "name":"Thesis"},
                     {"id":"space_2", "name":"Conference"}, 
                     {"id":"space_3","name":"Something Fun"}
                    ];
        change("spaces",spaces);
          
        //Get labels
        /*var userLabelReq = gapi.client.gmail.users.labels.list({
            'userId':'me'
        }); 
          
        userLabelReq.execute(function(resp){
            var labels = [];
            resp.labels.forEach(function(label){
                if(label.type == 'user'){
                    labels.push(label);
                }
            });
            change("labels",labels);
        });*/    
  });
      
}

/*function getAllThreads(labels){
    
    var scope = angular.element($("#controllerTag")).scope();
    var req1 = gapi.client.gmail.users.threads.list({
        'userId':'me'
     });
    req1.execute(function(resp){
        if(labels){
            labels.forEach(function(label,index){
                resp.result.threads.forEach(function(thread){
                var threadResp = gapi.client.gmail.users.threads.get({'userId':'me','id':thread.id});
                threadResp.execute(function(response){
                    var content = response.result;
                    var lastMsg = content.messages[(content.messages.length-1)];
                    console.log(lastMsg);
                    if(lastMsg.labelIds && lastMsg.labelIds[lastMsg.labelIds.length-1] == label.id){

                        var pushedThread = {"thread":thread};
                        pushedThread.lastMsg = {"msg":lastMsg,"header":{},"snippet":''};
                        pushedThread.lastMsg.snippet = lastMsg.snippet ? lastMsg.snippet : 'This message has no content';
                        if(lastMsg.payload){
                            lastMsg.payload.headers.forEach(function(header){
                                if(header.name == "Subject"){
                                    pushedThread.lastMsg.header.subject = header.value;
                                }else if(header.name == "From"){
                                    pushedThread.lastMsg.header.sender = header.value;
                                }
                            }); 
                    }else{
                        console.log("payload null");
                    }
                        scope.$apply(function(){
                            scope["userSpaces"][index]["threads"].push(pushedThread);
                        })
                    }
                    
                });
            });
            });
        }    
    })
}*/

function getAllThreads1(spaces){
    
    var scope = angular.element($("#controllerTag")).scope();
    var req1 = gapi.client.gmail.users.threads.list({
        'userId':'me'
     });
    req1.execute(function(resp){
    
        spaces.forEach(function(space,index){
            resp.result.threads.forEach(function(thread){
            var threadResp = gapi.client.gmail.users.threads.get({'userId':'me','id':thread.id});
            threadResp.execute(function(response){
                var content = response.result;
                var lastMsg = content.messages[(content.messages.length-1)];
                if(lastMsg.payload){
                    lastMsg.payload.headers.forEach(function(header){
                        if((header.name == "Email-To-Space") && header.value == space.id){
                            console.log(lastMsg);
                            var pushedThread = {"thread":thread};
                            pushedThread.lastMsg = {"msg":lastMsg,"header":{},"snippet":''};
                            pushedThread.lastMsg.snippet = lastMsg.snippet ? lastMsg.snippet : 'This message has no content';
                            
                            if(lastMsg.labelIds.indexOf("UNREAD") !== -1){
                                pushedThread.lastMsg.messageStatus = "UNREAD";
                            }else{
                                pushedThread.lastMsg.messageStatus = "READ";
                            }
                            
                            //Retrieve the message body
                            if(lastMsg.payload.body){
                                pushedThread.lastMsg.body = atob(lastMsg.payload.body.data);
                            }
                            
                            lastMsg.payload.headers.forEach(function(header){
                            if(header.name == "Subject"){
                                pushedThread.lastMsg.header.subject = header.value;
                            }else if(header.name == "From"){
                                pushedThread.lastMsg.header.sender = header.value;
                            }else if (header.name == "Date"){
                                pushedThread.lastMsg.header.date = header.value.split(" ",3).join(" ");
                            }
                            });
                            scope.$apply(function(){
                                scope["userSpaces"][index]["threads"].push(pushedThread);
                            });
                        }
                    });
                    
                }
            });
        });
        });
            
    })
}

//Sending Messages
function sendMessage(emailMsg) {
    
    /*require(["js/lib/bundle.js"],function(boop){
        var mailcomposer = boop();
        mailcomposer.setMessageOption({
            from: "welcome.easymail@gmail.com",
            to: "welcome.easymail@gmail.com",
            body: "Hello Xi",
            html: "<b>Hello Xi+</b><i>From the Easymail Team</i>" 
        });
        mailcomposer.buildMessage(function(err, emailStr){
        //console.log(err || emailStr);
        var base64EncodedEmail = btoa(emailStr).replace(/\+/g, '-').replace(/\//g, '_');
        console.log(base64EncodedEmail);
        var request = gapi.client.gmail.users.messages.send({
            'userId': 'me',
            'resource': {//Here should be resource not message!!!!!!!
            'raw': base64EncodedEmail
            }
        });
        request.execute(function(status){
            console.log("Email sent!");
        });
    }); 
        
});*/
    
    require(["js/lib/bundle.js"],function(boop){
        var mailcomposer = boop();
        mailcomposer.setMessageOption({
            from: emailMsg["from"],
            to: emailMsg["to"],
            subject: emailMsg["subject"],
            body: emailMsg["body"]
            //,html: "<b>"+emailMsg["body"]+"</b>"+"<i>From the Easymail Team</i>" 
        });
        mailcomposer.addHeader("email-to-space",emailMsg["space"]);
        mailcomposer.buildMessage(function(err, emailStr){
        //console.log(err || emailStr);
        var base64EncodedEmail = btoa(emailStr).replace(/\+/g, '-').replace(/\//g, '_');
        var request = gapi.client.gmail.users.messages.send({
            'userId': 'me',
            'resource': {//Here should be resource not message!!!!!!!
            'raw': base64EncodedEmail
            }
        });
        request.execute(function(status){
            alert("Email sent!");
        });
    }); 
        
});
}

//Function Mark the message as read
function markAsRead(message){
    message.messageStatus = "READ";
    if(message.msg.labelIds.indexOf("UNREAD")!==-1){
        var request = gapi.client.gmail.users.messages.modify({
            'userId': 'me',
            'id':message.msg.id,
            'removeLabelIds': ['UNREAD']
        });
        request.execute(function(status){
            console.log("marked as read");
        });
    }
}


