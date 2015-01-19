webmaily.controller("mailController",function($scope){
    
    $scope.login = function() {
        //googleLogin.login();
    };
      //Setting up Google Authorization
//      var clientId = '130554426228-5n2t4fcm2k9g977mvodfh9vo9591u69t.apps.googleusercontent.com';
//      var apiKey = 'AIzaSyCeE7WUuVzyOQUlQuRuSZ5O_h_cw4MLn2k';
//      var scopes = 'https://www.googleapis.com/auth/gmail.readonly';

      // Use a button to handle authentication the first time.
    $scope.handleClientLoad = function() {
        gapi.client.setApiKey(apiKey);
        window.setTimeout(checkAuth,1);
      }

    $scope.checkAuth = function() {
        gapi.auth.authorize({client_id: clientId, scope: scopes, immediate: true}, handleAuthResult);
      }

    $scope.handleAuthResult = function (authResult) {
        var authorizeButton = document.getElementById('authorize-button');
        if (authResult && !authResult.error) {
          authorizeButton.style.visibility = 'hidden';
          makeApiCall();
        } else {
          authorizeButton.style.visibility = '';
          authorizeButton.onclick = handleAuthClick;
        }
      }

    $scope.handleAuthClick = function(event) {
        gapi.auth.authorize({client_id: clientId, scope: scopes, immediate: false}, handleAuthResult);
        return false;
      }

      // Load the API and make an API call.  Display the results on the screen.
    $scope.makeApiCall = function() {
          
          gapi.client.load('gmail','v1',function(){
            var request = gapi.client.gmail.users.messages.list({
                'userId':'me'
            });
            request.execute(function(resp){
                var textNode = document.createElement('p');
                var senderList = document.createElement('div');
                var bodyData = document.createElement('div');
                resp.messages.forEach(function(message){
                    var emailMessage = gapi.client.gmail.users.messages.get({'userId':'me','id':message.id});
                    emailMessage.execute(function(content){
                        if(content.payload == null){
                            console.log("payload null");
                        }else {
                            content.payload.headers.forEach(function(header){
                                if(header.name == "Subject"){
                                    console.log(header.value);
                                    textNode.innerHTML += header.value+'<br/>';
                                }
                            }); 
                            content.payload.headers.forEach(function(header){
                                if(header.name == "From"){
                                    console.log(header.value);
                                    senderList.innerHTML += header.value+'<br/>';
                                }
                            });
                            console.log (content);
                            var bodyVal;
                            if (content.payload.mimeType == 'text/html' || content.payload.mimeType == 'text/plain'){
                                bodyVal = Base64.decode(content.payload.body.data.replace(/\-/g, '+').replace(/\_/g, '/'));
                                
                            }else if(content.payload.mimeType == 'multipart/alternative'){
                                bodyVal = Base64.decode(content.payload.parts[1].body.data.replace(/\-/g, '+').replace(/\_/g, '/'));
                                
                            }
                            bodyData.innerHTML += bodyVal;
                        }
                        
                    });
                });
                document.getElementById("content").appendChild(textNode);
                document.getElementById("content").appendChild(senderList);
                document.getElementById("content").appendChild(bodyData);
            });
          });
      }
    //invokes the handleClientLoad() method
    $scope.login();
});