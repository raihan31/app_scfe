'use strict';

angular.module('Authentication')

.factory('AuthenticationService',
    ['$http', '$cookieStore', '$rootScope', '$timeout', 'Restangular', 'base64',
    function ($http, $cookieStore, $rootScope, $timeout, Restangular, base64) {

        var service = {};

        service.Login = function (username, password, callback) {

            Restangular.withConfig(function() {
                var encoded =  base64.encode(username + ':' + password);
                $http.defaults.headers.common.Authorization = 'Basic ' + encoded;
            }).all('accounts').one('sign_in').get().then(function(response) {
                response. success = true;
                callback(response);
            }, function(error){
                console.log('Error with status', error.statusText, 'code', error.status);
                error.message = 'Username or password is incorrect';
                callback(error);
            });

        };

        service.SetCredentials = function (user, password) {
            var authdata = base64.encode(user.phone + ':' + password);
            // Maybe use ngStorage with $sessionStorage instead
            $rootScope.globals = {
                currentUser: {
                    authdata: authdata,
                    user: user
                }
            };

            $http.defaults.headers.common['Authorization'] = 'Basic ' + authdata; // jshint ignore:line
            $cookieStore.put('globals', $rootScope.globals);
        };

        service.ClearCredentials = function () {
            $rootScope.globals = {};
            $cookieStore.remove('globals');
            $http.defaults.headers.common.Authorization = 'Basic ';
        };

        return service;
    }]);
