'use strict';

/*all solcontrols = Portfolio*/
angular.module('solcontrolApp').controller('allsolcontrols', function($scope, $state, offices, $uibModal, Restangular, DTColumnDefBuilder, DTOptionsBuilder, DTColumnBuilder, SweetAlert) {
    var vm = this;

    // Get date for PDF and Excel exporter
    var date = new Date();
    var month = date.getMonth() + 1; // because january is 0
    var now = date.getDate() + '-' + month + '-' + date.getFullYear();

    // Sales type
    $scope.salesType = '';

    // Set branch and regional offices for dropdown filter and for office column
    $scope.selectedRegionalOffice = '';
    $scope.selectedBranchOffice = '';
    $scope.regionalOffices = offices.regional_offices; // Used for dropdown filter
    $scope.branchOffices = {}; // Used for dropdown filter

    var regionalOfficeByBranchOfficeId = {}; // Hash to find office name from ID easily in the table
    var branchOfficeById = {}; // Hash to find office name from ID easily in the table
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

    // Create the dataTable
    vm.dtOptions = DTOptionsBuilder.fromFnPromise(function() {
            return Restangular.all('solcontroller').all('portfolio').getList();
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
                    columns: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
                },
                className: 'btn btn-info mr5',
                filename: 'portfolio_' + now
            },
            {
                extend: 'pdf',
                text: 'PDF',
                exportOptions: {
                    columns: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
                },
                className: 'btn btn-info buttons-csv buttons-html5',
                filename: 'portfolio_' + now,
                orientation: 'landscape',
                title: 'Portfolio ' + now,
                download: 'open'
            }
        ])
        .withOption('scrollX', true);
    vm.dtColumns = [
        DTColumnBuilder.newColumn('solcontroller.serial_number').withTitle(' ID ').withClass('odd-col'),
        DTColumnBuilder.newColumn('solcontroller_loan.start_date').withTitle('Loan Start Date').withClass('even-col')
        .renderWith(function(data) {
            if (data != null) {
                // var split = data.split('T');
                // if (split[1] !== undefined) { // if there is a time
                //     var time = split[1].split(':');
                //     return split[0] + ' at ' + time[0] + ':' + time[1];
                // } else { // if there is only a date without a time
                //     return split[0];
                // }
                return data;
            }
            return '-';
        }),

        DTColumnBuilder.newColumn('solcontroller_loan.installation_date').withTitle('SOLcontrol Installation Date').withClass('odd-col')
        .renderWith(function(data) {
            if (data != null) {
            //     console.log(data);
            //     var split = data.split('T');
            //     if (split[1] !== undefined) { // if there is a time
            //         var time = split[1].split(':');
            //         return split[0] + ' at ' + time[0] + ':' + time[1];
            //     } else { // if there is only a date without a time
            //         return split[0];
            //     }
            return data;
            }
            return '-';
        }),
        DTColumnBuilder.newColumn('solcontroller.panel_size').withTitle('Panel Size').withClass('even-col')
        .renderWith(function(data) {
            return data + ' Wp';
        }),
        DTColumnBuilder.newColumn('solcontroller_loan.total_amount').withTitle('Total Amount').withClass('odd-col')
        .renderWith(function(data) {
            return data + ' Tk';
        }),
        DTColumnBuilder.newColumn('solcontroller_loan.outstanding_balance').withTitle('Outstanding Amount').withClass('even-col')
        .renderWith(function(data) {
            return data + ' Tk';
        }),
        DTColumnBuilder.newColumn('solcontroller').withTitle('Last Transaction').withClass('odd-col')
        .renderWith(function(data) {
            if (data.latest_transaction.ta_date != null) {
                var d = new Date(data.latest_transaction.ta_date);
                var rechargeDay = data.next_installation_date != null ? new Date(data.next_installation_date) : null;
                var current_date = new Date();
                // we want to show BD time UTC0600 so -360
                var offset = d.getTimezoneOffset() + 360;
                d.setMinutes(d.getMinutes() + offset);
                var split = d.toString().split(' ');
                var dataDate = d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2) + ' ' + split[4];
                return rechargeDay != null && current_date >= rechargeDay ? '<span style="color: red !important;">' + dataDate + '</span>' : dataDate;
            } else {
                return '<i>No transaction</i>'; // Actually, here, there is a transaction but without a date. Why??
            }
        }),
        DTColumnBuilder.newColumn('customer').withTitle('Customer').withClass('even-col')
        .renderWith(function(data) {
            if (data === null) {
                return '<i>No Customer</i>';
            } else {
                var phone = data.phone;
                var phoneSplited = phone.split(/^0088/);
                if (phoneSplited.length === 2) { // Bangladeshi phone, remove the prefix 0088
                    phone = phoneSplited[1];
                }
                return '<a onclick="angular.element(this).scope().goViewCustomer(' + data.id + ')" style="text-transform: capitalize;">' + data.id + ' ' + data.name + ' ' + phone + '</a>';
            }
        }),
        DTColumnBuilder.newColumn('sam').withTitle('Agent').withClass('odd-col')
        .renderWith(function(data) {
            if (data === null) {
                return '<i>No Agent</i>';
            } else {
                var phone = data.phone;
                var phoneSplited = phone.split(/^0088/);
                if (phoneSplited.length === 2) { // Bangladeshi phone, remove the prefix 0088
                    phone = phoneSplited[1];
                }
                return '<a onclick="angular.element(this).scope().goViewAgent(' + data.id + ')" style="text-transform: capitalize;">' +
                    data.name + ' ' + phone + ' ' + regionalOfficeByBranchOfficeId[data.branch_office_id] + ' ' + branchOfficeById[data.branch_office_id] + '</a>';
            }
        }),
        DTColumnBuilder.newColumn('sam.branch_office_id').withClass('even-col').notVisible() // used to filter by branch ID
    ];

    vm.dtInstance = {};

    $scope.goEdit = function(id) {
        $state.go('app.solcontrol.editsolcontrol', { 'solcontrol_id': id });
    };
    $scope.goView = function(id) {
        $uibModal.open({
            templateUrl: 'views/solcontrol/viewsolcontrol.html',
            controller: viewSolcontrolCtrl,
            resolve: {
                solcontrol_id: function() { return id; }
            }
        });
    };

    $scope.delete = function(id) {
        SweetAlert.swal({
                title: 'Are you sure you want to delete SOLcontrol ' + id + '?',
                type: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#b02e3a',
                confirmButtonText: 'Yes',
                closeOnConfirm: false,
                animation: false
            },
            function(isConfirm) {
                if (isConfirm) {
                    Restangular.one('solcontrol', id).remove().then(function() {
                        SweetAlert.swal('Deleted!', 'The SOLcontrol ' + id + ' has been deleted.', 'success');
                        $state.reload();
                    }, function errorCallback() {
                        SweetAlert.swal('Error', 'The SOLcontrol couldn\'t be deleted. Please try again later.', 'error');
                    });
                }
            }
        );
    };

    $scope.goViewCustomer = function(customer_id) {
        $state.go('app.customer.viewcustomer', { 'customer_id': customer_id });
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

    // Method to filter by sales type
    $scope.filterSalesType = function() {
        // No sales types selected
        if ($scope.salesType === '') {
            // reset the search
            vm.dtInstance.DataTable.column(6).search('').draw();
        } else {
            // One sales type type is selected
            vm.dtInstance.DataTable.column(6).search($scope.salesType).draw();
        }
    };

    // Method to filter by regional office
    $scope.filterRegionalOffice = function() {
        // All offices
        if (($scope.selectedRegionalOffice === undefined) || ($scope.selectedRegionalOffice === null)) {
            // reset the search
            vm.dtInstance.DataTable.column(9).search('').draw();
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

            vm.dtInstance.DataTable.column(9).search(searchString, true, false).draw();
        }
    };

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
            vm.dtInstance.DataTable.column(9).search(searchString, true, false).draw();
        } else {
            // One branch office is selected
            vm.dtInstance.DataTable.column(9).search($scope.selectedBranchOffice.id).draw();
        }
    };
}); /*all solcontrols*/
