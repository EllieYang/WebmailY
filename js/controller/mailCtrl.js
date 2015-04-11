webmaily.controller("mailController",['$scope','$http','$timeout','GmailAPIService',function($scope,$http,$timeout,GmailAPIService){
    
    $scope.labels = [];
    $scope.allThreads = [];
    $scope.userSpaces=[];
    $scope.spaces = [];
    $scope.email={};
    $scope.email.from = "welcome.easymail@gmail.com";
    $scope.email.to = "welcome.easymail@gmail.com";
    $scope.email.subject = "New Message";
    $scope.email.space = "space_1";
    $scope.email.body = "Type to write the email body";
    $scope.activeSpaceIndex = -1;
    $scope.activeSpace = {};
    $scope.fairySelected = false;
    $scope.fairyRequest = false;
    
    angular.element(window).bind('load', function() {
        //handleClientLoad();
        GmailAPIService.handleClientLoad();
        $http.get('data/users.json').success(function(data){ 
            $scope.userSpaces = [];
            console.log(data);
            data[0].space.forEach(function(space){
                var userSpace = {};
                userSpace.space = space;
                userSpace.threads = [];
                console.log();
                if(space.id=='space_request'){
                    userSpace.type="request";
                }else{
                    userSpace.type="normal";
                }
                $scope.userSpaces.push(userSpace);
            });
            $timeout(function(){
                $scope.spaces = data[0].space;
            },3000);
        });
    });
    
    $scope.addNewSpace = function(newSpaceName) {
        var spaceNameVal = $("#newSpaceName").val();
        var subspacesVal = $("#newSubspaces").val();
        var subspacesList = subspacesVal.split(';');
        var subspacesObjList =[];
        subspacesList.forEach(function(element, index){
            var newSub = new Space('space_'+index, element,[]);
            subspacesObjList.push(newSub);
        });
        console.log(subspacesObjList);
        var newspace = {"id":'space_'+($scope.spaces.length+1),"name":spaceNameVal,"subSpace":subspacesObjList};
        //var newspace = new Space('space_'+($scope.spaces.length+1),newSpaceName,[]);
        var currentuser = JSON.parse(localStorage.getItem("welcome.easymail"));
        currentuser.space.push(newspace);
        localStorage.setItem("welcome.easymail",JSON.stringify(currentuser));
        $scope.spaces = currentuser.space;
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
        newSpace.id = "space_"+newSpaceList.length;
        newSpaceList.push(newSpace);
        $scope.spaces = newSpaceList;
        console.log($scope.spaces);
        setTimeout(function(){   
            PageTransitions();
        },3000);
        safeApply($scope,function(){}); 
    };
    
    $scope.$watchCollection('spaces', function (newVal, oldVal) {
        if (newVal.length) {
            $scope.userSpaces = [];
            newVal.forEach(function(space){
                var userSpace = {};
                userSpace.space = space;
                userSpace.threads = [];
                if(space.id=='space_request'){
                    userSpace.type="request";
                }else{
                    userSpace.type="normal";
                }
                $scope.userSpaces.push(userSpace);
            });
            //getAllThreads1($scope.spaces);
            GmailAPIService.getAllThreads1($scope.spaces);
            safeApply($scope,function(){});
        }
    });
    
    $scope.$watch('activeSpaceIndex', function(){
        console.log("changed from controller");
    }, true);
    
   function safeApply(scope, fn) {
        (scope.$$phase || scope.$root.$$phase) ? fn() : scope.$apply(fn);
    }
    
    $scope.composeMsg = function() {
        $("#compose").show();
        $scope.activeSpaceIndex = $("#activeSpaceIndex").val();
        $scope.activeSpace = $scope.spaces[$scope.activeSpaceIndex];
        safeApply($scope,function(){});
    };
    $scope.sendMsg = function(){
        sendMessage($scope.email,$scope.activeSpace,$scope.fairySelected);
        $("#compose").hide();   
    };
    $scope.close = function(){
        $("#compose").hide();   
    };
    $scope.threadClicked = function(spaceId, index,lastMsg){
        
        $("#emailBody_"+spaceId+"_"+index).toggle("fast");
        if($("#emailThread_"+spaceId+"_"+index).hasClass("unreadThread")){
            $("#emailThread_"+spaceId+"_"+index).removeClass("unreadThread");
            console.log(lastMsg);
            markAsRead(lastMsg);
        }
        $("#emailThread_"+spaceId+"_"+index).toggleClass("activeThread");
    }
    $scope.updateFairySelected = function(fairySelected){
        $scope.fairySelected = fairySelected;
        safeApply($scope,function(){});
    }
    
    function assignColor(obj){
        var colors = ['#ff0000', '#00ff00', '#0000ff']; 
        var random_color = colors[Math.floor(Math.random() * colors.length)];
        obj.css('background-color', random_color);
    }
    
       
}]);