'use strict';

angular.module('Authentication')

.controller('LoginController',
    ['$scope', '$rootScope', '$location', '$timeout', 'AuthenticationService', 'Restangular',
    function ($scope, $rootScope, $location, $timeout, AuthenticationService, Restangular) {
        // reset login status
        AuthenticationService.ClearCredentials();

        $timeout(function(){
            var filled = ($('input:password').css('background-color') === 'rgb(250, 255, 189)');
            if ((filled) && ($('input:input').val())){
                $scope.form.$invalid = false;
            }
        }, 200);

        $scope.login = function () {
            $scope.dataLoading = true;
            AuthenticationService.Login($scope.phone_number, $scope.password, function (response) {
                if (response.success) {
                    // Get user organisation
                    Restangular.all('organisation').getList().then(function(organisations){
                        for (var i = organisations.length - 1; i >= 0; i--) {
                            if(organisations[i].id === response.organisation_id){
                                var organisation_name = organisations[i].name;
                                switch(organisation_name){
                                    case 'solshare':
                                        response.organisation = 'SOLshare';
                                        break;
                                    case 'ubomus':
                                        response.organisation = 'UBOMUS';
                                        break;
                                    case 'gs': // For development
                                        response.organisation = 'Grameen Shakti';
                                        break;
                                    case 'grameen shakti': // For production
                                        response.organisation = 'Grameen Shakti';
                                        break;
                                    case 'redi':
                                        response.organisation = 'REDI';
                                        break;
                                    case 'pacific solar':
                                        response.organisation = 'Pacific Solar';
                                        break;
                                    case 'bgef':
                                        response.organisation = 'BGEF';
                                        break;
                                }

                                AuthenticationService.SetCredentials(response, $scope.password);
                                $location.path('/');
                            }
                        }
                    });

                } else {
                    AuthenticationService.ClearCredentials();
                    $scope.error = response.message;
                    $scope.dataLoading = false;
                }
            });
        };
    }]);
