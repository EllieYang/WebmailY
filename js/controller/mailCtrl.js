webmaily.controller("mailController",function($scope){
    
    $scope.labels = [];
    $scope.allThreads = [];
    $scope.userSpaces=[];
    
    angular.element(window).bind('load', function() {
        handleClientLoad();
    });
    
    $scope.$watchCollection('labels', function (newVal, oldVal) {
        if (newVal.length) {
            newVal.forEach(function(label){
                var userSpace = {};
                userSpace.label = label;
                userSpace.threads = [];
                $scope.userSpaces.push(userSpace);
            });
            getAllThreads($scope.labels);
            safeApply($scope,function(){
            });
        }
    });
   function safeApply(scope, fn) {
        (scope.$$phase || scope.$root.$$phase) ? fn() : scope.$apply(fn);
    }
    
    $scope.composeMsg = function() {
        $("#compose").show();
    };
    $scope.sendMsg = function(){
        sendMessage("me", "This is an email", function(){
            $("#compose").hide();
        });
          
    };
});