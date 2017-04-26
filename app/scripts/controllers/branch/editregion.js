'use strict';

angular.module('solcontrolApp').controller('editRegion', function($state, $stateParams, $http, $scope, Restangular, multiTabStepHandler, $rootScope, SweetAlert, base64, organisations, regional_office) {

    $scope.regional_office = regional_office[0];
    $scope.selectedOrganisation = regional_office[1];
    $scope.organisations = organisations;

    $scope.steps = [
        'Information',
        'Validation'
    ];
    $scope.selection = $scope.steps[0];

    $scope.fact = multiTabStepHandler;

    $scope.password = {};

    $scope.passwordMatch = true;

    $scope.organisationChange = function(data){
        $scope.regional_office.organisation_id = data.id;
    }

    // function to submit the form after all validation has occurred
    $scope.nextStep = function() {
        if ($scope.selection === 'Information') {
            $scope.fact.incrementStep($scope);

        } else if ($scope.selection === 'Validation') {
            var authdata = base64.encode($rootScope.globals.currentUser.user.phone + ':' + $scope.password.password);
            if (authdata === $rootScope.globals.currentUser.authdata) {
                $scope.passwordMatch = true;
                Restangular.one('regional_office', $stateParams.id).patch($scope.regional_office).then(function(response) {
                  SweetAlert.swal({
                      title: '',
                      type: 'success',
                      text: 'The region has been updated',
                      confirmButtonColor: '#35B376'
                  }, function () {
                      $state.go('app.branch.allbranches');
                  });
                }, function(error){
                    console.log('Error with status', error.statusText, 'code', error.status);
                    SweetAlert.swal({
                        title: 'An error occured while updating the branch',
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

    // $scope.deleteRegion = function (id) {
    //   SweetAlert.swal({
    //     title: "Delete a Region!",
    //     text: "You are going to delete a region. Please enter your password:",
    //     type: "input",
    //     showCancelButton: true,
    //     closeOnConfirm: false,
    //     animation: "slide-from-top",
    //     inputPlaceholder: "Write something"
    //   },
    //   function(inputValue){
    //     var authdata = base64.encode($rootScope.globals.currentUser.user.phone + ':' + inputValue);
    //
    //     if (inputValue === false) return false;
    //
    //     if (inputValue === "") {
    //       swal.showInputError("You need to provide your password!");
    //       return false
    //     }
    //
    //     if (authdata === $rootScope.globals.currentUser.authdata) {
    //       var region = Restangular.one('regional_office', id);
    //       region.remove();
    //       swal("Nice!", "You have deleted a region", "success");
    //       // $state.go('app.branch.allbranches');
    //     } else {
    //       swal.showInputError("Your password odes not match!!");
    //       return false
    //     }
    //
    //     // swal("Nice!", "You wrote: " + inputValue, "success");
    //   });
    // }

    $scope.previousStep = function() {
        $scope.fact.decrementStep($scope);
    };



    $scope.goBack = function() {
        $state.go('app.branch.allbranches');
    };

});
