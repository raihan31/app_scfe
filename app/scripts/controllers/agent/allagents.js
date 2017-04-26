'use strict';
/*agent's transactions*/
var agentTransactionsModalCtrl = function($stateParams, $q, $scope, $state, Restangular, $uibModal, $uibModalInstance, DTColumnDefBuilder, DTOptionsBuilder, DTColumnBuilder) {
    $scope.ok = function() {
        $uibModalInstance.close();
    };
}; /*agent's transactions*/

/*agent's visits*/
var agentVisitsModalCtrl = function($stateParams, $scope, agent_id, $state, Restangular, $uibModal, $uibModalInstance, DTColumnDefBuilder, DTOptionsBuilder, DTColumnBuilder, reasonsList) {
    var vm = this;

    $scope.agent_id = agent_id;

    $scope.ok = function() {
        $uibModalInstance.close();
    };

    vm.dtOptions = DTOptionsBuilder.fromFnPromise(function() {
            return Restangular.one('sam', agent_id).all('visit').getList();
        }).withPaginationType('simple_numbers').withBootstrap().withLanguage({
            'sSearch': '<b>Filter: </b>',
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
        DTColumnBuilder.newColumn('visited_at').withTitle('Date Time').withClass('even-col')
        .renderWith(function(data) {
            var split = data.split('T');
            var time = split[1].split(':');
            return split[0] + ' ' + time[0] + ':' + time[1];
        }),
        DTColumnBuilder.newColumn('visited_hardware').withTitle('Device ID').withClass('odd-col'),
        DTColumnBuilder.newColumn('name').withTitle('Name').withClass('even-col').renderWith(function(data) {
            return '<span style="text-transform: capitalize;">' + data + '</span>';
        }),
        DTColumnBuilder.newColumn('phone').withTitle('Phone').withClass('odd-col'),
        DTColumnBuilder.newColumn('is_location_matching').withTitle('Location match?').withClass('even-col')
        .renderWith(function(data) {
            if (data === true) { return '<span class="label label-success">Yes</span>'; } else { return '<span class="label label-danger">No</span>'; }
        }),
        DTColumnBuilder.newColumn('visit_reason_id').withTitle('Purpose of visit').withClass('odd-col')
        .renderWith(function(data) {
            if (data !== null) {
                for (var i = reasonsList.length - 1; i >= 0; i--) {
                    if (reasonsList[i].id === data) {
                        return reasonsList[i].reason;
                    }
                }
            } else {
                return '';
            }
        })
    ];

    $scope.goViewCustomer = function(id) {
        $uibModal.open({
            templateUrl: 'views/customer/viewcustomer.html',
            controller: viewCustomerCtrl,
            resolve: {
                customer_id: function() { return id; }
            }
        });
    };
}; /*agent's visits*/

/*view agents*/
var viewAgentCtrl = function($stateParams, agent_id, $scope, Restangular, $state, $uibModalInstance) {
    $scope.sam = {};

    $scope.first_name = '';
    $scope.last_name = '';

    $scope.address = '';

    $scope.agent_id = agent_id;

    Restangular.one('sam', agent_id).get({ solcontroller: '' }).then(function(response) {

        // Get regional and branch office name
        Restangular.one('regional_office').get().then(function(offices) {
            var regionalOfficeById = {};
            // Check GET /regional_office response value to understand the following
            for (var i = offices.regional_offices.length - 1; i >= 0; i--) { // for each regional office
                regionalOfficeById[offices.regional_offices[i].id] = offices.regional_offices[i].name;
            }
            for (i = offices.branch_offices.length - 1; i >= 0; i--) { // go all over the branch offices
                for (var j = offices.branch_offices[i].length - 1; j >= 0; j--) { // for each branch office
                    if (offices.branch_offices[i][j].id === response.branch_office_id) {
                        $scope.sam.branchOffice = offices.branch_offices[i][j].name;
                        $scope.sam.regionalOffice = regionalOfficeById[offices.branch_offices[i][j].regional_office_id];
                    }
                }
            }
        }, function(error) {
            console.log('Error loading offices with status', error.statusText, 'code', error.status);
        });

        $scope.sam = response;
        var names = response.sam_name.split(' ');
        if (names.length >= 2) {
            $scope.first_name = names[0];
            $scope.last_name = names[1];
        } else {
            $scope.first_name = response.sam_name;
        }

        // Set phone number
        var phoneSplited = response.sam_phone.split(/^0088/);
        if (phoneSplited.length === 2) { // If Bangladeshi phone, remove the prefix 0088
            $scope.sam.sam_phone = phoneSplited[1];
        }

        $scope.address = response.division !== null ? response.division : '';
        $scope.address = response.district !== null ? $scope.address + ' ' + response.district : $scope.address;
        $scope.address = response.upazila !== null ? $scope.address + ' ' + response.upazila : $scope.address;
        $scope.address = response.village !== null ? $scope.address + ' ' + response.village : $scope.address;
        $scope.address = response.ward !== null ? $scope.address + ' ' + response.ward : $scope.address;
        $scope.address = response.union_parishad !== null ? $scope.address + ' ' + response.union_parishad : $scope.address;

    }, function(error) {
        console.log('Error loading the sam with status', error.statusText, 'code', error.status);
    });

    $scope.ok = function() {
        $uibModalInstance.close();
    };

    $scope.goEdit = function() {
        $uibModalInstance.close();
        $state.go('app.agent.editagent', { 'agent_id': $scope.agent_id });
    };
}; /*view agent*/

/*all agents*/
angular.module('solcontrolApp').controller('allagents', function($scope, offices, $state, $uibModal, DTColumnDefBuilder, DTOptionsBuilder, DTColumnBuilder, Restangular, SweetAlert, reasons) {
    var vm = this;



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




    vm.dtOptions = DTOptionsBuilder.fromFnPromise(function() {
        return Restangular.all('solcontroller').all('sam').getList();
    }).withPaginationType('full_numbers').withBootstrap().withLanguage({
        'sSearch': '<b>Filter: </b>',
        'sSearchPlaceholder': 'Search...'
    }).withOption('responsive', {
        'details': {
            'type': 'column',
            'target': 'tr'
        }
    });
    vm.dtColumns = [
        DTColumnBuilder.newColumn(null).withClass('control').notSortable().renderWith(function() { return null; }),
        DTColumnBuilder.newColumn('id').withTitle('ID').withClass('odd-col').renderWith(function(data) {
            return '<a onclick="angular.element(this).scope().goView(' + data + ')">' + data + '</a>';
        }),
        DTColumnBuilder.newColumn('sam_name').withTitle('Name').withClass('even-col').renderWith(function(data) {
            return '<span style="text-transform: capitalize;">' + data + '</span>';
        }),
        DTColumnBuilder.newColumn('sam_phone').withTitle('Phone').withClass('odd-col').renderWith(function(data) {
            var phoneSplited = data.split(/^0088/);
            if (phoneSplited.length === 2) { // Bangladeshi phone, remove the prefix 0088
                return phoneSplited[1];
            } else { // Non-bangla phone, keep as it is
                return data;
            }
        }),
        DTColumnBuilder.newColumn('region_name').withTitle('Region').withClass('even-col').renderWith(function(data) {
            return '<span style="text-transform: capitalize;">' + data + '</span>';
        }),
        DTColumnBuilder.newColumn('branch_name').withTitle('Branch').withClass('odd-col').renderWith(function(data) {
            return '<span style="text-transform: capitalize;">' + data + '</span>';
        }),
        DTColumnBuilder.newColumn('sc_count').withTitle('SHS').withClass('even-col').renderWith(function(data) {
            return Math.floor(data);
        }),
        DTColumnBuilder.newColumn(null).withTitle('Action').withClass('odd-col action').notSortable()
        .renderWith(function(data) {
            var ret = '<div class="buttons"><button type="button" class="btn btn-log btn-xs" onclick="angular.element(this).scope().goTransactions(' + data.id + ',' + '\'' + data.sam_name.toString() + '\'' + ')">Log</button>' +
                '<button type="button" class="btn btn-view btn-xs" onclick="angular.element(this).scope().goView(' + data.id + ')">View</button>' +
                '<button type="button" class="btn btn-other btn-xs" onclick="angular.element(this).scope().goVisits(' + data.id + ')">Visits</button>' +
                '<button type="button" class="btn btn-edit btn-xs" onclick="angular.element(this).scope().goEdit(' + data.id + ')">Edit</button>';
            if (data.status === true) { // Show delete button only if the agent is activated
                 '<button type="button" class="btn btn-delete btn-xs" onclick="angular.element(this).scope().delete(' + data.id + ')">Delete</button>';
            }
            return ret;
        })
    ];
    vm.dtColumnDefs = [
        DTColumnDefBuilder.newColumnDef(-1).withOption('responsivePriority', '1')
    ];

    vm.dtInstance = {};

    $scope.goEdit = function(id) {
        $state.go('app.agent.editagent', { 'agent_id': id });
    };
    $scope.goView = function(id) {
        $uibModal.open({
            templateUrl: 'views/agent/viewagent.html',
            controller: viewAgentCtrl,
            resolve: {
                agent_id: function() { return id; }
            }
        });
    };
    $scope.delete = function(id) {
        SweetAlert.swal({
                title: 'Are you sure you want to delete agent ' + id + '?',
                type: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#b02e3a',
                confirmButtonText: 'Yes',
                closeOnConfirm: false,
                animation: false
            },
            function(isConfirm) {
                if (isConfirm) {
                    Restangular.one('sam', id).remove().then(function() {
                        SweetAlert.swal('Deleted!', 'The agent ' + id + ' has been deleted.', 'success');
                        $state.reload();
                    }, function errorCallback() {
                        SweetAlert.swal('Error', 'The agent couldn\'t be deleted. Please try again later.', 'error');
                    });
                }
            }
        );
    };
    $scope.goTransactions = function(id, name) {
        $state.go('app.agent.allagents.transactions.datefilter', { agent_id: id });
    };

    $scope.goVisits = function(id) {
        $uibModal.open({
            templateUrl: 'views/agent/agent_visits_modal.html',
            controller: agentVisitsModalCtrl,
            controllerAs: 'agentVisitsModalCtrl',
            size: 'lg',
            resolve: {
                agent_id: function() { return id; },
                reasonsList: function() { return reasons; }
            }
        });
    };



    $scope.filterRegionalOffice = function() {
        if (($scope.selectedRegionalOffice === undefined) || ($scope.selectedRegionalOffice === null)) {
            // reset the search
            vm.dtInstance.DataTable.column(5).search('').draw();
        } else {
            // One regional office is selected, show all branch offices of this regional office
            // One regional office is selected, show all branch offices of this regional office
            var regionalOffice = $scope.selectedRegionalOffice;

            var searchString = '('; // regex with all branch offices IDs e.g. (1|2|3)

            for (var i = $scope.branchOffices[regionalOffice.id].length - 1; i >= 0; i--) {
                searchString += $scope.branchOffices[regionalOffice.id][i].name;

                if (i !== 0) {
                    searchString += '|';
                }
            }

            searchString += ')';

            vm.dtInstance.DataTable.column(5).search(searchString, true, false).draw();
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
                    searchString += $scope.branchOffices[regionalOffice.id][i].name;

                    if (i !== 0) {
                        searchString += '|';
                    }
                }
            }

            searchString += ')';
            vm.dtInstance.DataTable.column(5).search(searchString, true, false).draw();
        } else {
            // One branch office is selected
            vm.dtInstance.DataTable.column(5).search($scope.selectedBranchOffice.name).draw();
        }
    };
}); /*all agents*/