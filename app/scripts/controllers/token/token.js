'use strict';

angular.module('solcontrolApp').controller('allToken', function($scope, $state, $stateParams, Restangular, DTColumnDefBuilder, DTOptionsBuilder, DTColumnBuilder) {
    var vm = this;

    // Create the dataTable
    vm.dtOptions = DTOptionsBuilder.fromFnPromise(function() {
            return Restangular.all('solcontroller').getList();
        })
        .withDOM('<"mb15"B>lfrtip')
        .withPaginationType('full_numbers').withBootstrap().withLanguage({
            'sSearch': '<b>Filter: </b>',
            'sSearchPlaceholder': 'Search...'
        })
        .withButtons([])

        .withOption('scrollX', true);

    vm.dtColumns = [
      DTColumnBuilder.newColumn('serial_number').withTitle('Serial Number').withClass('odd-col').renderWith(function(data) {
          return '<span style="text-transform: capitalize;">' + data + '</span>';
      }),

      DTColumnBuilder.newColumn('recharge_token').withTitle('Recharge Token').withClass('odd-col').renderWith(function(data) {
          return '<span style="text-transform: capitalize;">' + data + '</span>';
      }),


      DTColumnBuilder.newColumn(null).withTitle('Action').withClass('odd-col action').notSortable()
      .renderWith(function(data) {
          var ret =
              '<div class="buttons"><button type="button" class="btn btn-edit btn-xs" onclick="angular.element(this).scope().goConfig(' + data.id + ')">Generate Token</button></div>';

          return ret;
      })



    ];

    vm.dtInstance = {};

    $scope.goConfig = function(id) {
        $state.go('app.token.config', { 'sc_id': id });
    };




});
