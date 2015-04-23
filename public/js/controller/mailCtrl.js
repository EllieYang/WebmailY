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
    $scope.groupSelected = false;
    $scope.activeUser = "me";
    $scope.createNewBtnText = "New Space";
    $scope.allThreads = [];
    $scope.allSpaces = [];
    $scope.groups = [];
    $scope.users = [];
    $scope.userWithSpaceData = [];
    $scope.recipientFairyList = [];
    $scope.fairies = [];
    //Id upbound
    var idUpB = 0;
    var inboxMessages = [];
    var emailList = [];
    $scope.draggedData = {};
    $scope.connectedFairy = {'fairyId':"",'space':{},'connected':false};
    $scope.ownerOfActiveSpace = false;
    
    angular.element(window).bind('load', function() {
        //handleClientLoad();
        GmailAPIService.handleClientLoad();
        $scope.getUsers();
        $scope.getFairies();
        $timeout(function(){
            $scope.activeUser = $("#logInfo").val();
            $scope.uniIni();
        },3000);  
    });
    
    $scope.uniIni = function (){
        for (var i=0;i<$(".expiryDate").length;i++){
          $("#expiryDate"+i).datepicker({ minDate: 1});
            $("#replyText"+i).autogrow();
        }
    }
    
    $scope.getUsers = function(){
        $http.get('http://0.0.0.0:9001/getUsers',{params:{}}).success(function(data){
            $scope.users = data;
            emailList = $scope.users.map(function(x){return x.email});
            emailList.forEach(function(email){
                var spaceData = {'email':email,'space':[]};
                $scope.getFairyList(email);
                $scope.userWithSpaceData.push(spaceData);
            });
        });
    }
    
    $scope.getFairies = function(){
        $http.get('http://0.0.0.0:9001/getFairies',{params:{}}).success(function(data){
            $scope.fairies = data;
            console.log($scope.fairies);
        });
    }
    
    $scope.getFairyList = function(emailAddress){
        $http.get('http://0.0.0.0:9001/loadAllSpaces',{params:{user:emailAddress}}).success(function(data){
            //console.log(data);
            var index = $scope.userWithSpaceData.map(function(x){return x.email}).indexOf(emailAddress);
            if (index!==-1){
                $scope.userWithSpaceData[index].space = data;
            }
            return data;
        });
    }
    
    $scope.getSpaces = function(emailAddress){
        $http.get('http://0.0.0.0:9001/loadAllSpaces',{params:{user:emailAddress}}).success(function(data){
            $scope.allSpaces = $scope.assignSpaceData(data);
        });
        $http.get('http://0.0.0.0:9001/load',{params:{user:emailAddress}}).success(function(data){
            $scope.spaces = $scope.assignSpaceData(data);
        });
    }
    
    $scope.addSpace = function(emailAddress,spaceId, spaceName, subSpace,groupId){

        $http.get('http://0.0.0.0:9001/addFairy',{params:{user:emailAddress}}).success(function(rows){
            console.log(rows);
        });
         $http.get('http://0.0.0.0:9001/addSpace',{params:{user:emailAddress,spaceId:spaceId,spaceName:spaceName,subSpace:subSpace,level:0,fairy:-1,groupId:groupId}}).success(function(data){
            $scope.getSpaces(emailAddress);
        });
    }
    
    $scope.createSpace = function(emailAddress,spaceId, spaceName, subSpace,fairyId,groupId,groupOpt){//This is to create a space with the requested fairyID
        
         $http.get('http://0.0.0.0:9001/addSpace',{params:{user:emailAddress,spaceId:spaceId,spaceName:spaceName,subSpace:subSpace,level:0,fairy:fairyId,groupId:groupId}}).success(function(rows){
        if(groupOpt=="withGroup"){
            $http.get('http://0.0.0.0:9001/updateGroupTable',{params:{uniqId:rows.insertId,groupId:groupId,option:"insert"}}).success(function(){
            $scope.getGroups(emailAddress);
            $scope.getSpaces(emailAddress);
            });
        }else{
            $scope.getSpaces(emailAddress);
        }
        });
    }
    
    $scope.removeSpace = function(emailAddress,spaceName){

        $http.get('http://0.0.0.0:9001/removeSpace',{params:{user:emailAddress,spaceName:spaceName}}).success(function(data){
            $scope.getSpaces(emailAddress);
        });
    }
    
    $scope.addGroup = function(emailAddress, groupName, spaces){

         $http.get('http://0.0.0.0:9001/addGroup',{params:{user:emailAddress,groupName:groupName,spaces:spaces}}).success(function(data){
            $scope.getGroups(emailAddress);
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
            var newspace = {"id":space.id,"name":space.name,"subSpace":subList,"uniqId":space.uniqId,'fairyId':fairyIdArray,'level':space.level,'expiryDate':space.expiryDate,'group':space.groupId};
            //spaces.push(angular.toJson(newspace));
            spaces.push(newspace);
            
        });
        return spaces;
    }
    
    $scope.addNewSpace = function() {
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
        $scope.addSpace($scope.activeUser,newspace.id, newspace.name, JSON.stringify(subspacesObjList),-1);
    };
    
    $scope.addNewGroup = function() {
        var groupNameVal = $("#newSpaceName").val();
        var spaces = "";
        $scope.addGroup($scope.activeUser, groupNameVal, spaces);
    };
    
    $scope.createNewSpace = function(newSpace,$event) {
        
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
        //var newspace = {"id":newSpace.id,"name":newSpace.name,"subSpace":subspacesObjList}; 
        $scope.createSpace($scope.activeUser,newSpace.id, newSpace.name, JSON.stringify(subspacesObjList),newSpace.fairyId,-1,"withOutGroup");
        $event.stopPropagation();
        $event.preventDefault();
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
    };
    
     $scope.createNewGroup = function(newGroup,$event) {
         
         //I need to create one group and two spaces
         $event.stopPropagation();
         $event.preventDefault();
         $scope.addGroup($scope.activeUser, newGroup.name, "");
         $http.get('http://0.0.0.0:9001/getLastId',{params:{user:$scope.activeUser}}).success(function(data){
             if(newGroup.spacesData.length){
                newGroup.spacesData.forEach(function(addedSpace){
                    var spaceId = "space_"+addedSpace.id.split('_')[2];
                    $scope.createSpace($scope.activeUser,spaceId, addedSpace.name, JSON.stringify(addedSpace.subSpace),addedSpace.fairyId,data,"withGroup");
                });
             }
         });
    };
    
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
    
    $scope.updateGroupVal = function(space,groupId,option){//This function is to update the space with an added fairy
       
        $http.get('http://0.0.0.0:9001/updateGroupVal',{params:{uniqId:space.uniqId,groupId:groupId,option:option}}).success(function(data){
        });
        $http.get('http://0.0.0.0:9001/updateGroupTable',{params:{uniqId:space.uniqId,groupId:groupId,option:option}}).success(function(data){
            $scope.getSpaces($scope.activeUser);
            $scope.getGroups($scope.activeUser);
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
                    console.log(space.id);
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
        $scope.getGroups(newVal);
        $scope.getSpaces(newVal);
        
    },true);
    
    $scope.$watch('email.to', function (newVal) {
        $scope.ownerOfActiveSpace = false;
        if(emailList.indexOf(newVal)!==-1){
            var index = $scope.userWithSpaceData.map(function(x){return x.email}).indexOf(newVal);
            if (index!==-1){
                $scope.recipientFairyList = $scope.userWithSpaceData[index].space.map(function(x){return x.fairy});
                for(var i=0;i<$scope.recipientFairyList.length;i++){
                    var fairyStr = $scope.recipientFairyList[i];
                    var connectedFairy = intersect(fairyStr.split(','),$scope.activeSpace.fairyId);
                        if(connectedFairy.length){
                            $scope.connectedFairy.fairyId = connectedFairy[0];
                            $scope.connectedFairy.space = $scope.userWithSpaceData[index].space[i];
                            $scope.connectedFairy.connected = true;
                            console.log($scope.connectedFairy);
                            break;
                        }
                }
                if(!$scope.connectedFairy.connected){
                    $scope.ownerOfActiveSpace = $scope.fairies.map(function(x){return x.id}).indexOf(parseInt($scope.activeSpace.fairyId[0]))==-1 ? false : true;
                }
                
            }

        }  
    },true);
    
    
    $scope.$watch('ownerOfActiveSpace', function (newVal) {
        if(newVal){
            $scope.fairySelected=true;
        }else{
            $scope.fairySelected=false;
        }
    },true);
    
    var Message = function Message(id, labelIds, threadId, snippet, body, mimeType, from, date, to, subject, MIMEVersion, contentType, emailFromSpace, emailToSpace, spaceFairy,messageID,threadData){
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
        this.messageID = messageID;
        this.threadData = threadData;
    }
    
    function classifyThreads(allThreads){//Retrieve inbox messages
        var inboxThreads = [];
        //var inboxMsgs = [];
        if(allThreads.length){
            allThreads.forEach(function(thread){
                var content = thread.result;
                
                var lastMsg = content.messages[(content.messages.length-1)];
                if(lastMsg.labelIds){
                    if(lastMsg.labelIds[0]=="INBOX" || lastMsg.labelIds[0]=="SENT"){
                        var newThread = {'threadData':thread,"messages":[]};
                        thread.messages.forEach(function(message){
                             var newMsg = new Message(message.id,message.labelIds,message.threadId, message.snippet, message.payload.body, message.payload.mimeType, "","","","","","","","","","","");
                            if(message.payload){
                                message.payload.headers.forEach(function(header){
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
                                    }else if (header.name == "Message-ID" || header.name == "Message-Id"){
                                        newMsg.messageID = header.value;
                                    }
                                });
                            }
                            newThread.messages.push(newMsg);
                        });
                        //newMsg.threadData = thread;
                        inboxThreads.push(newThread);
                        //inboxMsgs.push(newMsg);
                    }
                }
            });
        }
        //inboxMessages = inboxMsgs;
        inboxMessages = inboxThreads;
        updateUserSpace(inboxThreads);
    }
    
    function intersect(a, b) {
        var t;
        if (b.length > a.length) t = b, b = a, a = t; // indexOf to loop over shorter
        return a.filter(function (e) {
            if (b.indexOf(e) !== -1) return true;
        });
    }
    
    function updateUserSpace(inboxThreads){
    
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
        inboxThreads.forEach(function(thread){
            //console.log(thread);
            if(thread.messages.length){
                var lastMsg = thread.messages[thread.messages.length-1];
                var fairyList = userSpaceDataList.map(function(x){return x.fairy});
                var elementPos = -1;
                //var attachedId = lastMsg.spaceFairy.attachedFairy;
                //Once receiving the attachedFairy (which might be 1,2,3), the fairy that has a match with the recipient's fairy list should be found. And this should be the fairy that the email goes into.
                var attachedId =  intersect(lastMsg.spaceFairy.attachedFairy,fairyList);
                attachedId = attachedId[0];
                
                fairyList.forEach(function(idList,index){
                    if(idList.indexOf(attachedId)!==-1){
                        elementPos = index;
                    }
                });
                if(elementPos !== -1){//has fairy connection
                    userSpaceDataList[elementPos].threadsArray.push(thread);
                }else{//No fairy connection
                    
                    if(!lastMsg.spaceFairy.group){//No group request
                        if(lastMsg.spaceFairy.state==true){
                            
                            var space = lastMsg.spaceFairy.space[0];
                            space.id = 'space_request_id';
                            var temp = {'fairyId':attachedId,'id':space.id,'level':space.level,'name':space.name,'subSpace':space.subSpace,'uniqId':space.uniqId,'expiryDate':space.expiryDate,'group':-1};
                            spaceRequestList.push(temp);
                        }else{
                            var elePos = userSpaceDataList.map(function(x){return x.name}).indexOf(lastMsg.emailToSpace);
                            if(elePos!==-1){
                                userSpaceDataList[elePos].threadsArray.push(thread);
                            }else{
                                //No fairy connection, no fairy request and no matched space. Should go to default space.
                            }
                        }        
                    }else{//There is a new group request
                        var spaceIds = lastMsg.spaceFairy.space.map(function(x){return x.uniqId});
                        var groupWithoutHash = [];
                        $scope.groups.forEach(function(group){
                            groupWithoutHash.push(group);
                        });
                        var newGroup = {"groupId":"group_request_"+$scope.groups.length+1,"spaces":spaceIds,"name":lastMsg.spaceFairy.groupName,"type":"request","spacesData":[]};
                        
                        lastMsg.spaceFairy.space.forEach(function(space){
                            console.log(space);
                            
                            //var fairyId = (space.fairyId.indexOf(lastMsg.spaceFairy.attachedFairy)!==-1)? lastMsg.spaceFairy.attachedFairy : space.fairyId[0];
                           var fairyId = space.fairyId[0];//If the sender can send the fairy request, this means space.fairyId[0] must belongs to the sender and this should be the one that the sender wants to share with the recipient.
                            var temp = {'fairyId':fairyId,'id':'space_request_id','level':space.level,'name':space.name,'subSpace':space.subSpace,'uniqId':'space_request_'+space.uniqId,'expiryDate':space.expiryDate,'group':newGroup.groupId};
                            spaceRequestList.push(temp);
                            newGroup.spacesData.push(temp);
                        });
                        groupWithoutHash.push(newGroup);
                        
                        $scope.groups = groupWithoutHash;
                        console.log($scope.groups);
                        
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
            //var messageArray = space.threadsArray;//Messages that belong to this space
            var threadsArray = space.threadsArray;
            $scope.userSpaces[index]["threads"]=[];
            if(threadsArray.length){
                var unreadMsgNo = 0;
                threadsArray.forEach(function(thread){
                    var pushedThread = {};
                    pushedThread.messages = [];
                    if(thread.messages.length){
                        
                        thread.messages.forEach(function(emailMessage){
                            var newMessage = {"msg":emailMessage,"header":{},"snippet":''};
                            newMessage.snippet = emailMessage.snippet ? emailMessage.snippet : 'This message has no content';
                            if(emailMessage.labelIds.indexOf("UNREAD") !== -1){
                                newMessage.messageStatus = "UNREAD";
                                unreadMsgNo++;
                            }else{
                                newMessage.messageStatus = "READ";
                            }
                            newMessage.body = atob(emailMessage.body.data);
                            newMessage.date = emailMessage.date.split(" ",3).join(" ");
                            pushedThread.messages.push(newMessage);
                            
                        });
                    }
                pushedThread.lastMsg = pushedThread.messages[pushedThread.messages.length-1];
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
        //$("#compose").show();
        $("#compose").css('visibility','visible');
        $scope.activeSpaceIndex = $("#activeSpaceIndex").val();
        $scope.activeSpace = $scope.spaces[$scope.activeSpaceIndex];
        if($scope.activeSpace){
            $scope.email.space = $scope.activeSpace.name;
        }
        $scope.fairySelected = true;
        safeApply($scope,function(){});
    };
    $scope.sendMsg = function(){
        $scope.email.from = $scope.activeUser;
        $scope.email.reply = false;
        var groupId = -1,groupedSpaces=[],groupName="";
        var attachedGroup = {};
        if($scope.groupSelected){
            groupId = $scope.activeSpace.group;
            $scope.groups.forEach(function(groupObj){
               
                if(groupId==groupObj.groupId){
                    groupObj.spaces.forEach(function(spaceId){
                        var elementPos = $scope.spaces.map(function(x){return x.uniqId}).indexOf(parseInt(spaceId));
                        if(elementPos!==-1){
                            groupedSpaces.push($scope.spaces[elementPos]);
                        }
                    });
                    groupName = groupObj.name;
                }
            });
            attachedGroup= {'groupName':groupName,'spaces':groupedSpaces};
            
        }
            GmailAPIService.sendMessage($scope.email,$scope.activeSpace,$scope.fairySelected,$scope.groupSelected,attachedGroup,$scope.email.space,$scope.activeSpace.fairyId);
        $("#compose").hide();
        /*$http.get('http://0.0.0.0:9001/getAttachedFairy',{params:{user:$scope.activeUser,space:$scope.activeSpace.fairyId}}).success(function(data){
            if(data){
                var attachedFairy = data;
            }else{//Cannot make fairy request becase the attached fairy is not the user's.
                var attachedFairy = "";
            }   
           console.log(attachedFairy); GmailAPIService.sendMessage($scope.email,$scope.activeSpace,$scope.fairySelected,$scope.groupSelected,attachedGroup,$scope.email.space,attachedFairy);
            $("#compose").hide();
        });*/
    };
    
    $scope.replyMsg = function(thread,replyTextIndex,spaceName){
        
        console.log(thread);
        var threadId = thread.lastMsg.msg.threadId;
        var messageId = thread.lastMsg.msg.messageID;
        var inReplyTo = messageId;
       // var reference = messageId;
        var references = [];
        thread.messages.forEach(function(message){
            message.msg.messageID
            references.push(message.msg.messageID);
        });
        
        var emailMsg = {};
        emailMsg.to = thread.lastMsg.msg.from;
        emailMsg.from = $scope.activeUser;
        emailMsg.subject =  "Re: "+thread.lastMsg.msg.subject;
        emailMsg.space = spaceName;
        emailMsg.threadId = threadId;
        emailMsg.inReplyTo = inReplyTo;
        emailMsg.references = references;
        emailMsg.reply = true;
        emailMsg.body = $("#replyText"+replyTextIndex).val();
        $scope.activeSpaceIndex = $("#activeSpaceIndex").val();
        $scope.activeSpace = $scope.spaces[$scope.activeSpaceIndex];
        GmailAPIService.sendMessage(emailMsg,$scope.activeSpace,false,false,{},emailMsg.space,thread.lastMsg.msg.spaceFairy.attachedFairy);
    };
    
    $scope.close = function(){
        $("#compose").hide();   
    };
    
    $scope.threadHeaderOnClick = function(spaceId, index){
        
        $("#emailThreadBody_"+spaceId+"_"+index).slideToggle("fast");
        $("#emailThread_"+spaceId+"_"+index).toggleClass("activeThread");
    };
    
    $scope.messageHeaderOnClick = function(threadId, index,message){
        $("#emailBody_"+threadId+"_"+index).toggle("fast");
        if($("#emailMessage_"+threadId+"_"+index).hasClass("unreadThread")){
            $("#emailMessage_"+threadId+"_"+index).removeClass("unreadThread");
            GmailAPIService.markAsRead(message);
        }
    };
    
    /*$scope.threadClicked = function(spaceId, index,lastMsg){
        
        $("#emailBody_"+spaceId+"_"+index).toggle("fast");
        if($("#emailThread_"+spaceId+"_"+index).hasClass("unreadThread")){
            $("#emailThread_"+spaceId+"_"+index).removeClass("unreadThread");
            GmailAPIService.markAsRead(lastMsg);
        }
        $("#emailThread_"+spaceId+"_"+index).toggleClass("activeThread");
    }*/
    $scope.updateFairySelected = function(fairySelected){
        $scope.fairySelected = fairySelected;
        safeApply($scope,function(){});
    };
    
    $scope.getGroups = function(emailAddress){
        $http.get('http://0.0.0.0:9001/getGroups',{params:{user:emailAddress}}).success(function(data){
            //$scope.groups = data;
            $scope.groups = [];
            var groupArray = [];
            data.forEach(function(group){
                var newGroup = {"groupId":group.id,"spaces":group.spaces.split(','),"name":group.name, "type":"normal","spacesData":[]};
                groupArray.push(newGroup);
            });
            $scope.groups = groupArray;
            safeApply($scope,function(){});
        });
    };
    
    $scope.belongsToGroup = function(userSpace,group){
        
        if(userSpace.space.group!==-1){
            
            if(group.type=="normal"){
                if(group.spaces.indexOf(userSpace.space.uniqId.toString())!==-1){
                    return true;
                }else{
                    return false;
                }
            }else{
               
                if(userSpace.space.id.substring(0,13)=='space_request' && group.spaces.indexOf(parseInt(userSpace.space.uniqId.split('_')[2]))!==-1){
                    
                    return true;
                }else{
                    return false;
                }
            }
            
        }else{
            return false;
        }
        
    };
    
    $scope.spaceDragged = function(event, ui, userSpace,index){
        window.dragged = true;
        $scope.draggedData = {'index': index, 'space': userSpace};
        var _this = $(".userSpace_"+index);
        //$(this).addClass("subSpaceDiv");
        $(".userSpace_"+index).animate({
            
          }, 1000, function() {
            // Animation complete.
          });
    };
    
    $scope.addToGroup = function(event, ui, group){
        $scope.updateGroupVal($scope.draggedData.space.space,group.groupId,'insert');
    };
    $scope.removeFromGroup =  function(event, ui, group){
        $scope.updateGroupVal($scope.draggedData.space.space,group.groupId,'remove');
    };
    $scope.applyChangeGS = function(value){
        safeApply($scope,function(){});
        $scope.groupSelected = value;
    }
}]);