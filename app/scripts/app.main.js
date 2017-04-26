'use strict';

angular
  .module('solcontrolApp')
  .controller('AppCtrl', ['$scope',
        function AppCtrl($scope) {

            $scope.mobileView = 767;

            $scope.app = {
            name: 'SOLshare',
            version: '1.0.0',
            year: (new Date()).getFullYear(),
            layout: {
                isSmallSidebar: false,
                isChatOpen: false,
                isFixedHeader: true,
                isFixedFooter: false,
                isBoxed: false,
                isStaticSidebar: false,
                isRightSidebar: false,
                isOffscreenOpen: false,
                isConversationOpen: false,
                isQuickLaunch: false,
                sidebarTheme: '',
                headerTheme: ''
                },
            };

        }
]);
