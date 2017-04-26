'use strict';


/*all branches*/
angular.module('solcontrolApp').controller('allBranches',function($scope, $state, $uibModal, DTOptionsBuilder, DTColumnBuilder, $http, $q,  Restangular, SweetAlert, reasons) {

    var vm = this;

    vm.dtOptions = DTOptionsBuilder.fromFnPromise(function() {
        return Restangular.all('show_all_region_and_branch').getList();
    }).withPaginationType('full_numbers').withBootstrap().withLanguage({
        'sSearch': '<b>Filter: </b>',
        'sSearchPlaceholder': 'Search...'
    }).withOption('responsive', {
        'details': {
            'type': 'column',
            'target': 'tr'
        }
    });

    vm.dtColumns = [
      DTColumnBuilder.newColumn('branch_name').withTitle('Branch').withClass('odd-col').renderWith(function(data) {
          return '<span style="text-transform: capitalize;">' + data + '</span>';
      }),

      DTColumnBuilder.newColumn(null).withTitle('Action').withClass('even-col action').notSortable()
      .renderWith(function(data) {
          var ret =
              '<div class="buttons"><button type="button" class="btn btn-edit btn-xs" onclick="angular.element(this).scope().editBranch(' + data.branch_id + ')">Edit Branch</button></div>';

          return ret;
      }),
      DTColumnBuilder.newColumn('region_name').withTitle('Region').withClass('odd-col').renderWith(function(data) {
          return '<span style="text-transform: capitalize;">' + data + '</span>';
      }),

      DTColumnBuilder.newColumn(null).withTitle('Action').withClass('even-col action').notSortable()
      .renderWith(function(data) {
          var ret =
              '<div class="buttons"><button type="button" class="btn btn-other btn-xs" onclick="angular.element(this).scope().editRegion(' + data.region_id + ')">Edit Region </button></div>';

          return ret;
      })
    ];

    $scope.editRegion = function(id) {
        $state.go('app.editregion', { 'id': id });
    };

    $scope.editBranch = function(id) {
        $state.go('app.editbranch', { 'id': id });
    };


});/*all branches*/
