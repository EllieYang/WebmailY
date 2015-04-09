webmaily.controller("mailController",function($scope){
    
    $scope.labels = [];
    $scope.allThreads = [];
    $scope.userSpaces=[];
    /*$scope.spaces = [{"id":"space_1", "name":"Thesis"},
                     {"id":"space_2", "name":"Conference"}, 
                     {"id":"space_3","name":"Something Fun"}
                    ];*/
    $scope.spaces = [];
    $scope.email={};
    $scope.email.from = "welcome.easymail@gmail.com";
    $scope.email.to = "welcome.easymail@gmail.com";
    $scope.email.subject = "New Message";
    $scope.email.space = "space_1";
    $scope.email.body = "Type to write the email body";
    //$scope.newSpaceName = "Space Name";
    
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
        //$scope.newSpaceName = 'Space Name';
        safeApply($scope,function(){});  
    };
    
    angular.element(window).bind('load', function() {
        handleClientLoad();
    });
    
    $scope.$watchCollection('spaces', function (newVal, oldVal) {
        if (newVal.length) {
           $scope.userSpaces = [];
            newVal.forEach(function(space){
                var userSpace = {};
                userSpace.space = space;
                userSpace.threads = [];
                $scope.userSpaces.push(userSpace);
            });
           getAllThreads1($scope.spaces);
           safeApply($scope,function(){});
        }
    });
    
    
    
   function safeApply(scope, fn) {
        (scope.$$phase || scope.$root.$$phase) ? fn() : scope.$apply(fn);
    }
    
    $scope.composeMsg = function() {
        $("#compose").show();
    };
    $scope.sendMsg = function(){
        sendMessage($scope.email);
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
    
    function assignColor(obj){
        var colors = ['#ff0000', '#00ff00', '#0000ff']; 
        var random_color = colors[Math.floor(Math.random() * colors.length)];
        obj.css('background-color', random_color);
    }

});