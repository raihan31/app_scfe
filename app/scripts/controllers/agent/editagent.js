'use strict';

/*edit agent*/
angular.module('solcontrolApp')
    .controller('editAgent', function ($state, $stateParams, $scope, Restangular, SweetAlert) {

        $scope.loading = true;

        $scope.regionalOffices = {};
        $scope.branchOffices = [];
        var originalBranchOffice = {};

        var originalAgent = {};

        // For the date picker
        $scope.openDOB = function () {
            $scope.popupDOB.opened = true;
        };

        $scope.popupDOB = {
            opened: false
        };

        $scope.agent = {};
        $scope.agent_names = {};
        $scope.office = {};

        $scope.agent_id = $stateParams.agent_id;

        var nonBanglaPhone = false;

        Restangular.one('sam', $scope.agent_id).get().then(function (response) {
            $scope.agent = response;
            originalAgent = angular.copy(response);

            // Set name
            var names = response.Account.name.split(' ');
            $scope.agent_names.last_name = names[1].charAt(0).toUpperCase() + names[1].slice(1);
            $scope.agent_names.first_name = names[0].charAt(0).toUpperCase() + names[0].slice(1);
            originalAgent.last_name = names[1].charAt(0).toUpperCase() + names[1].slice(1);
            originalAgent.first_name = names[0].charAt(0).toUpperCase() + names[0].slice(1);
            originalAgent.Account.name = originalAgent.first_name + ' ' + originalAgent.last_name;

            // Set gender
            $scope.agent.Account.gender_id = response.Account.gender_id.toString();
            originalAgent.Account.gender_id = response.Account.gender_id.toString();

            // Set phone number
            var phoneSplited = response.Account.phone.split(/^0088/);
            if (phoneSplited.length === 2) { // Bangladeshi phone, remove the prefix 0088
                $scope.agent.Account.phone = phoneSplited[1];
                originalAgent.Account.phone = phoneSplited[1];
            } else { // Non-bangla phone, keep as it is
                nonBanglaPhone = true;
            }

            // Set date of birth, if exists
            if (response.Sam.date_of_birth) {
                $scope.agent.Sam.date_of_birth = new Date(response.Sam.date_of_birth);
                originalAgent.Sam.date_of_birth = $scope.agent.Sam.date_of_birth;
            }

            // Get branch office
            Restangular.one('regional_office').get().then(function (response) {

                // Check GET /regional_office response value to understand the following
                for (var i = response.regional_offices.length - 1; i >= 0; i--) { // for each regional office
                    $scope.regionalOffices[response.regional_offices[i].id.toString()] = response.regional_offices[i].name;
                }

                for (i = response.branch_offices.length - 1; i >= 0; i--) { // go all over the branch offices
                    for (var j = response.branch_offices[i].length - 1; j >= 0; j--) { // for each branch office
                        $scope.branchOffices.push(response.branch_offices[i][j]); // add all branch offices in the $scope.branch_office array

                        if (response.branch_offices[i][j].id === originalAgent.Sam.branch_office_id) { // Look for the agent's branch office
                            // selectedRegionalOffice is the ID of the selected regional office
                            $scope.office.selectedRegionalOffice = response.branch_offices[i][j].regional_office_id.toString();

                            // selectedBranchOffice is the complete selected branch office object
                            $scope.office.selectedBranchOffice = response.branch_offices[i][j];

                            originalBranchOffice = $scope.office.selectedBranchOffice;
                        }
                    }
                }

                $scope.loading = false;
            }, function () {
                console.log('There was an error loading the offices');
            });

        }, function (error) {
            console.log('Error with status', error.statusText, 'code', error.status);
        });

        $scope.reset = function () {
            $scope.agent = angular.copy(originalAgent);

            // reset names
            $scope.agent_names.last_name = originalAgent.last_name;
            $scope.agent_names.first_name = originalAgent.first_name;

            // reset date of birth
            $scope.agent.Sam.date_of_birth = originalAgent.Sam.date_of_birth;

            // reset offices
            $scope.office.selectedRegionalOffice = originalBranchOffice.regional_office_id.toString();
            $scope.office.selectedBranchOffice = originalBranchOffice;
        };

        $scope.nextStep = function () {
            $scope.agent.Account.name = $scope.agent_names.first_name + ' ' + $scope.agent_names.last_name;
            $scope.agent.Sam.branch_office_id = $scope.office.selectedBranchOffice.id;
            if (!nonBanglaPhone) {
                $scope.agent.Account.phone = '0088' + $scope.agent.Account.phone;
            }

            var params = {};
            for (var prop in $scope.agent) {
                if (!$scope.agent.hasOwnProperty(prop)) {
                    continue;
                } else {
                    if (prop === 'Sam') {
                        if ($scope.agent.Sam !== originalAgent.Sam) {
                            for (var propSam in $scope.agent.Sam) {
                                if ($scope.agent.Sam[propSam] !== originalAgent.Sam[propSam]) {
                                    params[propSam] = $scope.agent.Sam[propSam];
                                }
                            }
                        }
                    } else if (prop === 'Address') {
                        if ($scope.agent.Address !== originalAgent.Address) {
                            for (var propAddress in $scope.agent.Address) {
                                if ($scope.agent.Address[propAddress] !== originalAgent.Address[propAddress]) {
                                    params[propAddress] = $scope.agent.Address[propAddress];
                                }
                            }
                        }
                    } else if (prop === 'Account') {
                        if ($scope.agent.Account !== originalAgent.Account) {
                            for (var propAccount in $scope.agent.Account) {
                                if ($scope.agent.Account[propAccount] !== originalAgent.Account[propAccount]) {
                                    params[propAccount] = $scope.agent.Account[propAccount];
                                }
                            }
                        }
                    }
                }
            }

            // If no param has been changed
            if (Object.keys(params).length === 0) {
                SweetAlert.swal({
                    title: '',
                    text: 'No change needs to be done',
                    confirmButtonColor: '#41a3b5'
                }, function () {
                    $state.go('app.agent.allagents');
                });
            } else {
                Restangular.one('sam', $scope.agent_id).patch(params).then(function () {
                    SweetAlert.swal({
                        title: '',
                        type: 'success',
                        text: 'The agent has been updated',
                        confirmButtonColor: '#35B376'
                    }, function () {
                        $state.go('app.agent.allagents');
                    });
                }, function (error) {
                    console.log('Error with status', error.statusText, 'code', error.status);
                    SweetAlert.swal({
                        title: 'An error occured while updating the agent',
                        type: 'error',
                        text: 'Error with status ' + error.statusText + 'code ' + error.status,
                        confirmButtonColor: '#B02E3A'
                    });
                });
            }
        };
    });/*edit agent*/
