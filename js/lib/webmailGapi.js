  
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

  //Set values inside an Angular scope.
  function change(name,value) {  
    var scope = angular.element($("#controllerTag")).scope();
    scope.$apply(function(){
        scope[name] = value;
    })
  }

  function handleAuthResult(authResult) {
    var authorizeButton = document.getElementById('authorize-button');
    if (authResult && !authResult.error) {
      authorizeButton.style.visibility = 'hidden';
      change("googleApi","lalalalalla");
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
            var logInfo = document.getElementById('logInfo');
            logInfo.innerHTML = 'Welcome, '+resp.emailAddress+'<br/>';
        });
        
        //Get labels
        var userLabelReq = gapi.client.gmail.users.labels.list({
            'userId':'me'
        }); 
          
        userLabelReq.execute(function(resp){
            var labels = resp.labels;
            showLabels(labels);
        });

          
        //Get Email Messages
        var request = gapi.client.gmail.users.messages.list({
            'userId':'me'
        });
        request.execute(function(resp){
          
            resp.messages.forEach(function(message){
                var messageDiv = document.createElement('div');
                messageDiv.className = 'messageDiv';
                var headerDiv = document.createElement('div');
                headerDiv.className = 'headerDiv';
                var snippetDiv = document.createElement('p');
                snippetDiv.className = 'snippetDiv';
                var senderDiv = document.createElement('p');
                var subjectDiv = document.createElement('p');
                
                            
                var emailMessage = gapi.client.gmail.users.messages.get({'userId':'me','id':message.id});
                emailMessage.execute(function(content){
                    if(content.payload == null){
                        console.log("payload null");
                    }else {
                        content.payload.headers.forEach(function(header){
                            if(header.name == "Subject"){
                               // console.log(header.value);
                                subjectDiv.innerHTML += '<label>Subject:</label> '+ header.value;
                            }
                        }); 
                        content.payload.headers.forEach(function(header){
                            if(header.name == "From"){
                                //console.log(header.value);
                                senderDiv.innerHTML += '<label>From:</label> '+ header.value;
                            }
                        });
                        var snippetval;
                        if (content.snippet){
                            snippetval = content.snippet;
                           // console.log(snippetval);
                            snippetDiv.innerHTML += snippetval + '...';   
                        }else{
                            snippetDiv.innerHTML += 'This message has no content';  
                        }
                      //console.log (content);
                        /*var bodyVal;
                        if (content.payload.mimeType == 'text/html' || content.payload.mimeType == 'text/plain'){
                            bodyVal = Base64.decode(content.payload.body.data.replace(/\-/g, '+').replace(/\_/g, '/'));
                            
                        }else if(content.payload.mimeType == 'multipart/alternative'){
                            bodyVal = Base64.decode(content.payload.parts[1].body.data.replace(/\-/g, '+').replace(/\_/g, '/'));
                            
                        }
                        bodyData.innerHTML += bodyVal;*/
                    }
                    
                });
                messageDiv.appendChild(headerDiv);
                messageDiv.appendChild(snippetDiv);
                headerDiv.appendChild(senderDiv);
                headerDiv.appendChild(subjectDiv);
               
                document.getElementById("content").appendChild(messageDiv);
                //document.getElementById("content").innerHTML += '<hr/>' + messageDiv;
            });
            //document.getElementById("content").appendChild(textNode);
        });
      });
  }
function showLabels(labels){
    labels.forEach(function(label){
        
        if(label.type == 'user'){
            var labelDiv = document.createElement('span');
            labelDiv.className = 'labelDiv';
            labelDiv.innerHTML += label.name;
            document.getElementById('labelContainer').appendChild(labelDiv);
        }
    });
    labels.forEach(function(label){
        
        if (label.id == 'INBOX'){
            var labelDiv = document.createElement('div');
            labelDiv.className = 'labelDivINBOX';
            labelDiv.innerHTML += 'Show all messages in inbox';
            document.getElementById('labelContainer').appendChild(labelDiv);
        }
    });
}