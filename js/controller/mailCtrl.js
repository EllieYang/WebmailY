(function() {
  var webmailController;

  console.log('hello from mailController');

  webmailController = function(scopeVal) {
    return alert(scopeVal.firstName);
  };

  webmailController($scope);

}).call(this);

//# sourceMappingURL=mailCtrl.js.map
