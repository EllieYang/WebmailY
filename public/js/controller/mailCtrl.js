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
    $scope.currentUser = {};//including name, email, profile
    $scope.createNewBtnText = "New Space";
    $scope.availabelSpacesToMap=[];
    $scope.allThreads = [];
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
        $scope.getUsers();
        GmailAPIService.handleClientLoad();
        $scope.getFairies();
        $timeout(function(){
            $scope.activeUser = $("#logInfo").val();
            var userIndex = $scope.users.map(function(x){return x.email}).indexOf($scope.activeUser);
            $scope.currentUser = $scope.users[userIndex];
           // $("#profileImg").attr('src','profilepics/xs/30'+$scope.currentUser.profile+'.jpg');
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
        });
    }
    
    $scope.$watch('users', function (newVal) {
        emailList = $scope.users.map(function(x){return x.email});
            emailList.forEach(function(email){
                var spaceData = {'email':email,'space':[]};
                $scope.userWithSpaceData.push(spaceData); 
            });
    },true);
    
    $scope.getFairies = function(){
        $http.get('http://0.0.0.0:9001/getFairies',{params:{}}).success(function(data){
            $scope.fairies = data;
        });
    }
    
    $scope.getSpaces = function(emailAddress){
        $http.get('http://0.0.0.0:9001/loadAllSpaces',{params:{user:emailAddress}}).success(function(data){
            
            $scope.spaces = $scope.assignSpaceData(data);
            if($scope.activeUser!=="me"){
                if($scope.userWithSpaceData.length){
                    var index = $scope.userWithSpaceData.map(function(x){return x.email}).indexOf($scope.activeUser);
                    $scope.userWithSpaceData[index].space = data;
                }
                $scope.getFairies();
            }
        });
    }
    
    $scope.addSpace = function(emailAddress,spaceId, spaceName, groupId){

        $http.get('http://0.0.0.0:9001/addFairy',{params:{user:emailAddress}}).success(function(rows){
            
        });
         $http.get('http://0.0.0.0:9001/addSpace',{params:{user:emailAddress,spaceId:spaceId,spaceName:spaceName,fairy:-1,groupId:groupId}}).success(function(data){
            $scope.getSpaces(emailAddress);
        });
    }
    
    $scope.createSpace = function(emailAddress,spaceId, spaceName,fairyId,groupId,groupOpt){//This is to create a space with the requested fairyID
        
         $http.get('http://0.0.0.0:9001/addSpace',{params:{user:emailAddress,spaceId:spaceId,spaceName:spaceName,fairy:fairyId,groupId:groupId}}).success(function(rows){
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
           
            
            var fairyIdArray = space.fairy.split(',');
            var newspace = {"id":space.id,"name":space.name,"uniqId":space.uniqId,'fairyId':fairyIdArray,'expiryDate':space.expiryDate,'group':space.groupId,'connections':space.connections?space.connections.split(','):[]};
            spaces.push(newspace);
            
        });
        
        return spaces;
    }
    
    $scope.addNewSpace = function(spaceName) {
        //var spaceNameVal = $("#newSpaceName").val();
        
        var newspace = {"id":'space_'+($scope.spaces.length+1),"name":spaceName};  
        $scope.addSpace($scope.activeUser,newspace.id, newspace.name,-1);
    };
    
    $scope.addNewGroup = function(groupName) {
        //var groupNameVal = $("#newSpaceName").val();
        var spaces = "";
        $scope.addGroup($scope.activeUser, groupName, spaces);
    };
    
    $scope.createNewSpace = function(newSpace,$event) {
        
        newSpace.id = "space_"+idUpB;
       
        $scope.createSpace($scope.activeUser,newSpace.id, newSpace.name,newSpace.fairyId,-1,"withOutGroup");
        $event.stopPropagation();
        $event.preventDefault();
    };
    
    $scope.mapSpace = function(userSpace){
       
        var space = userSpace.space;
        var sender = userSpace.threads[0].lastMsg.msg.from;
        
        $scope.availabelSpacesToMap = [];
        var connectionsList = $scope.spaces.map(function(x){
            if(x.id.substring(0,13)!=='space_request'){
              
                return x.connections;
            }else{
                return [sender];
            }
        });
        connectionsList.forEach(function(ele,index){
            if(ele.length){
                if(ele.indexOf(sender)==-1){
                    $scope.availabelSpacesToMap.push($scope.spaces[index]);
                }
            }
            if(!ele.length){
                $scope.availabelSpacesToMap.push($scope.spaces[index]);
            }
            
        });
        
        var selectedSpace = {};
        var tempHTML = "Please choose a space: \n"
       
        $scope.availabelSpacesToMap.forEach(function(space,index){
            tempHTML+=(index+1)+": "+space.name+"\n";
        });
        var selectedSpaceIndex = prompt(tempHTML, "1");
        if (selectedSpaceIndex != null) {
            selectedSpace = $scope.availabelSpacesToMap[selectedSpaceIndex-1];
            $scope.updateSpace(selectedSpace,space.fairyId,space);
        }
    };
    $scope.createNewClicked = function(option){
        
        var createNew = prompt("Please enter the name", "");
        if (createNew != null) {
            if(option == "newSpace"){
            $scope.addNewSpace(createNew);
          }else{
            $scope.addNewGroup(createNew);
          }
        }
    }
     $scope.createNewGroup = function(newGroup,$event) {
         
         //Need to create one group and two spaces
         $event.stopPropagation();
         $event.preventDefault();
         
         $http.get('http://0.0.0.0:9001/getLastId',{params:{user:$scope.activeUser}}).success(function(data){
             if(newGroup.spacesData.length){
                newGroup.spacesData.forEach(function(addedSpace){
                    
                    if(addedSpace.id.substring(0,13)=="space_request"){//this space is not connected currently
                        var spaceId = "space_"+addedSpace.id.split('_')[2];
                        
                    }else{
                        var tempHTML = "Your group is currently connected with "+addedSpace.name + ", would you like to move this space to your new group?\n";
                        var moveToGroup = confirm(tempHTML);
                        if(moveToGroup == true){//update the space and the group
                            
                        }else{
                            //Do nothing
                        }
                    }
                    
                });
             }
         });
    };
    
    $scope.mapToGroup = function(newGroup,$event) {
         
         //Need to choose one group that belongs to this user and create two spaces
        
        $event.stopPropagation();
        $event.preventDefault();
        var availableGroups = [];
        $scope.groups.forEach(function(group){
            if(group.type=='normal'){
                availableGroups.push(group);
            }
        });
        var tempHTML = "Please choose a group: \n"
        
        availableGroups.forEach(function(group,index){
            tempHTML+=(index+1)+": "+group.name+"\n";
        });
        
        var selectedGroupIndex = prompt(tempHTML, "1");
        if (selectedGroupIndex != null) {
            var selectedGroup = availableGroups[selectedGroupIndex-1];
            if (newGroup.spacesData.length){
                newGroup.spacesData.forEach(function(spaceData){
                    if(spaceData.id.substring(0,13)=="space_request"){//Means this space is not connected currently
                        var spaceId = "space_"+spaceData.id.split('_')[2];
                        setTimeout(function(){   
                            $scope.createSpace($scope.activeUser,spaceId, spaceData.name,spaceData.fairyId,selectedGroup.groupId,"withGroup");
                         },2);
                        
                    }else{//Means this space has already has a connection.
                        //Do something later.
                    }
                });
            }
        }
    };
    
    $scope.updateSpace = function(space,fairyId, spaceToBeDelete){//This function is to update the space with an added fairy
       
        $http.get('http://0.0.0.0:9001/updateSpace',{params:{uniqId:space.uniqId,fairyId:fairyId}}).success(function(data){
            
            //Delete the 'space_request' and update existing spaces
            //update $scope.spaces;
            var indexToBeDelete  = $scope.spaces.indexOf(spaceToBeDelete);
            $scope.spaces.splice(indexToBeDelete,1);
            $scope.spaces.forEach(function(ele){
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
                $scope.connectedFairy.connected = false;
                
                for(var i=0;i<$scope.recipientFairyList.length;i++){
                    var fairyStr = $scope.recipientFairyList[i];
                    var connectedFairy = intersect(fairyStr.split(','),$scope.activeSpace.fairyId);
                        if(connectedFairy.length){
                            
                            $scope.connectedFairy.fairyId = connectedFairy[0];
                            $scope.connectedFairy.space = $scope.userWithSpaceData[index].space[i];
                            $scope.connectedFairy.connected = true;
                           
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
    
    var Message = function Message(id, labelIds, threadId, snippet, body, mimeType, from, date, to, subject, MIMEVersion, contentType, emailFromSpace, emailToSpace, spaceFairy,messageID,threadData,attachments){
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
        this.attachments = attachments;
    }
    
    function classifyThreads(allThreads){//Retrieve inbox messages
        var inboxThreads = [];
        if(allThreads.length){
            allThreads.forEach(function(thread){
                var content = thread.result;
                
                var lastMsg = content.messages[(content.messages.length-1)];
                if(lastMsg.labelIds){
                    if(lastMsg.labelIds[0]=="INBOX" || lastMsg.labelIds[0]=="SENT"){
                        var newThread = {'threadData':thread,"messages":[]};
                        thread.messages.forEach(function(message){
                            console.log(message);
                             var newMsg = new Message(message.id,message.labelIds,message.threadId, message.snippet, message.payload.body, message.payload.mimeType, "","","","","","","","","","","",[]);
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
                                if(message.payload.parts){//has attachment
                                    message.payload.parts.forEach(function(part){
                                        if(part.filename && part.filename.length >0){
                                            var attachId = part.body.attachmentId;
                                            GmailAPIService.getAttachment(message.id,attachId,part.filename);
                                            newMsg.attachments.push(part.filename);
                                            
                                        }else{
                                            newMsg.body = part.body;
                                        }
                                    });
                                }
                            }
                            newThread.messages.push(newMsg);
                        });
                        inboxThreads.push(newThread);
                    }
                }
            });
        }
        
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
            var temp = {'fairyId':space.fairyId,'id':space.id,'name':space.name,'uniqId':space.uniqId};
            spacesWithoutHash.push(temp);
        });
        
        //Initiating space with threads array.
        var userSpaceDataList = [];
        if($scope.spaces.length){
            $scope.spaces.forEach(function(ele){
                var temp = {'id':ele.uniqId,'name':ele.name,'threadsArray':[],'fairy':ele.fairyId};
                
                userSpaceDataList.push(temp);
            });
        }
        
        var spaceRequestList = [];
        inboxThreads.forEach(function(thread){
           
            if(thread.messages.length){
                var lastMsg = thread.messages[thread.messages.length-1];
                
                var fairyList = userSpaceDataList.map(function(x){return x.fairy});
                var elementPos = -1;
                for(var i=0;i<fairyList.length;i++){
                   
                    var overlap = intersect(fairyList[i],lastMsg.spaceFairy.attachedFairy);   
                    if (overlap.length){//has connection
                        elementPos = i;
                        break;
                    }
                }
                
                if(elementPos !== -1){//has fairy connection
                    userSpaceDataList[elementPos].threadsArray.push(thread);
                }else{//No fairy connection
                    
                    var attachedId = lastMsg.spaceFairy.attachedFairy[0];
                    if(!lastMsg.spaceFairy.group){//No group request
                        if(lastMsg.spaceFairy.state==true){
                            
                            var space = lastMsg.spaceFairy.space[0];
                            space.id = 'space_request_id';
                            var temp = {'fairyId':[attachedId],'id':space.id,'name':space.name,'uniqId':space.uniqId,'expiryDate':space.expiryDate,'group':-1};
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
                            
                            
                           var fairyId = space.fairyId[0];//If the sender can send the fairy request, this means space.fairyId[0] must belongs to the sender and this should be the one that the sender wants to share with the recipient.
                            var temp = {'fairyId':fairyId,'id':'space_request_id','name':space.name,'uniqId':'space_request_'+space.uniqId,'expiryDate':space.expiryDate,'group':newGroup.groupId};
                            spaceRequestList.push(temp);
                            newGroup.spacesData.push(temp);
                        });
                        groupWithoutHash.push(newGroup);
                        
                        $scope.groups = groupWithoutHash;
                        
                        
                    }
                    
                }
            }
        });
         
        //Deal with emails that belong to a space
        
        userSpaceDataList.forEach(function(space,index){
            var spaceName = space.name;
            
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
                            //newMessage.body = atob(emailMessage.body.data);
                            if(emailMessage.body.data){
                            $http.get('http://0.0.0.0:9001/safeDecode',{params:     {'encoded':emailMessage.body.data}}).success(function(data){
                                newMessage.body = data;
                            });
                            }
                           
                            newMessage.attachments = emailMessage.attachments;
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
        var spaceListtemp = $scope.spaces;
        spaceListtemp = spaceRequestList.concat(spaceListtemp);
        $scope.spaces = spaceListtemp;
    }
    
    function safeApply(scope, fn) {
        (scope.$$phase || scope.$root.$$phase) ? fn() : scope.$apply(fn);
    }
    
    $scope.composeMsg = function() {
        $("#compose").show();
        
        //$("#compose").css('visibility','visible');
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
        
    var fairyIdStr = $scope.activeSpace.fairyId.join();
    
    $http.get('http://0.0.0.0:9001/sendMessage',{params:{
            'emailMsg':$scope.email,
            'activeSpace':$scope.activeSpace,
            'fairySelected':$scope.fairySelected,
            'groupSelected':$scope.groupSelected,
            'attachedGroup':attachedGroup,
            'emailToSpace':$scope.email.space,
            'attachedFairy':fairyIdStr
        }}).success(function(data){
            GmailAPIService.sendMessage(data,$scope.email.threadId);
        });
        $("#compose").hide();
    };
    
    $scope.replyMsg = function(thread,replyTextIndex,spaceName){
        
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
        
        $scope.activeSpaceIndex = $("#activeSpaceIndex").val();
        emailMsg.body = document.getElementById("replyText"+replyTextIndex).value;
        $scope.activeSpace = $scope.spaces[$scope.activeSpaceIndex];
        
        emailMsg.space = JSON.parse(thread.lastMsg.msg.emailFromSpace).name;
        
        safeApply($scope,function(){});
        GmailAPIService.sendMessage(emailMsg,$scope.activeSpace,false,false,{},emailMsg.space,thread.lastMsg.msg.spaceFairy.attachedFairy);
    };
    
    $scope.close = function(){
        $("#compose").hide();   
    };
    
    $scope.threadHeaderOnClick = function(spaceId, index){
        $(".emailThreadBody").hide("fast");
        $(".threadBlock div").removeClass("activeThread");
        $("#emailThreadBody_"+spaceId+"_"+index).show("fast");
        $("#emailThread"+spaceId+"_"+index).toggleClass("activeThread");
    };
    
    $scope.messageHeaderOnClick = function(threadId, index,message){
        $("#emailBody_"+threadId+"_"+index).toggle("fast");
        if($("#emailMessage_"+threadId+"_"+index).hasClass("unreadThread")){
            $("#emailMessage_"+threadId+"_"+index).removeClass("unreadThread");
            GmailAPIService.markAsRead(message);
        }
    };
    
    $scope.updateFairySelected = function(fairySelected){
        $scope.fairySelected = fairySelected;
        safeApply($scope,function(){});
    };
    
    $scope.getGroups = function(emailAddress){
        $http.get('http://0.0.0.0:9001/getGroups',{params:{user:emailAddress}}).success(function(data){
            
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
    
    $scope.safeDecode = function(encodedData){
        $http.get('http://0.0.0.0:9001/safeDecode',{params:{'encoded':encodedData}}).success(function(data){
            document.getElementById("attachmentId").src = "data:image/jpeg;base64," + data;
        });
    };
    $scope.decodeToFile = function(encodedData,filename){
        
        $http.post('http://0.0.0.0:9001/decodeToFile', {encoded:encodedData,filename:filename}).
          success(function(data, status, headers, config) {
               
          }).
          error(function(data, status, headers, config) {});
    };
    
    
    $scope.spaceDragged = function(event, ui, userSpace,index){
        window.dragged = true;
        $scope.draggedData = {'index': index, 'space': userSpace};
        var _this = $(".userSpace_"+index);
        
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