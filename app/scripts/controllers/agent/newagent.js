'use strict';
/*new Agent*/
angular.module('solcontrolApp').controller('newagent',function($state, $scope, Restangular, multiTabStepHandler, $rootScope, SweetAlert, base64) {
    $scope.regionalOffices = {};
    $scope.branchOffices = {};

    // For the date picker
    $scope.openDOB = function() {
        $scope.popupDOB.opened = true;
    };

    $scope.popupDOB = {
        opened: false
    };

    Restangular.one('regional_office').get().then(function(response) {
        $scope.regionalOffices = response.regional_offices;

        for (var i = response.branch_offices.length - 1; i >= 0; i--) {
            $scope.branchOffices[response.branch_offices[i][0].regional_office_id] = response.branch_offices[i];
        }
    }, function() {
        console.log('There was an error loading the offices');
    });

    $scope.steps = [
        'Information',
        'Validation',
        'Confirmation'
        ];
    $scope.selection = $scope.steps[0];

    $scope.fact = multiTabStepHandler;

    $scope.agent = {};
    $scope.createdAgent = {};
    $scope.agent_names = {};
    $scope.password = {};

    $scope.passwordMatch = true;

    // function to submit the form after all validation has occurred
    $scope.nextStep = function() {
        if ($scope.selection === 'Information'){
            $scope.agent.branch_office_id = $('#branch_officeSelect').val();
            $scope.agent.phone = '0088' + $scope.agent.phone;
            $scope.agent.name = $scope.agent_names.first_name + ' ' + $scope.agent_names.last_name;
            $scope.fact.incrementStep($scope);
        }
        else if ($scope.selection === 'Validation'){
            var authdata = base64.encode($rootScope.globals.currentUser.user.phone + ':' + $scope.password.password);
            if (authdata === $rootScope.globals.currentUser.authdata){
                $scope.passwordMatch = true;

                Restangular.all('sam').post($scope.agent).then(function(response) {
                    $scope.createdAgent = response;
                    $scope.fact.incrementStep($scope);
                }, function(error){
                    console.log('Error with status', error.statusText, 'code', error.status);
                    SweetAlert.swal('Error', 'The agent couldn\'t be created. \n' + error.data.error, 'error');
                });
            }else{
                $scope.passwordMatch = false;
            }
        }
    };

    $scope.previousStep = function(){
        $scope.fact.decrementStep($scope);
    };

    $scope.goBack = function(){
        $state.go('app.agent.allagents');
    };
});/*new Agent*/
