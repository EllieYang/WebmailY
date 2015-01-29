webmaily.controller("mailController",function($scope){
    
    $scope.labelId = "Label_2";
    $scope.labels = [];
    $scope.allThreads = [];
    $scope.userSpaces=[];
    
    angular.element(window).bind('load', function() {
        handleClientLoad();
    });
    
    $scope.$watchCollection('labels', function (newVal, oldVal) {
        if (newVal) {
            showLabels($scope.labels);
        }
    });
    $scope.$watchCollection('allThreads', function (newVal, oldVal) {
        if (newVal) {
            $scope.labels.forEach(function(label){
                //getThreads(label,$scope.allThreads);
                var userSpace = {};
                userSpace.label = label;
                
                
                    $scope.allThreads.forEach(function(thread){
                        threadsFetcher.fetch(label,thread);
                    });
                    userSpace.threads = threadsFetcher.threadArray;
                    $scope.userSpaces.push(userSpace);
                 
                safeApply($scope,function(){});
            });
        }
        
    });
    //$scope.googleApi = jQuery.data($(document),'googleApi');
    function safeApply(scope, fn) {
        (scope.$$phase || scope.$root.$$phase) ? fn() : scope.$apply(fn);
    }
    
});