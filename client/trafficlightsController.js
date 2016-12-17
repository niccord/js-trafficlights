angular.module('trafficlights', [])
.controller('trafficlightsController', function ($scope){


  $scope.gun = Gun(location.origin + '/gun');

  $scope.gun.get('data').on(function(data){
    delete data._; // skip meta data!
    $scope.data = [];
    for (var v in data) {
      if (data[v] !== null && data[v] !== undefined) {
        $scope.data.push({ id: v, data: data[v] });
      }
    }
  });

  $scope.addTrafficlight = function () {
    var field_value = $scope.addField;
    $scope.gun.get('data').path(field_value + '/used_by').put('no one');
    $scope.gun.get('data').path(field_value + '/used_from').put('no time');
    $scope.addField = '';
  }

  $scope.clear = function() {
    $scope.gun.get('data').map().put(null);
    $scope.data = [];
  }
});
