var webmaily = angular.module('webmaily',['ngRoute','googleApi'])
    .config(function(googleLoginProvider){
        googleLoginProvider.config({
            clientId : '130554426228-5n2t4fcm2k9g977mvodfh9vo9591u69t.apps.googleusercontent.com',
            apiKey :'AIzaSyCeE7WUuVzyOQUlQuRuSZ5O_h_cw4MLn2k',
            scopes : 'https://www.googleapis.com/auth/gmail.readonly'
        });
    });

webmaily.controller("validateController",function($scope){
   $scope.user = 'John Doe';
    $scope.email = 'john.doe@gmail.com';
});
