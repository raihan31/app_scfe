'use strict';

angular.module('solcontrolApp').controller('viewcustomer', function ($q, $timeout, $stateParams, $scope, Restangular, $state, SweetAlert, DTColumnDefBuilder, DTOptionsBuilder, DTColumnBuilder, transactions, $rootScope, $uibModal, customer) {
    var vm = this;
    $scope.transactions = transactions;
    $scope.loading = true;

    $scope.customer = {};
    $scope.agent = {};
    $scope.solcontrols = [];
    $scope.solcontrol_loans = {};
    $scope.outstanding_balance = null;
    $scope.address = '';
    $scope.currentUser = $rootScope.globals.currentUser.user;

    $scope.customer_id = $stateParams.customer_id;
    $scope.solcontrol_id = $stateParams.solcontrol_id;

    // get customer and agent
    if (customer != null) {
        $scope.customer = customer.customer;
        var phoneSplited = customer.customer.phone.split(/^0088/);
        if (phoneSplited.length === 2) { // Bangladeshi phone, remove the prefix 0088
            $scope.customer.phone = phoneSplited[1];
        }

        if (customer.address) {
            $scope.address = customer.address.division + ' ' + customer.address.district + ' ' + customer.address.upazila + ' ' +
                customer.address.village + ' ' + customer.address.ward + ' ' + customer.address.union_parishad;
        }
        else {
            $scope.address = 'N/A';
        }

        $scope.agent = customer.sam;

        phoneSplited = customer.sam.phone.split(/^0088/);
        if (phoneSplited.length === 2) { // Bangladeshi phone, remove the prefix 0088
            $scope.agent.phone = phoneSplited[1];
        }
        $scope.loading = false;
    }
    else {
        SweetAlert.swal({
            title: 'There is no customer present with the id ' + $stateParams.customer_id,
            type: 'error',
        },
            function () {
                $state.go('app.solcontrol.allsolcontrols');
            }
        );
    }


    // get solcontrols
    Restangular.one('customer', $scope.customer_id).all('solcontroller').getList().then(function (response) {
        $scope.solcontrols = response;
    }, function (error) {
        console.log('Error with status', error.statusText, 'code', error.status);
    });

    // Get loans
    Restangular.one('customer', $scope.customer_id).all('solcontroller_loan').getList().then(function (response) {
        for (var i = response.length - 1; i >= 0; i--) {
            $scope.solcontrol_loans[response[i].solcontroller_id] = response[i];
        }
    }, function (error) {
        console.log('Error with status', error.statusText, 'code', error.status);
    });

    $scope.goEdit = function (id) {
        $state.go('app.customer.editcustomer', { 'customer_id': id });
    };

    $scope.goLoanEdit = function (sol_id, sol_laon_id) {
        $state.go('app.customer.viewcustomer.editloan', { sol_id: sol_id, sol_loan_id: sol_laon_id });
    };

    $scope.delete = function (id) {
        if ($scope.globals.currentUser.user.organisation === 'SOLshare') {
            SweetAlert.swal({
                title: 'Are you sure you want to delete customer ' + id + '?',
                type: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#b02e3a',
                confirmButtonText: 'Yes',
                closeOnConfirm: false,
                animation: false
            },
                function (isConfirm) {
                    if (isConfirm) {
                        Restangular.one('customer', id).remove().then(function () {
                            SweetAlert.swal('Deleted!', 'The customer ' + id + ' has been deleted.', 'success');
                            $state.go('app.solcontrol.allsolcontrols');
                        }, function errorCallback() {
                            SweetAlert.swal('Error', 'The customer couldn\'t be deleted. Please try again later.', 'error');
                        });
                    }
                }
            );
        }
    };


    /*For customer legder datatable */


    vm.dtOptions = DTOptionsBuilder.fromFnPromise(function () {
        var defer = $q.defer();
        defer.resolve(transactions.details_ledger);
        return defer.promise;
    })
        .withPaginationType('simple_numbers').withBootstrap().withOption('order', [1, 'desc'])
        .withOption('footerCallback', function (tfoot, data) {
            if (data.length > 0) {
                var _this = this;
                // https://docs.angularjs.org/error/$rootScope/inprog?p0=$apply
                $timeout(function () {
                    $scope.pageSum = 0;
                    var sumsVisibleObject = _this._('tr', { 'page': 'current' });
                    for (var i = sumsVisibleObject.length - 1; i >= 0; i--) {
                        $scope.pageSum += sumsVisibleObject[i].amount;
                    }
                    $scope.loading = false;
                }, 0);
            }
        })
        .withOption('fnInitComplete', function () {
            // Without this the horizontal scrollbar will be at the bottom of tbody and on top of tfoot

            // Disable TBODY scoll bars
            $('.dataTables_scrollBody').css({
                'overflow': 'hidden',
                'border': '0'
            });

            // Enable TFOOT scoll bars
            $('.dataTables_scrollFoot').css('overflow', 'auto');

            // Sync TFOOT scrolling with TBODY
            $('.dataTables_scrollFoot').on('scroll', function () {
                $('.dataTables_scrollBody').scrollLeft($(this).scrollLeft());
            });
        })
        .withOption('scrollX', true);

    vm.dtColumns = [
        DTColumnBuilder.newColumn('date').withTitle('Payment Time and Date').withClass('even-col').renderWith(function (data) {
            if (data !== null) {
                var d = new Date(data);
                // we want to show BD time UTC0600 so -360
                var offset = d.getTimezoneOffset() + 360;
                d.setMinutes(d.getMinutes() + offset);
                var split = d.toString().split(' ');
                return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2) + ' ' + split[4];
            } else {
                return '';
            }
        }),
        DTColumnBuilder.newColumn('payment_mode').withTitle('Payment Mode').withClass('odd-col').renderWith(function (data) {
            return data && data != null ? data : '';
        }),
        DTColumnBuilder.newColumn('transaction_id').withTitle('Transaction ID').withClass('even-col').renderWith(function (data) {
            return data && data != null ? data : '';
        }),
        DTColumnBuilder.newColumn('payment_type').withTitle('Payment Type').withClass('odd-col').renderWith(function (data) {
            return data && data != null ? data : '';
        }),
        DTColumnBuilder.newColumn('amount').withTitle('Payment Amount').withClass('even-col').renderWith(function (data) {
            return data && data != null ? data + ' TK' : '';
        })
    ];
    vm.dtInstance = {};

    $scope.saveInstallmentAmount = function (amount, sol) {

        var params = {
            amount: amount,
            type_id: 1
        }
        if ($scope.currentUser.accountable_type == 'Login') {
            SweetAlert.swal({
                title: 'Please confirm you want to create Installment for amount ' + amount + ' for controller number "SOLcontrol ' + sol.serial_number + '"',
                type: 'success',
                showCancelButton: true,
                confirmButtonColor: '#35B376',
                confirmButtonText: 'Confirm',
                closeOnConfirm: true,
                animation: true
            },
                function (isConfirm) {
                    if (isConfirm) {
                        Restangular.one('solcontroller', sol.id)
                            .all('transaction_installment')
                            .post(params)
                            .then(function (response) {
                                SweetAlert.swal('Added!', 'The Installment has been added.', 'success');
                                $state.go('app.customer.viewcustomer', { customer_id: $stateParams.customer_id }, { reload: true });
                            }, function errorCallback() {
                                SweetAlert.swal('Error', 'The Installment couldn\'t be added. Please try again later.', 'error');
                            });
                    }
                }
            );
        };

    };

    $scope.saveDownpaymentAmount = function (amount, sol) {
        var params = {
            amount: amount,
            type_id: 1
        }
        if ($scope.currentUser.accountable_type == 'Login') {
            SweetAlert.swal({
                title: 'Please confirm you want to create Downpayment for amount ' + amount + ' for controller number "SOLcontrol ' + sol.serial_number + '"',
                type: 'success',
                showCancelButton: true,
                confirmButtonColor: '#35B376',
                confirmButtonText: 'Confirm',
                closeOnConfirm: true,
                animation: true
            },
                function (isConfirm) {
                    if (isConfirm) {
                        Restangular.one('solcontroller', sol.id)
                            .all('transaction_downpayment')
                            .post(params)
                            .then(function (response) {
                                SweetAlert.swal('Added!', 'The Downpayment has been added.', 'success');
                                $state.go('app.customer.viewcustomer', { customer_id: $stateParams.customer_id }, { reload: true });
                            }, function errorCallback() {
                                SweetAlert.swal('Error', 'The Downpayment couldn\'t be added. Please try again later.', 'error');
                            });
                    }
                }
            );
        };

    };



}); /*view customer*/
