webmaily.controller("webmailController",function($scope){
    $scope.master = {firstName:"Xi", email:"easymail@gmail.com"};
    $scope.reset = function() {
        $scope.user = angular.copy($scope.master);
    };
    //invokes the reset() method
    $scope.reset();
});
