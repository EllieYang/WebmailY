webmaily.controller("mailController",['$scope','$http','$timeout','GmailAPIService',function($scope,$http,$timeout,GmailAPIService){
    
    $scope.labels = [];
    $scope.allThreads = [];
    $scope.userSpaces=[];
    $scope.spaces = [];
    $scope.email={};
    $scope.email.from = "me";
    $scope.email.to = "welcome.easymail@gmail.com";
    $scope.email.subject = "New Message";
    $scope.email.space = "space_1";
    $scope.email.body = "Type to write the email body";
    $scope.activeSpaceIndex = -1;
    $scope.activeSpace = {};
    $scope.fairySelected = false;
    $scope.fairyRequest = false;
    $scope.activeUser = "me";
    $scope.allThreads = [];
    //Id upbound
    var idUpB = 0;
    var inboxMessages = [];
    
    angular.element(window).bind('load', function() {
        //handleClientLoad();
        GmailAPIService.handleClientLoad();
        
        $http.get('data/users.json').success(function(data){ 
            $scope.userSpaces = [];
            data[0].space.forEach(function(space){
                var userSpace = {};
                userSpace.space = space;
                userSpace.threads = [];
                if(space.id.substring(0,13)=='space_request'){
                    userSpace.type="request";
                }else{
                    userSpace.type="normal";
                }
                $scope.userSpaces.push(userSpace);
            });
            $timeout(function(){
                
                $scope.activeUser = $("#logInfo").val();
                data.forEach(function(userInfo){
                    if(userInfo.email == $scope.activeUser){
                        $scope.spaces = userInfo.space;
                    }
                });
                //$scope.spaces = data[0].space;
            },3000);
        });
    });
    
    $scope.addNewSpace = function(newSpaceName) {
        var spaceNameVal = $("#newSpaceName").val();
        var subspacesVal = $("#newSubspaces").val();
        if(subspacesVal){
            var subspacesList = subspacesVal.split(';');
            var subspacesObjList =[];
            if(subspacesList.length){
                subspacesList.forEach(function(element, index){
                    //var newSub = new Space('space_'+index, element,[]);
                    if(element){
                        var newSub = {"id":'space_'+idUpB,"name":element,"subSpace":[]};
                        subspacesObjList.push(newSub);
                    }
                    
                });
            }
        }
        
        
        var newspace = {"id":'space_'+($scope.spaces.length+1),"name":spaceNameVal,"subSpace":subspacesObjList};
        //var newspace = new Space('space_'+($scope.spaces.length+1),newSpaceName,[]);
        //var currentuser = JSON.parse(localStorage.getItem("welcome.easymail"));
        //currentuser.space.push(newspace);
        //localStorage.setItem("welcome.easymail",JSON.stringify(currentuser));
        //$scope.spaces = currentuser.space;

        //Here should be an operation of the Database. But for now, it's only manipulating the $scope.spaces variable.
        //**********DATABASE*****************        
        $scope.spaces.push(newspace);
        setTimeout(function(){   
            PageTransitions();
        },3000);
        safeApply($scope,function(){});  
    };
    
    $scope.createNewSpace = function(newSpace) {
        
        //Here should be an operation of the Database. But for now, it's only manipulating the $scope.spaces variable.
        //**********DATABASE*****************
        var newSpaceList = $scope.spaces;
        var index = newSpaceList.indexOf(newSpace);
        newSpaceList.splice(index, 1);
        //newSpace.id = "space_"+newSpaceList.length;
        newSpace.id = "space_"+idUpB;
        newSpaceList.push(newSpace);
        $scope.spaces = newSpaceList;
        setTimeout(function(){   
            PageTransitions();
        },3000);
        safeApply($scope,function(){}); 
    };
    
    $scope.$watchCollection('spaces', function (newVal, oldVal) {
        if (newVal.length) {
            idUpB = newVal.length;
            $scope.userSpaces = [];
            newVal.forEach(function(space){
                var userSpace = {};
                userSpace.space = space;
                userSpace.threads = [];
                if(space.id.substring(0,13)=='space_request'){
                    userSpace.type="request";
                }else{
                    userSpace.type="normal";
                }
                $scope.userSpaces.push(userSpace);
            });
            //getAllThreads1($scope.spaces);
            //GmailAPIService.getAllThreads1($scope.spaces);
            updateUserSpace(inboxMessages);
            safeApply($scope,function(){});
        }
    });
    
    $scope.$watch('allThreads', function (newVal) {
        classifyThreads(newVal);
    },true);
    
    var Message = function Message(id, labelIds, threadId, snippet, body, mimeType, from, date, to, subject, MIMEVersion, contentType, emailFromSpace, emailToSpace, spaceFairy){
        this.id = id;
        this.labelIds = labelIds;
        this.threadId = threadId;
        this.snippet = snippet;
        this.body = body;
        this.mimeType = mimeType;
        this.from = from;
        this.date = date;
        this.to = to;
        this.subject = subject;
        this.MIMEVersion = MIMEVersion;
        this.contentType = contentType;
        this.emailFromSpace = emailFromSpace;
        this.emailToSpace = emailToSpace;
        this.spaceFairy = spaceFairy;
    }
    
    function classifyThreads(allThreads){//Retrieve inbox messages
        var inboxMsgs = [];
        if(allThreads.length){
            allThreads.forEach(function(thread){
                var content = thread.result;
                var lastMsg = content.messages[(content.messages.length-1)];
                if(lastMsg.labelIds){
                    if(lastMsg.labelIds[0]=="INBOX"){
                        var newMsg = new Message(lastMsg.id,lastMsg.labelIds,lastMsg.threadId, lastMsg.snippet, lastMsg.payload.body, lastMsg.payload.mimeType, "","","","","","","","","");
                        if(lastMsg.payload){
                            lastMsg.payload.headers.forEach(function(header){
                                if(header.name=="From"){
                                    newMsg.from = header.value;
                                }else if(header.name=="Date"){
                                    newMsg.date = header.value;
                                }else if(header.name=="To"){
                                    newMsg.to = header.value;
                                }else if(header.name=="Subject"){
                                    newMsg.subject = header.value;
                                }else if (header.name == "Content-Type"){
                                    newMsg.contentType = header.value;
                                }else if (header.name == "Email-From-Space"){
                                    newMsg.emailFromSpace = header.value;
                                }else if (header.name == "Email-To-Space"){
                                    newMsg.emailToSpace = header.value;
                                }else if (header.name == "Space-Fairy"){
                                    newMsg.spaceFairy = JSON.parse(header.value);
                                }else if (header.name == "MIME-Version"){
                                    newMsg.MIMEVersion = header.value;
                                }
                            });
                        }
                        inboxMsgs.push(newMsg);
                    }
                }
            });
        }
        inboxMessages = inboxMsgs;
        updateUserSpace(inboxMsgs);
    }
    
    function updateUserSpace(inboxMsgs){
        var spaceArray = [], spaceArrayD = [],newSpaceArray=[];
        $scope.spaces.forEach(function(space){
            spaceArray.push(space.name);
            var obj={};
            obj[space.name] = [];
            spaceArrayD.push(obj);
        });
        inboxMsgs.forEach(function(emailMessage){
            if(spaceArray.indexOf(emailMessage.emailToSpace)!== -1 ){
                spaceArrayD[spaceArray.indexOf(emailMessage.emailToSpace)][emailMessage.emailToSpace].push(emailMessage);
            }else{
                newSpaceArray.push(emailMessage);
            }
        });
        //Deal with emails that belong to a space
        spaceArrayD.forEach(function(space,index){
            var spaceName = Object.keys(space)[0];
            var messageArray = space[spaceName];//Messages that belong to this space
            if(messageArray.length){
                messageArray.forEach(function(emailMessage){
                    var pushedThread = {};
                    pushedThread.lastMsg = {"msg":emailMessage,"header":{},"snippet":''};
                    pushedThread.lastMsg.snippet = emailMessage.snippet ? emailMessage.snippet : 'This message has no content';
                    if(emailMessage.labelIds.indexOf("UNREAD") !== -1){
                        pushedThread.lastMsg.messageStatus = "UNREAD";
                    }else{
                        pushedThread.lastMsg.messageStatus = "READ";
                    }
                    pushedThread.lastMsg.body = atob(emailMessage.body.data);
                    pushedThread.lastMsg.date = emailMessage.date.split(" ",3).join(" ");
                    $scope.userSpaces[index]["threads"].push(pushedThread);
                });
                safeApply($scope,function(){});
            }
        });
        //Deal with emails that do not belong to a space
        if(newSpaceArray.length){
            var newSpaceList = [];
            newSpaceArray.forEach(function(emailMessage,index){
                var spaceFairy = emailMessage.spaceFairy;
                if(spaceFairy.state==true){
                    var newSpace = spaceFairy.space;
                    newSpace.id = 'space_request_'+index;
                    newSpaceList.push(newSpace);
                }
            });
            if(newSpaceList.length){
                newSpaceList = newSpaceList.concat($scope.spaces);
                $scope.spaces = newSpaceList;
            } 
        }
    }
    
    function safeApply(scope, fn) {
        (scope.$$phase || scope.$root.$$phase) ? fn() : scope.$apply(fn);
    }
    
    $scope.composeMsg = function() {
        $("#compose").show();
        $scope.activeSpaceIndex = $("#activeSpaceIndex").val();
        $scope.activeSpace = $scope.spaces[$scope.activeSpaceIndex];
        $scope.email.space = $scope.activeSpace.name;
        safeApply($scope,function(){});
    };
    $scope.sendMsg = function(){
        $scope.email.from = $scope.activeUser;
        GmailAPIService.sendMessage($scope.email,$scope.activeSpace,$scope.fairySelected);
        $("#compose").hide();   
    };
    $scope.close = function(){
        $("#compose").hide();   
    };
    $scope.threadClicked = function(spaceId, index,lastMsg){
        
        $("#emailBody_"+spaceId+"_"+index).toggle("fast");
        if($("#emailThread_"+spaceId+"_"+index).hasClass("unreadThread")){
            $("#emailThread_"+spaceId+"_"+index).removeClass("unreadThread");
            markAsRead(lastMsg);
        }
        $("#emailThread_"+spaceId+"_"+index).toggleClass("activeThread");
    }
    $scope.updateFairySelected = function(fairySelected){
        $scope.fairySelected = fairySelected;
        safeApply($scope,function(){});
    }  
}]);