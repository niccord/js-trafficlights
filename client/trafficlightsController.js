angular.module('trafficlights', [])
.controller('trafficlightsController', function ($scope, $timeout){
    
  $scope.data = [];

  $scope.gun = Gun(location.origin + '/gun');

  $scope.gun.get('data').map().on( function (value, key) {
    $timeout(function() {
      const res = getElemFromName(key);
      if (res !== undefined) {
        if (value != null) {
          res.used_by = value.used_by;
          res.used_from = value.used_from;
          res.in_use = value.in_use;
        }
        else {
          const index = $scope.data.indexOf(res);
          $scope.data.splice(index, 1);
        }
      }
      else if (value !== null) {
        $scope.data.push(value);
      }
    }, 0);
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
    var continueclear = confirm('Delete all data?');
    if (continueclear) {
      $scope.gun.get('data').map().put(null);
      $scope.data = [];
    }
  }

  function getElemFromName(name) {
    for (let d in $scope.data) {
        let res = $scope.data[d];
        if (res.name === name) {
          return res;
        }
    }
  }

  $scope.setOccupied = function (name) {
    var username = $scope.username;
    if (username && username.trim() !== '') {
      const res = getElemFromName(name);
      res.used_by = username;

      const dataora = new Date();
      res.used_from = moment(dataora.toString()).format("DD MMM YYYY HH:mm:ss");

      res.in_use = true;
      $scope.gun.get('data').path(name).put(res);
    }
    else {
      document.getElementById('username').focus();
    }
  }

  $scope.setFree = function (name) {
    const res = getElemFromName(name);
    res.used_by = null;
    res.used_from = null;
    res.in_use = false;
    $scope.gun.get('data').path(name).put(res);
  }

  $scope.remove = function (name) {
    if (confirm(`Are you sure you want to delete resource "${name}"?`)) {
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
    
    $scope.data.sort( function (a, b) {
      var a = a[columnName] || '';
      var b = b[columnName] || '';
        
      if (columnName === 'name' || columnName === 'type' || columnName === 'used_by') {
        return a.localeCompare(b) * $scope.order.asc_desc;
      }
      else if (columnName === 'used_from') {
        a = new Date(a || 0);
        b = new Date(b || 0);
        return (a.getTime() - b.getTime()) * $scope.order.asc_desc;
      }
      else {
        return (a - b) * $scope.order.asc_desc
      }
    });
  }

});
