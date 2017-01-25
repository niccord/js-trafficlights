angular.module('trafficlights', [])
.controller('trafficlightsController', function ($scope){

  var getObjFromArray = function (array, name) {
    for (var o = 0; o < array.length; o++) {
      var obj = array[o];
      if (obj.name === name) {
        return obj;
      }
    }
  };

  $scope.gun = Gun(location.origin + '/gun');

  $scope.gun.get('data').on(function(data){
    delete data._; // skip meta data!
    $scope.data = [];
    $scope.structuredData = [];
    for (var v in data) {
      if (data[v] !== null && data[v] !== undefined) {
        $scope.data.push({ id: v, data: data[v] });
        var name = v;
        var indexOfSlash = v.indexOf('/');
        if (indexOfSlash > 0) {
          name = name.substring(0, indexOfSlash);
        }
        var obj = getObjFromArray($scope.structuredData, name);
        if (obj) {
          if (indexOfSlash > 0) { 
            var attribute = v.substring(indexOfSlash + 1, v.length);
            obj[attribute] = data[v];
            if (data[v]) {
              obj.in_use = true;
            }
          }
          else {
            obj[v] = data[v];
          }
        }
        else {
          obj = {};
          obj.in_use = false;
          obj.name = name;
          if (indexOfSlash > 0) { 
            var attribute = v.substring(indexOfSlash + 1, v.length);
            obj[attribute] = data[v];
            if (data[v]) {
              obj.in_use = true;
            }
          }
          $scope.structuredData.push(obj);
        }
      }
    }
  });

  $scope.addTrafficlight = function () {
    var field_value = $scope.addField;
    if (field_value && field_value.trim() !== '') {
      $scope.gun.get('data').path(field_value).put(field_value);
      $scope.gun.get('data').path(field_value + '/used_by').put(null);
      $scope.gun.get('data').path(field_value + '/used_from').put(null);
      $scope.addField = '';
    }
  }

  $scope.clear = function() {
    $scope.gun.get('data').map().put(null);
    $scope.data = [];
  }
});
