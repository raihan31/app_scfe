'use strict';

/**
 * @ngdoc overview
 * @name solcontrolApp
 * @description
 * # solcontrolApp
 *
 * Main module of the application.
 */

angular.module('Authentication', []);

var solcontrolApp = angular
    .module('solcontrolApp', [
        'Constants',
        'Authentication',
        'ui.router',
        'ngCookies',
        'ui.bootstrap',
        'oc.lazyLoad',
        'restangular',
        'angucomplete-alt',
        'datatables',
        'datatables.bootstrap',
        'datatables.buttons',
        'easypiechart',
        'oitozero.ngSweetAlert',
        // 'chart.js',
        'daterangepicker',
        'ab-base64'
    ])
    .constant('COLORS', {
        'default': '#e2e2e2',
        primary: '#F69A34',
        success: '#35b376',
        warning: '#fad536',
        danger: '#b02e3a',
        info: '#41a3b5',
        white: 'white',
        dark: '#4C5064',
        border: '#e9e9e9',
        bodyBg: '#e9e9e9',
        textColor: '#616161',
    });

solcontrolApp.run(function($rootScope, $location, $cookieStore, $http) {
    // keep user logged in after page refresh
    $rootScope.globals = $cookieStore.get('globals') || {};
    if ($rootScope.globals.currentUser) {
        $http.defaults.headers.common['Authorization'] = 'Basic ' + $rootScope.globals.currentUser.authdata; // jshint ignore:line
    }

    $rootScope.$on('$locationChangeStart', function() {
        // redirect to login page if not logged in
        if ($location.path() !== '/login' && !$rootScope.globals.currentUser) {
            $location.path('/login');
        }
    });
    $rootScope.$on('$stateChangeStart', function() {
        // redirect to login page if not logged in
        if ($location.path() !== '/login' && !$rootScope.globals.currentUser) {
            $location.path('/login');

            // redirect to main page if not authorized
        } else if ((($location.path().lastIndexOf('/solshare', 0)) === 0) && ($rootScope.globals.currentUser.organisation !== 'SOLshare')) {
            $location.path('/');
        }
    });
});
