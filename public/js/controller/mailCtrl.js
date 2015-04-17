webmaily.controller("mailController",['$scope','$http','$timeout','$interval','GmailAPIService',function($scope,$http,$timeout,$interval,GmailAPIService){
    
    $scope.labels = [];
    $scope.allThreads = [];
    $scope.userSpaces=[];
    $scope.spaces = [];
    $scope.email={};
    $scope.email.from = "me";
    $scope.email.to = "frank.taylor.testing@gmail.com";
    $scope.email.subject = "New Message";
    $scope.email.space = "Space Name";
    $scope.email.body = "Type to write the email body";
    $scope.activeSpaceIndex = -1;
    $scope.activeSpace = {};
    $scope.fairySelected = false;
    $scope.fairyRequest = false;
    $scope.activeUser = "me";
    $scope.allThreads = [];
    $scope.allSpaces = [];
    //Id upbound
    var idUpB = 0;
    var inboxMessages = [];
    
    angular.element(window).bind('load', function() {
        //handleClientLoad();
        GmailAPIService.handleClientLoad();
        $timeout(function(){
            $scope.activeUser = $("#logInfo").val();
        },3000);
    });
    
    $scope.getSpaces = function(emailAddress){
        $http.get('http://0.0.0.0:9001/loadAllSpaces',{params:{user:emailAddress}}).success(function(data){
            $scope.allSpaces = $scope.assignSpaceData(data);
        });
        $http.get('http://0.0.0.0:9001/load',{params:{user:emailAddress}}).success(function(data){
            $scope.spaces = $scope.assignSpaceData(data);
        });
    }
    
    $scope.addSpace = function(emailAddress,spaceId, spaceName, subSpace){

        $http.get('http://0.0.0.0:9001/addFairy',{params:{user:emailAddress}}).success(function(data){
            //console.log(data);
        });
         $http.get('http://0.0.0.0:9001/addSpace',{params:{user:emailAddress,spaceId:spaceId,spaceName:spaceName,subSpace:subSpace,level:0,fairy:-1}}).success(function(data){
            $scope.getSpaces(emailAddress);
        });
    }
    
    $scope.createSpace = function(emailAddress,spaceId, spaceName, subSpace,fairyId){//This is to create a space with the requested fairyID
        
         $http.get('http://0.0.0.0:9001/addSpace',{params:{user:emailAddress,spaceId:spaceId,spaceName:spaceName,subSpace:subSpace,level:0,fairy:fairyId}}).success(function(data){
            $scope.getSpaces(emailAddress);
        });
    }
    
    $scope.removeSpace = function(emailAddress,spaceName){

        $http.get('http://0.0.0.0:9001/removeSpace',{params:{user:emailAddress,spaceName:spaceName}}).success(function(data){
            $scope.getSpaces(emailAddress);
        });
    }
    
    $scope.assignSpaceData = function (data){
        var spaces = [];
        data.forEach(function(space){
           
            var subList = [];
            if(space.subSpace!==""){
                var list = space.subSpace.split(',');
                list.forEach(function(sub,index){
                    var newSub = {"id":'space_'+idUpB,"name":sub,"subSpace":[]};
                    subList.push(newSub);
                });
            }
            var fairyIdArray = space.fairy.split(',');
            var newspace = {"id":space.id,"name":space.name,"subSpace":subList,"uniqId":space.uniqId,'fairyId':fairyIdArray,'level':space.level};
            //spaces.push(angular.toJson(newspace));
            spaces.push(newspace);
            
        });
        return spaces;
    }
    
    $scope.addNewSpace = function(newSpaceName) {
        var spaceNameVal = $("#newSpaceName").val();
        var subspacesVal = $("#newSubspaces").val();
        var subspacesObjList =[];
        if(subspacesVal){
            var subspacesList = subspacesVal.split(';');
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
        $scope.addSpace($scope.activeUser,newspace.id, newspace.name, JSON.stringify(subspacesObjList));
    };
    
    $scope.createNewSpace = function(newSpace) {
        
        newSpace.id = "space_"+idUpB;
        var subspacesObjList =[];
        if(newSpace.subSpace.length){
            newSpace.subSpace.forEach(function(element){
                if(element){
                    var newSub = {"id":'space_'+idUpB,"name":element.name,"subSpace":[]};
                    subspacesObjList.push(newSub);
                }  
            });
        }
        var newspace = {"id":newSpace.id,"name":newSpace.name,"subSpace":subspacesObjList}; 
        $scope.createSpace($scope.activeUser,newspace.id, newspace.name, JSON.stringify(subspacesObjList),newSpace.fairyId);
    };
    
    $scope.mapSpace = function(space){
       
        var selectedSpace = {};
        var tempHTML = "Please choose a space: \n"
        $scope.allSpaces.forEach(function(space,index){
            tempHTML+=(index+1)+": "+space.name+"\n";
        });
        var selectedSpaceIndex = prompt(tempHTML, "1");
        if (selectedSpaceIndex != null) {
            selectedSpace = $scope.allSpaces[selectedSpaceIndex-1];
            $scope.updateSpace(selectedSpace,space.fairyId,space);
        }
    }
    
    $scope.updateSpace = function(space,fairyId, spaceToBeDelete){//This function is to update the space with an added fairy
       
        $http.get('http://0.0.0.0:9001/updateSpace',{params:{uniqId:space.uniqId,fairyId:fairyId}}).success(function(data){
            
            //Delete the 'space_request' and update existing spaces
            //update $scope.spaces;
            var indexToBeDelete1  = $scope.spaces.indexOf(spaceToBeDelete);
            $scope.spaces.splice(indexToBeDelete1,1);
            $scope.spaces.forEach(function(ele){
                if(ele.uniqId == space.uniqId){
                    ele.fairyId = fairyId;
                }
            });
            
            //update $scope.allSpaces;
            var indexToBeDelete2  = $scope.allSpaces.indexOf(spaceToBeDelete);
            $scope.allSpaces.splice(indexToBeDelete2,1);
            $scope.allSpaces.forEach(function(ele){
                if(ele.uniqId == space.uniqId){
                    ele.fairyId = fairyId;
                }
            });
        });
    }
    
    $scope.$watch("spaces", function (newVal, oldVal) {
        
        if (newVal.length) {
            idUpB = newVal.length;
            $scope.userSpaces = [];
            newVal.forEach(function(space){
                //space = angular.fromJson(space);
                var userSpace = {};
                userSpace.space = space;
                userSpace.threads = [];
                userSpace.unreadMsgNo = 0;
                if(space.id.substring(0,13)=='space_request'){
                    userSpace.type="request";
                }else{
                    userSpace.type="normal";
                }
                $scope.userSpaces.push(userSpace);
            });
            updateUserSpace(inboxMessages);
            safeApply($scope,function(){});
            setTimeout(function(){   
                PageTransitions();
             },1);
        }
    },true);
    
    $scope.$watch('allThreads', function (newVal) {
        classifyThreads(newVal);
    },true);
    
    $scope.$watch('activeUser', function (newVal) {
        $scope.getSpaces(newVal);
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
    
  /*  function intersect(a, b) {
        var t;
        if (b.length > a.length) t = b, b = a, a = t; // indexOf to loop over shorter
        return a.filter(function (e) {
            if (b.indexOf(e) !== -1) return true;
        });
    }*/
    
    function updateUserSpace(inboxMsgs){
    
        var spacesWithoutHash = [];
        $scope.spaces.forEach(function(space){
            var temp = {'fairyId':space.fairyId,'id':space.id,'level':space.level,'name':space.name,'subSpace':space.subSpace,'uniqId':space.uniqId};
            spacesWithoutHash.push(temp);
        });
        
        //Initiating space with threads array.
        var userSpaceDataList = [];
        if($scope.allSpaces.length){
            $scope.allSpaces.forEach(function(ele){
                var temp = {'id':ele.uniqId,'name':ele.name,'threadsArray':[],'fairy':ele.fairyId, 'level':ele.level};
                userSpaceDataList.push(temp);
            });
        }
        
        var spaceRequestList = [];
        inboxMsgs.forEach(function(emailMessage){
            
            var fairyList = userSpaceDataList.map(function(x){return x.fairy});
            var elementPos = -1;
            var attachedId = emailMessage.spaceFairy.attachedFairy;
            console.log(userSpaceDataList);
            fairyList.forEach(function(idList,index){
                if(idList.indexOf(attachedId)!==-1){
                    elementPos = index;
                }
            });
            //var elementPos = userSpaceDataList.map(function(x){return x.fairy}).indexOf(parseInt(emailMessage.spaceFairy.space.fairyId));
            if(elementPos !== -1){//has fairy connection
                userSpaceDataList[elementPos].threadsArray.push(emailMessage);
            }else{//No fairy connection
                
                if(emailMessage.spaceFairy.state==true){
                    
                    var space = emailMessage.spaceFairy.space;
                    space.id = 'space_request_id';
                    var temp = {'fairyId':emailMessage.spaceFairy.attachedFairy,'id':space.id,'level':space.level,'name':space.name,'subSpace':space.subSpace,'uniqId':space.uniqId};
                    spaceRequestList.push(temp);
                }else{
                    var elePos = userSpaceDataList.map(function(x){return x.name}).indexOf(emailMessage.emailToSpace);
                    if(elePos!==-1){
                        userSpaceDataList[elePos].threadsArray.push(emailMessage);
                    }else{
                        //No fairy connection, no fairy request and no matched space. Should go to default space.
                    }
                }
            }
        });
        
        //Select Level 0 spaces; 
        var spacesL0 = [];
        userSpaceDataList.forEach(function(element){
            if(element.level==0){
                spacesL0.push(element); 
            }  
        });
        
        //Deal with emails that belong to a space
        spacesL0.forEach(function(space,index){
            var spaceName = space.name;
            var messageArray = space.threadsArray;//Messages that belong to this space
            $scope.userSpaces[index]["threads"]=[];
            if(messageArray.length){
                
                var unreadMsgNo = 0;
                messageArray.forEach(function(emailMessage){
                    var pushedThread = {};
                    pushedThread.lastMsg = {"msg":emailMessage,"header":{},"snippet":''};
                    pushedThread.lastMsg.snippet = emailMessage.snippet ? emailMessage.snippet : 'This message has no content';
                    if(emailMessage.labelIds.indexOf("UNREAD") !== -1){
                        pushedThread.lastMsg.messageStatus = "UNREAD";
                        unreadMsgNo++;
                    }else{
                        pushedThread.lastMsg.messageStatus = "READ";
                    }
                    pushedThread.lastMsg.body = atob(emailMessage.body.data);
                    pushedThread.lastMsg.date = emailMessage.date.split(" ",3).join(" ");
                    $scope.userSpaces[index]["threads"].push(pushedThread);
                });
                safeApply($scope,function(){});
                $scope.userSpaces[index]['unreadMsgNo'] = unreadMsgNo;
            }
        });
        
        //Deal with emails that has a fairy request
        //The approach is to update $scope.spaces
        $scope.allSpaces = spaceRequestList.concat($scope.allSpaces);
        
        //Retrieve level0 spaces from $scope.allSpaces because it's the difference between spaces and allSpaces
        var newList = [];
        $scope.allSpaces.forEach(function(space){
                if(space.level==0){
                    newList.push(space);
                }
        });
        $scope.spaces = newList;
    }
    
    function safeApply(scope, fn) {
        (scope.$$phase || scope.$root.$$phase) ? fn() : scope.$apply(fn);
    }
    
    $scope.composeMsg = function() {
        $("#compose").show();
        $scope.activeSpaceIndex = $("#activeSpaceIndex").val();
        $scope.activeSpace = $scope.spaces[$scope.activeSpaceIndex];
        if($scope.activeSpace){
            $scope.email.space = $scope.activeSpace.name;
        }
        safeApply($scope,function(){});
    };
    $scope.sendMsg = function(){
        $scope.email.from = $scope.activeUser;
        //var attachedFairy = $scope.getAttachedFairy($scope.activeUser,$scope.activeSpace);
        $http.get('http://0.0.0.0:9001/getAttachedFairy',{params:{user:$scope.activeUser,space:$scope.activeSpace.fairyId}}).success(function(data){
            GmailAPIService.sendMessage($scope.email,$scope.activeSpace,$scope.fairySelected,$scope.email.space,data);
            $("#compose").hide();
        });
    };
    $scope.close = function(){
        $("#compose").hide();   
    };
    
    /*$scope.getAttachedFairy = function (user,space){//select the fairy of the space that's owned by the user
        var attachedFairy = "";
        $http.get('http://0.0.0.0:9001/getAttachedFairy',{params:{user:user,space:space.fairyId}}).success(function(data){
            attachedFairy = data;
            GmailAPIService.sendMessage($scope.email,$scope.activeSpace,$scope.fairySelected,$scope.email.space,attachedFairy);
        $("#compose").hide();
            //return attachedFairy;
        });
        
    }*/
    
    $scope.threadClicked = function(spaceId, index,lastMsg){
        
        $("#emailBody_"+spaceId+"_"+index).toggle("fast");
        if($("#emailThread_"+spaceId+"_"+index).hasClass("unreadThread")){
            $("#emailThread_"+spaceId+"_"+index).removeClass("unreadThread");
            GmailAPIService.markAsRead(lastMsg);
        }
        $("#emailThread_"+spaceId+"_"+index).toggleClass("activeThread");
    }
    $scope.updateFairySelected = function(fairySelected){
        $scope.fairySelected = fairySelected;
        safeApply($scope,function(){});
    }  
}]);