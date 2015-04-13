var webmaily = angular.module('webmaily',[]);
webmaily.directive('spaceOverview', function() {
  return {
      restrict: 'AE',
      link: function(scope, elem, attrs) {
            elem.bind('click',function(){
                scope.activeSpaceIndex = attrs['pageno']-1;
                $("#activeSpaceIndex").val(scope.activeSpaceIndex);
                scope.$apply();
              });
          
            var deleteBtn = elem.children(".deleteSpace");
            deleteBtn.unbind('click');//This solves the problem where the click event is fired multiple times
            deleteBtn.bind('click',function(event){
                event.stopPropagation();
                event.preventDefault();
                var confirmMsg = confirm("Are you sure to delete the space?");
                if (confirmMsg == true) {
                    //var index = $(this).parent().data('pageno')-1;
                    //console.log(index);
                    //HRERE SUPPOSE TO BE DATABASE INTERACTION. FOR NOW IT'S ONLY SPACES
                    //**************DATABASE***********************
                    //var currentScopeList = scope.spaces;
                    //currentScopeList.splice(index,1);
                    //scope.spaces = currentScopeList;
                    //scope.$apply();
                    scope.removeSpace(scope.activeUser,$(this).data('spacename'));
                } else {
                    
                }
                //return false;
            });
    }
  };
});

webmaily.factory('GmailAPIService',function(){

    //Setting up Google Authorization
    var clientId = '130554426228-5n2t4fcm2k9g977mvodfh9vo9591u69t.apps.googleusercontent.com';
    var apiKey = 'AIzaSyCeE7WUuVzyOQUlQuRuSZ5O_h_cw4MLn2k';
    var scopes = 'https://www.googleapis.com/auth/gmail.compose';
   
    // Use a button to handle authentication the first time.
    var handleClientLoad = function () {
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
    
    // Load the API and make an API call.  Display the results on the screen.
    function makeApiCall() {
    
        gapi.client.load('gmail','v1',function(){
            
            //Get User Profile
            var userProfileReq = gapi.client.gmail.users.getProfile({
                'userId':'me'
            }); 
            userProfileReq.execute(function(resp){
                //var logInfo = document.getElementById('logInfo');
                //logInfo.innerHTML = resp.emailAddress+'<br/>';
                $("#logInfo").val(resp.emailAddress);
                var scope = angular.element($("#controllerTag")).scope();
                scope.getSpaces(resp.emailAddress);
                getAllThreads();
            });
        });
    }
    
    function getAllThreads(){
        //var allThreads=[];
        var scope = angular.element($("#controllerTag")).scope();
        var req = gapi.client.gmail.users.threads.list({
            'userId':'me'
         });
        req.execute(function(resp){
            
               
                resp.result.threads.forEach(function(thread){
                    var threadResp = gapi.client.gmail.users.threads.get({'userId':'me','id':thread.id});
                    threadResp.execute(function(response){
                        scope["allThreads"].push(response);
                    });
            });
            
            
        });
    }
    
    var getAllThreads1 = function (spaces){
        
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
                    if(lastMsg.labelIds){
                        if(lastMsg.labelIds[0]=="INBOX"){
                    if(lastMsg.payload){
                        
                        lastMsg.payload.headers.forEach(function(header){
                            
                            //if((header.name == "Email-To-Space") && header.value == space.id){
                            if(header.name == "Email-To-Space"){
                               if (header.value == space.name){
                                //console.log(lastMsg);
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
                               }else{//There are messages that do not match any space.
                                   lastMsg.payload.headers.forEach(function(header){
                                        if((header.name == "Space-Fairy") && JSON.parse(header.value).state == true){
                                            //console.log(header.value);
//                                            JSON.parse(header.value).state == false;
//                                            console.log(lastMsg);
//                                            var currentSpaceList = scope.spaces;
//                                            var newSpace = JSON.parse(header.value).space;
//                                            newSpace.id='space_request';
//                                            currentSpaceList.splice(0,0,newSpace);
                                            //console.log(currentSpaceList);
                                           // scope.spaces = currentSpaceList;   
                                        }
                                   });
                                  
                               }   
                            }
                        });
                        
                    }
                }
                    }
                });
            });
            });
                
        })
    };
    
    //Sending Messages
    var sendMessage = function (emailMsg,activeSpace,fairySelected) { 
        
        require(["js/lib/bundle.js"],function(boop){
            var mailcomposer = boop();
            mailcomposer.setMessageOption({
                from: emailMsg["from"],
                to: emailMsg["to"],
                subject: emailMsg["subject"],
                body: emailMsg["body"]
                //,html: "<b>"+emailMsg["body"]+"</b>"+"<i>From the Easymail Team</i>" 
            });
            mailcomposer.addHeader("email-to-space",activeSpace.name);
            mailcomposer.addHeader("email-from-space",activeSpace);
            var fairyVal = {"state":false,"space":{}};
            if (fairySelected){
                fairyVal.state=true;
                fairyVal.space = activeSpace;
                
            }
                        
            mailcomposer.addHeader("space-fairy",angular.toJson(fairyVal));
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
    };
    
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

    return {
      getAllThreads:getAllThreads,
      getAllThreads1: getAllThreads1,
      handleClientLoad:handleClientLoad,
      sendMessage:sendMessage
    };
}
);

