angular.module('trafficlights', [])
.controller('trafficlightsController', function ($scope, $timeout){

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
    $timeout(function () {
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
              if (v.endsWith('/used_by') || v.endsWith('/used_from')) {
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
              if (v.endsWith('/used_by') || v.endsWith('/used_from')) {
                obj.in_use = true;
              }
            }
            $scope.structuredData.push(obj);
          }
        }
      }
    }, 0);
  });

  $scope.addTrafficlight = function () {
    var field_value = $scope.newName.trim();
    var new_type = $scope.newType.trim();
    if (field_value !== '' && new_type !== '') {
      $scope.gun.get('data').path(field_value).put(field_value);
      $scope.gun.get('data').path(field_value + '/used_by').put(null);
      $scope.gun.get('data').path(field_value + '/used_from').put(null);
      $scope.gun.get('data').path(field_value + '/type').put(new_type);
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
      var dataora = new Date();

      $scope.gun.get('data').path(name + '/used_by').put(username);
      $scope.gun.get('data').path(name + '/used_from').put(moment(dataora.toString()).format("DD MMM YYYY HH:mm:ss"));
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
