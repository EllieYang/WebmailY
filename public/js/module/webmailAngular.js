var webmaily = angular.module('webmaily',[]);
/*webmaily.config(['$routeProvider','$locationProvider',
                function($routeProvider,$locationProvider){
                    $routeProvider.when('/',{
                        templateUrl: 'template/inbox.html'
                    })
                    .when('/spaceSetting',{
                        templateUrl: 'template/spaceSetting.html'
                    })
                    .otherwise({
                        templateUrl: 'template/inbox.html'
                    });
                    $locationProvider.html5Mode(true);
                }]);*/
webmaily.directive('spaceOverview', function() {
  return {
      restrict: 'AE',
      link: function(scope, elem, attrs) {
            elem.bind('click',function(){
                //$("#spaceOverview").show();
                //$("#composeBtn").show();
                $("#spaceOverview").css('visibility','visible');
                $("#composeBtn").css('visibility','visible');
                
                scope.activeSpaceIndex = attrs['pageno']-1;
                $("#activeSpaceIndex").val(scope.activeSpaceIndex);
                scope.activeSpace = scope.spaces[scope.activeSpaceIndex];
                scope.$apply();
              });
          
            var deleteBtn = elem.children(".deleteSpace");
            deleteBtn.unbind('click');//This solves the problem where the click event is fired multiple times
            deleteBtn.bind('click',function(event){
                event.stopPropagation();
                event.preventDefault();
                var confirmMsg = confirm("Are you sure to delete the space?");
                if (confirmMsg == true) {
                    scope.removeSpace(scope.activeUser,$(this).data('spacename'));
                } else {
                    
                }
                //return false;
            });
    }
  };
});

webmaily.directive('backInbox', function() {
  return {
      restrict: 'A',
      link: function(scope, elem, attrs) {
       
        elem.bind('click',function(event){
            event.stopPropagation();
            event.preventDefault();
            scope.activeSpaceIndex = -1;
            $("#activeSpaceIndex").val(scope.activeSpaceIndex);
            scope.activeSpace = scope.spaces[scope.activeSpaceIndex];
            scope.$apply();
          });
    }
  };
});

webmaily.directive('saveSetting', function() {
  return {
      restrict: 'A',
      link: function(scope, elem, attrs) {
        elem.bind('click',function(){
            alert("change saved!");
          });
    }
  };
});

webmaily.directive('expirydateSetting', function() {
  return {
      restrict: 'A',
      link: function(scope, elem, attrs) {
        elem.bind('click',function(){
           
        });
          
    }
  };
});

webmaily.factory('GmailAPIService',function(){

    //Setting up Google Authorization
    var clientId = '130554426228-5n2t4fcm2k9g977mvodfh9vo9591u69t.apps.googleusercontent.com';
    var apiKey = 'AIzaSyCeE7WUuVzyOQUlQuRuSZ5O_h_cw4MLn2k';
    var scopes = 'https://mail.google.com/';
   
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
        scope.$apply();
        
    }    
    //Sending Messages
    var sendMessage = function (emailMsg,activeSpace,fairySelected,emailToSpace,attachedFairy) { 
        
        require(["js/lib/bundle.js"],function(boop){
            var mailcomposer = boop();
            var recipients = emailMsg['to'].split(';');
            mailcomposer.setMessageOption({
                from: emailMsg["from"],
                to: recipients,
                //to: ['frank.taylor.testing@gmail.com','alice.taylor.testing@gmail.com'],
                subject: emailMsg["subject"],
                body: emailMsg["body"]
                //,html: "<b>"+emailMsg["body"]+"</b>"+"<i>From the Easymail Team</i>" 
            });
            if(activeSpace){
                mailcomposer.addHeader("email-from-space",activeSpace);
            }else{
                mailcomposer.addHeader("email-from-space","");     
            }
            mailcomposer.addHeader("email-to-space",emailMsg['space']);
            var fairyVal = {"state":false,"space":{},"attachedFairy":attachedFairy};
            if (fairySelected){
                fairyVal.state=true;       
            }
            fairyVal.space = activeSpace;  
            mailcomposer.addHeader("space-fairy",fairyVal); 
            if(emailMsg.reply){
               //mailcomposer["threadId"] = emailMsg.threadId;
                mailcomposer.addHeader("In-Reply-To",emailMsg.inReplyTo);
                //mailcomposer.addHeader("References",emailMsg.inReplyTo);
                mailcomposer.setMessageOption({
                    inReplyTo:emailMsg.inReplyTo,
                    references:emailMsg.references,
                });
            }
            
            mailcomposer.buildMessage(function(err, emailStr){
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
    var markAsRead = function(message){
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
      handleClientLoad:handleClientLoad,
      sendMessage:sendMessage,
      markAsRead:markAsRead
    };
}
);

