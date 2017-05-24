angular.module('trafficlights', [])
.controller('trafficlightsController', function ($scope, $timeout){
    
  $scope.data = [];
  $scope.structuredData = [];

  var getObjFromArray = function (array, name) {
    for (var o = 0; o < array.length; o++) {
      var obj = array[o];
      if (obj.name === name) {
        return obj;
      }
    }
  };

  $scope.gun = Gun(location.origin + '/gun');

  $scope.gun.get('data').map().val( function (a, b, c, d, e, f) {
    if (a != null) {
      $scope.data.push(a);
      $scope.structuredData.push(a);
    }
  });

  $scope.addTrafficlight = function () {
    var field_value = $scope.newName.trim();
    var new_type = $scope.newType.trim();
    if (field_value !== '' && new_type !== '') {
      const traffic_light = {};
      traffic_light.name = field_value;
      traffic_light.type = new_type;
      traffic_light.used_by = null;
      traffic_light.used_from = null;

      $scope.gun.get('data').path(field_value).put(traffic_light);

      $scope.newName = '';
      $scope.newType = '';

      document.getElementById('name').focus();
    }
  }

  $scope.clear = function() {
    var continueclear = confirm('Cancellare tutti i dati?');
    if (continueclear) {
      $scope.gun.get('data').map().put(null);
      $scope.data = [];
    }
  }

  $scope.setOccupied = function (name) {
    var username = $scope.username;
    if (username && username.trim() !== '') {

      //$scope.gun.get('data').path(name + '/used_by').put(username);
      //$scope.gun.get('data').path(name + '/used_from').put(moment(dataora.toString()).format("DD MMM YYYY HH:mm:ss"));
      $scope.gun.get('data').map().val( function (a, b, c, d, e, f) {
        if (a != null && a.name === name) {
          a.used_by = username;
          //a.used_from = new Date();
          $scope.gun.get('data').path(name).put(a);
        }
      });
    }
    else {
      document.getElementById('username').focus();
    }
  }

  $scope.setFree = function (name) {
      $scope.gun.get('data').path(name + '/used_by').put(null);
      $scope.gun.get('data').path(name + '/used_from').put(null);
  }

  $scope.remove = function (name) {
    if (confirm(`Are you sure you want to delete resource "${name}"?`)) {
      $scope.gun.get('data').path(name + '/used_by').put(null);
      $scope.gun.get('data').path(name + '/used_from').put(null);
      $scope.gun.get('data').path(name + '/type').put(null);
      $scope.gun.get('data').path(name).put(null);
    }
  }

  $scope.sortColumn = function (columnName) {
    
    if ($scope.order && $scope.order.column === columnName) {
        $scope.order.asc_desc *= -1;
    }
    else {
      $scope.order = { column: columnName, asc_desc: 1};
    }
    
    $scope.structuredData.sort( function (a, b) {
      var a = a[columnName] || '';
      var b = b[columnName] || '';
        
      if (columnName === 'name' || columnName === 'type' || columnName === 'used_by') {
        return a.localeCompare(b) * $scope.order.asc_desc;
      }
      else if (columnName === 'used_from') {
        a = new Date(a || 0);
        b = new Date(b || 0);
        return a.getTime() - b.getTime() * $scope.order.asc_desc;
      }
      else {
        return (a - b) * $scope.order.asc_desc
      }
    });
  }

});
