'use strict';

/*all transactions*/
angular.module('solcontrolApp').controller('alltransactions', function($stateParams, $q, $timeout, $rootScope, SweetAlert, base64, $state, $window,  DTOptionsBuilder, DTColumnBuilder, $uibModal, $scope, offices, all_transactions, Restangular) {
    var vm = this;

    var date = new Date();
    var month = date.getMonth() + 1; // because january is 0
    var now = date.getDate() + '-' + month + '-' + date.getFullYear();

    $scope.paymentType = '';

    // get branch and regional offices
    $scope.selectedRegionalOffice = '';
    $scope.selectedBranchOffice = '';
    $scope.regionalOffices = offices.regional_offices; // Used for dropdown filter
    $scope.branchOffices = {};

    var regionalOfficeByBranchOfficeId = {}; // Hash to find office name from ID easily
    var branchOfficeById = {};
    var regionalOfficeById = {};

    // Check GET /regional_office response value to understand the following
    for (var i = offices.regional_offices.length - 1; i >= 0; i--) { // for each regional office
        regionalOfficeById[offices.regional_offices[i].id] = offices.regional_offices[i].name;
    }
    for (i = offices.branch_offices.length - 1; i >= 0; i--) { // go all over the branch offices
        // Used for dropdown filter
        $scope.branchOffices[offices.branch_offices[i][0].regional_office_id] = offices.branch_offices[i];

        for (var j = offices.branch_offices[i].length - 1; j >= 0; j--) { // for each branch office
            regionalOfficeByBranchOfficeId[offices.branch_offices[i][j].id] = regionalOfficeById[offices.branch_offices[i][j].regional_office_id];
            branchOfficeById[offices.branch_offices[i][j].id] = offices.branch_offices[i][j].name;
        }
    }

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
                    return $state.go('app.transaction.alltransactions', { start_date: startDate, end_date: endDate });
                } else {
                    alert('Your date range should be less than 31 days');
                }
            }
        }
    };


    $scope.sum = 0;
    $scope.pageSum = 0;
    $scope.loading = true;
    $scope.loading2 = true;

    vm.dtOptions = DTOptionsBuilder.fromFnPromise(function() {
            var defer = $q.defer();
            defer.resolve(all_transactions);
            return defer.promise;
        })
        .withDOM('<"mb15"B>lfrtip')
        .withPaginationType('full_numbers').withBootstrap().withLanguage({
            'sSearch': '<b>Filter: </b>',
            'sSearchPlaceholder': 'Search...'
        })
        .withButtons([{
                extend: 'excel',
                text: 'Excel',
                exportOptions: {
                    columns: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] //we don't want the first 'control' column
                },
                className: 'btn btn-info mr5',
                filename: 'transactions_' + now
            },
            {
                extend: 'pdf',
                text: 'PDF',
                exportOptions: {
                    columns: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] //we don't want the first 'control' column
                },
                className: 'btn btn-info buttons-csv buttons-html5',
                filename: 'transactions_' + now,
                orientation: 'landscape',
                // download: 'open',
                title: 'Transactions ' + now
            }
        ])
        .withOption('order', [1, 'desc'])
        .withOption('footerCallback', function(tfoot, data) {
            if (data.length > 0) {
                var _this = this;

                // https://docs.angularjs.org/error/$rootScope/inprog?p0=$apply
                $timeout(function() {
                    $scope.pageSum = 0;
                    var sumsVisibleObject = _this._('tr', { 'page': 'current' });
                    for (i = sumsVisibleObject.length - 1; i >= 0; i--) {
                        $scope.pageSum += sumsVisibleObject[i].solcontroller_transaction.ta_amount;
                    }
                    $scope.loading = false;
                }, 0);
            }
        })
        .withOption('fnInitComplete', function() {
            // Without this the horizontal scrollbar will be at the bottom of tbody and on top of tfoot

            // Disable TBODY scoll bars
            $('.dataTables_scrollBody').css({
                'overflow': 'hidden',
                'border': '0'
            });

            // Enable TFOOT scoll bars
            $('.dataTables_scrollFoot').css('overflow', 'auto');

            // Sync TFOOT scrolling with TBODY
            $('.dataTables_scrollFoot').on('scroll', function() {
                $('.dataTables_scrollBody').scrollLeft($(this).scrollLeft());
            });
        })
        .withOption('scrollX', true);

    vm.dtColumns = [
        DTColumnBuilder.newColumn('solcontroller_transaction.id').withTitle('ID').withClass('odd-col'),
        DTColumnBuilder.newColumn('solcontroller_transaction.ta_date').withTitle('Date Time').withClass('even-col')
        .renderWith(function(data) {
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
        DTColumnBuilder.newColumn('solcontroller.serial_number').withTitle('SOLcontrol ID').withClass('odd-col'),
        DTColumnBuilder.newColumn('customer').withTitle('Customer').withClass('even-col')
        .renderWith(function(data) {
            if (data !== null) {
                var phone = data.phone;
                var phoneSplited = phone.split(/^0088/);
                if (phoneSplited.length === 2) { // Bangladeshi phone, remove the prefix 0088
                    phone = phoneSplited[1];
                }
                return '<a href style="text-transform: capitalize;" onclick="angular.element(this).scope().goViewCustomer(' + data.id + ')">' + data.name + ' ' + phone + '</a>';
            } else {
                return '<i>No Customer</i>';
            }
        }),
        DTColumnBuilder.newColumn('solcontroller_transaction').withTitle('Payment mode').withClass('odd-col').renderWith(function(data) {
            return data.ta_type_type === 'CashPayment' ? 'Cash' : 'Mobile Money';
        }),
        DTColumnBuilder.newColumn('mm_transaction').withTitle('Payment type').withClass('even-col').renderWith(function(data) {
            if (data != null) {
                if (data.payment_type_type) {
                    return data.payment_type_type == 'Installment' ? 'Installment' : 'Down Payment';
                } else {
                    return 'Not Available';
                }
            } else {
                return 'Not Available';
            }
        }),
        DTColumnBuilder.newColumn('solcontroller_transaction.ta_type_type').withTitle('MM provider').withClass('odd-col').renderWith(function(data) {
            var regex = new RegExp('.+Transaction');
            if (regex.test(data)) { return data.split('Transaction')[0]; } else { return ''; }
        }),
        DTColumnBuilder.newColumn(null).withTitle('Receiving no').withClass('even-col').renderWith(function(full) {
            if (full.mm_transaction === 'nil') { return ''; } else {
                if (full.mm_transaction.receiver !== undefined) {
                    return full.mm_transaction.receiver;
                } else {
                    return '';
                }
            }
        }),
        DTColumnBuilder.newColumn('mm_transaction').withTitle('Sending no').withClass('odd-col').renderWith(function(data) {
            if (data === 'nil') { return ''; } else {
                if (data.sender !== undefined) {
                    return data.sender;
                } else {
                    return '';
                }
            }
        }),
        DTColumnBuilder.newColumn('mm_transaction').withTitle('MM ID').withClass('even-col').renderWith(function(data) {
            if (data === 'nil') { return ''; } else { return data.id; }
        }),
        DTColumnBuilder.newColumn('sam').withTitle('App-agent').withClass('odd-col').renderWith(function(data) {
            if (data !== null) {
                var phone = data.phone;
                var phoneSplited = phone.split(/^0088/);
                if (phoneSplited.length === 2) { // Bangladeshi phone, remove the prefix 0088
                    phone = phoneSplited[1];
                }
                return '<a onclick="angular.element(this).scope().goViewAgent(' + data.id + ')" style="text-transform: capitalize;">' +
                    data.name + ' ' + phone + ' ' + regionalOfficeByBranchOfficeId[data.branch_office_id] + ' ' + branchOfficeById[data.branch_office_id] + '</a>';
            } else {
                return '<i>No Sam</i>';
            }
        }),
        DTColumnBuilder.newColumn('solcontroller_transaction.ta_amount').withTitle('Amount').withClass('even-col').renderWith(function(data) {
            return data + ' Tk';
        }),
        DTColumnBuilder.newColumn('sam.branch_office_id').withTitle('Branch Office').notVisible().renderWith(function(data) {
            if (data !== undefined) {
                return data;
            } else {
                return '';
            }
        }),

    ];

    if ($rootScope.globals.currentUser.user.organisation === 'SOLshare') {
      vm.dtColumns.push(
        DTColumnBuilder.newColumn(null).withTitle('Action').withClass('odd-col action').notSortable()
        .renderWith(function(data) {
            var ret =
                '<div class="buttons"><button type="button" class="btn btn-edit btn-xs" onclick="angular.element(this).scope().deleteBranch(' + data.solcontroller_transaction.id + ')">Delete</button></div>';

            return ret;
        })
      )
    }



    vm.dtInstance = {};

    vm.dtInstanceCallback = function(dtInstance) {
        vm.dtInstance = dtInstance; // Keep the dtInstance variable

        // Calculate total sum of all data the first time
        // Total
        var total = dtInstance.DataTable
            .column(11)
            .data()
            .reduce(function(a, b) {
                return a + b;
            }, 0);

        $scope.sum = total;
        $scope.loading2 = false;

        // On search, reculculate total sum
        dtInstance.DataTable.on('search.dt', function() {
            var total = dtInstance.DataTable
                .column(10, { search: 'applied' })
                .data()
                .reduce(function(a, b) {
                    return a + b;
                }, 0);

            $scope.sum = total;
        });
    };

    // Method to filter by payment type
    $scope.filterPaymentType = function() {
        // No payment types selected
        if ($scope.paymentType === '') {
            // reset the search
            vm.dtInstance.DataTable.column(4).search('').draw();
        } else {
            // One payment type is selected
            if ($scope.paymentType === 'MobileMoney') {
                vm.dtInstance.DataTable.column(4).search('Mobile Money').draw();

            } else {
                vm.dtInstance.DataTable.column(4).search('Cash').draw();
            }
        }

        // Calculate total sum
        var total = vm.dtInstance.DataTable
            .column(10, { search: 'applied' })
            .data()
            .reduce(function(a, b) {
                return a + b;
            }, 0);

        $scope.sum = total;
    };

    // Method to filter by regional office
    $scope.filterRegionalOffice = function() {
        // All offices
        if (($scope.selectedRegionalOffice === undefined) || ($scope.selectedRegionalOffice === null)) {
            // reset the search
            vm.dtInstance.DataTable.column(11).search('').draw();
        } else {
            // One regional office is selected, show all branch offices of this regional office
            var regionalOffice = $scope.selectedRegionalOffice;

            var searchString = '('; // regex with all branch offices IDs e.g. (1|2|3)

            for (var i = $scope.branchOffices[regionalOffice.id].length - 1; i >= 0; i--) {
                searchString += $scope.branchOffices[regionalOffice.id][i].id;

                if (i !== 0) {
                    searchString += '|';
                }
            }

            searchString += ')';

            vm.dtInstance.DataTable.column(11).search(searchString, true, false).draw();
        }

        // Calculate total sum
        var total = vm.dtInstance.DataTable
            .column(10, { search: 'applied' })
            .data()
            .reduce(function(a, b) {
                return a + b;
            }, 0);

        $scope.sum = total;
    };


    $scope.deleteBranch = function (id) {
      SweetAlert.swal({
        title: "Delete a Transaction!",
        text: "Please enter your password to proceed:",
        type: "input",
        inputType: 'password',
        showCancelButton: true,
        closeOnConfirm: false,
        animation: "slide-from-top",
        inputPlaceholder: "Write something"
      },
      function(inputValue){
        var authdata = base64.encode($rootScope.globals.currentUser.user.phone + ':' + inputValue);

        if (inputValue === false) return false;

        if (inputValue === "") {
          swal.showInputError("You need to provide your password!");
          return false
        }
        if (authdata === $rootScope.globals.currentUser.authdata) {
          var sc = Restangular.one('solcontroller_transaction', id);
          sc.remove().then(function() {
          swal("Nice!", "You have deleted a transaction", "success");
          $state.go($state.current, {}, {reload: true})
        }, function(){
           swal("Oops!", "Something went wrong", "error");

        });

        } else {
          swal.showInputError("Your password odes not match!!");
          return false
        }



      });
    }

    // Method to filter by branch office
    $scope.filterBranchOffice = function() {
        // All offices
        if (($scope.selectedBranchOffice === undefined) || ($scope.selectedBranchOffice === null)) {
            // show all branch offices of the selected regional office
            var regionalOffice = $scope.selectedRegionalOffice;

            var searchString = '('; // regex with all branch offices IDs e.g. (1|2|3)

            if (regionalOffice) { // If regional office is set
                for (var i = $scope.branchOffices[regionalOffice.id].length - 1; i >= 0; i--) {
                    searchString += $scope.branchOffices[regionalOffice.id][i].id;

                    if (i !== 0) {
                        searchString += '|';
                    }
                }
            }

            searchString += ')';
            vm.dtInstance.DataTable.column(11).search(searchString, true, false).draw();
        } else {
            // One branch office is selected
            vm.dtInstance.DataTable.column(11).search($scope.selectedBranchOffice.id).draw();
        }

        // Calculate total sum
        var total = vm.dtInstance.DataTable
            .column(10, { search: 'applied' })
            .data()
            .reduce(function(a, b) {
                return a + b;
            }, 0);

        $scope.sum = total;
    };

    $scope.goViewCustomer = function(id) {
        $state.go('app.customer.viewcustomer', { 'customer_id': id });
    };
    $scope.goViewAgent = function(id) {
        $uibModal.open({
            templateUrl: 'views/agent/viewagent.html',
            controller: viewAgentCtrl,
            resolve: {
                agent_id: function() { return id; }
            }
        });
    };


}); /*all transactions*/
