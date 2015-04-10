var webmaily = angular.module('webmaily',[]);
webmaily.directive('spaceOverview', function() {
  return {
      restrict: 'AE',
      link: function(scope, elem, attrs) {
            elem.bind('click',function(){
                
                scope.activeSpaceIndex = attrs['pageno']-1;
                $("#activeSpaceIndex").val(scope.activeSpaceIndex);
                scope.$apply();
              });
        
    }
  };
});
