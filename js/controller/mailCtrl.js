webmaily.controller("mailController",function($scope){
    
    $scope.labels = [];
    $scope.allThreads = [];
    $scope.userSpaces=[];
    $scope.spaces = [{"id":"Label_1", "name":"Thesis"},
                     {"id":"Label_2", "name":"Conference"}, 
                     {"id":"Label_3","name":"Something Fun"}
                    ];
    $scope.email={};
    $scope.email.from = "welcome.easymail@gmail.com";
    $scope.email.to = "welcome.easymail@gmail.com";
    $scope.email.subject = "Thesis";
    $scope.email.space = "Thesis";
    $scope.email.body = "This is a greeting from Easymail Team";
    
    
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
        console.log($scope.email);
        sendMessage($scope.email);
        //$("#compose").hide();  
        
    };
});