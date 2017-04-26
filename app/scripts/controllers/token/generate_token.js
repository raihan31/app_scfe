'use strict';

angular.module('solcontrolApp').controller('generateToken', function($scope, $state, $stateParams, Restangular, SweetAlert) {

    //console.log("solcontroller", solcontroller.Solcontroller);

    var sc_id = $stateParams.sc_id;

    $scope.generated = true;

    Restangular.one('solcontroller', sc_id).get().then(function(response) {
      $scope.data = response.Solcontroller;
      $scope.data.recharge_amount_days = 0;
    });

    $scope.createToken = function (data) {
      var params = {};
      params.recharge_amount_days = data.recharge_amount_days;
      params.recharge_token = data.recharge_token;

      Restangular.one('solcontroller', sc_id).all('generate_token').post(params).then(function(response) {
        console.log("Token ", response);
        $scope.generated = false;
        $scope.token = response;
      });
    }

    $scope.confirmToken = function(data){
      var params = {}
      params.token = data.recharge_token;
      Restangular.one('solcontroller', sc_id).all('confirm_token').post(params).then(function(response) {

        SweetAlert.swal({
              title: '',
              type: 'success',
              text: 'The recharge token has been updated',
              confirmButtonColor: '#35B376'
          }, function () {
            $state.go('app.token.alltoken');
            $scope.generated = true;

          });
        }, function(error){
            console.log('Error with status', error.statusText, 'code', error.status);
            SweetAlert.swal({
                title: 'An error occured while updating the recharge token',
                type: 'error',
                text: 'Error with status ' + error.statusText + 'code ' + error.status,
                confirmButtonColor: '#B02E3A'
            });
        });

    }

});
