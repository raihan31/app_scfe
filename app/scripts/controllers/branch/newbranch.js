'use strict';
angular.module('solcontrolApp').controller('newbranch', function($state, $http, $scope, Restangular, multiTabStepHandler, $rootScope, SweetAlert, base64) {

    $scope.steps = [
        'Information',
        'Validation',
        'Confirmation'
    ];
    $scope.selection = $scope.steps[0];

    $scope.fact = multiTabStepHandler;

    $scope.branch = {};
    $scope.createdBranch = {};

    $scope.password = {};

    $scope.passwordMatch = true;

    Restangular.all('organisation').getList().then(function(response) {
        $scope.organisations = response;
    }, function(error) {
        console.log('Error with status', error.statusText, 'code', error.status);

    });


    $scope.dynamicBranches = [{
        id: 1
    }];

    $scope.addDynamicBranch = function() {
        var newItemNo = $scope.dynamicBranches.length + 1;
        $scope.dynamicBranches.push({
            'id': newItemNo
        });
    };

    $scope.removeDynamicBranch = function() {
        var lastItem = $scope.dynamicBranches.length - 1;
        $scope.dynamicBranches.splice(lastItem);
    };


    // function to submit the form after all validation has occurred
    $scope.nextStep = function() {
        if ($scope.selection === 'Information') {
            $scope.fact.incrementStep($scope);
        } else if ($scope.selection === 'Validation') {
            var authdata = base64.encode($rootScope.globals.currentUser.user.phone + ':' + $scope.password.password);
            if (authdata === $rootScope.globals.currentUser.authdata) {
                $scope.passwordMatch = true;

                var branchArr = [];
                var dynamicBranches = $scope.dynamicBranches;

                for (var i = 0; i < dynamicBranches.length; i++) {
                    branchArr.push(dynamicBranches[i].name);
                }

                var params = [{
                    "region": $scope.branch.region,
                    "branches": branchArr
                }];

                Restangular.one('organisation', $scope.branch.organisation.id).all('add_region_and_branch_data').post(params).then(function(response) {
                    $scope.createdBranch = response;
                    $scope.fact.incrementStep($scope);

                  }, function(error){
                      console.log('Error with status', error.statusText, 'code', error.status);
                      SweetAlert.swal({
                          title: 'An error occured while creating branch',
                          type: 'error',
                          text: 'Error with status ' + error.statusText + 'code ' + error.status,
                          confirmButtonColor: '#B02E3A'
                      });
                  });


            } else {
                $scope.passwordMatch = false;
            }
        }
    };

    $scope.previousStep = function() {
        $scope.fact.decrementStep($scope);
    };

    $scope.branchFormReset = function(){
      $scope.branch = {};
      $scope.dynamicBranches = [{
          id: 1
      }];
    }

    $scope.goBack = function() {
        $state.go('app.branch.allbranches');
    };

});
