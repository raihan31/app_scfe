'use strict';

angular.module('solcontrolApp').controller('editBranch', function($state, $stateParams,  $scope, Restangular, multiTabStepHandler, $rootScope, SweetAlert, base64, branch, regions) {
    $scope.branch = branch[0];
    $scope.selectedRegion = branch[1];
    $scope.regions = regions;

    $scope.steps = [
        'Information',
        'Validation'
    ];
    $scope.selection = $scope.steps[0];

    $scope.fact = multiTabStepHandler;

    $scope.password = {};

    $scope.passwordMatch = true;
    
    $scope.regionChange = function(data){
        $scope.branch.regional_office_id = data.id
    }

    // function to submit the form after all validation has occurred
    $scope.nextStep = function() {
        if ($scope.selection === 'Information') {
            $scope.fact.incrementStep($scope);
        } else if ($scope.selection === 'Validation') {
            var authdata = base64.encode($rootScope.globals.currentUser.user.phone + ':' + $scope.password.password);
            if (authdata === $rootScope.globals.currentUser.authdata) {
                $scope.passwordMatch = true;
                Restangular.one('branch_office', $stateParams.id).patch($scope.branch).then(function(response) {
                  SweetAlert.swal({
                      title: '',
                      type: 'success',
                      text: 'The branch has been updated',
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

    // $scope.deleteBranch = function (id) {
    //   SweetAlert.swal({
    //     title: "Delete a branch!",
    //     text: "You are going to delete a branch. Please enter your password:",
    //     type: "input",
    //     showCancelButton: true,
    //     closeOnConfirm: false,
    //     animation: "slide-from-top",
    //     inputPlaceholder: "Write something"
    //   },
    //
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
    //       var branch = Restangular.one('branch_office', id);
    //       branch.remove();
    //       swal("Nice!", "You have successfully deleted the branch ", "success");
    //       $state.go('app.branch.allbranches');
    //     } else {
    //       swal.showInputError("Your password odes not match!!");
    //       return false
    //     }
    //
    //   });
    // }


    $scope.previousStep = function() {
        $scope.fact.decrementStep($scope);
    };



    $scope.goBack = function() {
        $state.go('app.branch.allbranches');
    };

});
