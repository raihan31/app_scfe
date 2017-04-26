'use strict';

angular.module('solcontrolApp').controller('agentTransactionsModalTableCtrl', function($stateParams, $q, $scope, $state, Restangular, $uibModal, DTColumnDefBuilder, DTOptionsBuilder, DTColumnBuilder, sam) {
    var vm = this;
    $scope.agent_name = sam.Account.name;
    $scope.datePicker = {};
    $scope.datePicker.date = { startDate: $stateParams.start_date, endDate: $stateParams.end_date };
    $scope.datePicker.opts = {
        locale: {
            applyClass: 'btn-log'
        },
        ranges: {
            'Last 7 Days': [moment().subtract(6, 'days'), moment()],
            'Last 30 Days': [moment().subtract(29, 'days'), moment()]
        },
        eventHandlers: {
            'apply.daterangepicker': function() {
                var oneDay = 24 * 60 * 60 * 1000;
                var sd = $scope.datePicker.date.startDate._d;
                var startDate = sd.getFullYear() + '-' + (sd.getMonth() + 1) + '-' + sd.getDate();
                var ed = $scope.datePicker.date.endDate._d;
                var endDate = ed.getFullYear() + '-' + (ed.getMonth() + 1) + '-' + ed.getDate();
                var firstDate = new Date(startDate);
                var secondDate = new Date(endDate);
                var days = Math.round(Math.abs((firstDate.getTime() - secondDate.getTime()) / (oneDay)));
                if (days <= 31) {
                    return $state.go('app.agent.allagents.transactions.datefilter', { start_date: startDate, end_date: endDate });
                } else {
                    alert('Your date range should be less than 31 days');
                }
            }
        }
    };

    // $scope.agent_id = agent_id;
    // $scope.agent_name = agent_name;
    var getTableData = function() {
        var defer = $q.defer();
        var returnValue = [];

        Restangular.one('sam', $stateParams.agent_id).all('solcontroller_transaction').getList({ start_date: $stateParams.start_date, end_date: $stateParams.end_date }).then(function(result) {
            // for each customers
            if(result[0].customers != null) {
              for (var i = result[0].customers.length - 1; i >= 0; i--) {
                var customer = result[0].customers[i];

                // for each solcontrollers
                for (var k = customer.solcontrollers.length - 1; k >= 0; k--) {
                    var solcontrol = customer.solcontrollers[k];

                    // if there are transactions, for each transaction, and then create the hash
                    if (solcontrol.transactions) {
                        for (var j = solcontrol.transactions.length - 1; j >= 0; j--) {
                            var transaction = solcontrol.transactions[j];
                            var hash = {};
                            hash.id = transaction.id;
                            hash.ta_date = transaction.ta_date;
                            hash.serial_number = solcontrol.solcontroller.serial_number;
                            hash.name = customer.customer.name;
                            hash.payment_mode = transaction.ta_type_type;
                            hash.payment_type = transaction.payment_type;
                            hash.ta_amount = transaction.ta_amount;

                            returnValue.push(hash);
                        }
                    }
                }
            }

            } else {
              returnValue = [];
            }

            defer.resolve(returnValue);

        });

        return defer.promise;
    };

    vm.dtOptions = DTOptionsBuilder.fromFnPromise(getTableData()).withPaginationType('simple_numbers').withBootstrap().withLanguage({
            'sSearch': '_INPUT_',
            'sSearchPlaceholder': 'Search...',
        }).withOption('responsive', {
            'details': {
                'type': 'column',
                'target': 'tr'
            }
        })
        .withOption('order', [1, 'desc']);

    vm.dtColumns = [
        DTColumnBuilder.newColumn(null).withClass('control').notSortable().renderWith(function() { return null; }),
        DTColumnBuilder.newColumn('id').withTitle('ID').withClass('odd-col'),
        DTColumnBuilder.newColumn('ta_date').withTitle('Date Time').withClass('even-col')
        .renderWith(function(data) {
            var d = new Date(data);
            // we want to show BD time UTC0600 so -360
            var offset = d.getTimezoneOffset() + 360;
            d.setMinutes(d.getMinutes() + offset);
            var split = d.toString().split(' ');
            return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2) + ' ' + split[4];
        }),
        DTColumnBuilder.newColumn('serial_number').withTitle('SOLcontrol').withClass('odd-col'),
        DTColumnBuilder.newColumn('name').withTitle('Customer').withClass('even-col').renderWith(function(data) {
            return '<span style="text-transform: capitalize;">' + data + '</span>';
        }),
        DTColumnBuilder.newColumn('payment_mode').withTitle('Payment Mode').withClass('odd-col'),
        DTColumnBuilder.newColumn('payment_type').withTitle('Payment Type').withClass('odd-col')
        .renderWith(function(data) {
            return data && data != null ? data : '';
        }),
        DTColumnBuilder.newColumn('ta_amount').withTitle('Amount').withClass('even-col')
        .renderWith(function(data) {
            return data + ' Tk';
        }),
    ];

    $scope.goEdit = function(id) {
        $state.go('app.transaction.edittransaction', { 'transaction_id': id });
    };
    $scope.goView = function(id) {
        $state.go('app.transaction.viewtransaction', { 'transaction_id': id });
    };
    $scope.goViewCustomer = function(id) {
        $uibModal.open({
            templateUrl: 'views/customer/viewcustomer.html',
            controller: viewCustomerCtrl,
            resolve: {
                customer_id: function() { return id; }
            }
        });
    };
});
