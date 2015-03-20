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
    
    
    angular.element(window).bind('load', function() {
        handleClientLoad();
    });
    
    /*$scope.$watchCollection('labels', function (newVal, oldVal) {
        if (newVal.length) {
            newVal.forEach(function(label){
                var userSpace = {};
                userSpace.label = label;
                userSpace.threads = [];
                $scope.userSpaces.push(userSpace);
            });
            //getAllThreads($scope.labels);
            getAllThreads1($scope.spaces);
            safeApply($scope,function(){
            });
        }
    });*/
    $scope.$watchCollection('spaces', function (newVal, oldVal) {
        if (newVal.length) {
            newVal.forEach(function(space){
                var userSpace = {};
                userSpace.space = space;
                userSpace.threads = [];
                $scope.userSpaces.push(userSpace);
            });
            /*setInterval(function(){
                console.log("refresh");     
            }, 3000);*/
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
});