'use strict';

angular.module('solcontrolApp').controller('alldevices', function (DTOptionsBuilder, DTColumnBuilder, Restangular, $scope) {
    var vm = this;

    var json = {};

    vm.dtOptions = DTOptionsBuilder.fromFnPromise(function () {
        return Restangular.all('solcontroller').all('sensitive').getList().then(function (response) {
            json = response.plain(); // Keep plain data for JSON exporter
            return response;
        });
    })
        .withPaginationType('full_numbers').withBootstrap().withLanguage({
            'sSearch': '<b>Filter: </b>',
            'sSearchPlaceholder': 'Search...'
        }).withOption('responsive', {
            'details': {
                'type': 'column',
                'target': 'tr'
            }
        })
        .withOption('order', [1, 'desc'])
        .withOption('processing', true);

    vm.dtColumns = [
        DTColumnBuilder.newColumn(null).withClass('control').notSortable().renderWith(function () { return null; }),
        DTColumnBuilder.newColumn('id').withTitle('ID').withClass('odd-col'),
        DTColumnBuilder.newColumn('serial_number').withTitle('Serial No.').withClass('even-col'),
        DTColumnBuilder.newColumn('customer_id').withTitle('Customer ID').withClass('odd-col')
            .renderWith(function (data) {
                return '<a onclick="angular.element(this).scope().goViewCustomer(' + data + ')">' + data + '</a>';
            }),
        DTColumnBuilder.newColumn('batt_size').withTitle('Battery Size').withClass('even-col'),
        DTColumnBuilder.newColumn('panel_size').withTitle('Panel Size').withClass('odd-col'),
        DTColumnBuilder.newColumn('is_active').withTitle('Active').withClass('even-col').renderWith(function (data) {
            if (data === true) { return '<span class="label label-success">Yes</span>'; }
            else { return '<span class="label label-danger">No</span>'; }
        }),
        DTColumnBuilder.newColumn('is_running').withTitle('Running').withClass('odd-col').renderWith(function (data) {
            if (data === true) { return '<span class="label label-success">Yes</span>'; }
            else { return '<span class="label label-danger">No</span>'; }
        }),
        DTColumnBuilder.newColumn('secret_number').withTitle('Secret No.').withClass('even-col'),
        DTColumnBuilder.newColumn('recharge_token').withTitle('Recharge Token').withClass('odd-col'),
        DTColumnBuilder.newColumn(null).withTitle('Location').withClass('even-col').renderWith(function (data) {
            return data.lat + ', ' + data.long;
        }),
        DTColumnBuilder.newColumn('initial_amount').withTitle('Initial Amount').withClass('odd-col'),
        DTColumnBuilder.newColumn('start_date').withTitle('Start Date').withClass('even-col'),
        DTColumnBuilder.newColumn('stop_date').withTitle('Stop Date').withClass('odd-col'),
        DTColumnBuilder.newColumn('installation_date').withTitle('Installation Date').withClass('even-col'),
        DTColumnBuilder.newColumn('agreement_date').withTitle('Agreement Date').withClass('odd-col'),
        DTColumnBuilder.newColumn('is_sales_type_cash').withTitle('Sales Type').withClass('even-col')
            .renderWith(function (data) {
                if (data === true) {
                    return 'Cash';
                } else {
                    return 'Credit';
                }
            }),
        DTColumnBuilder.newColumn('no_of_installments').withTitle('No. of Installments').withClass('odd-col'),
        DTColumnBuilder.newColumn('installment_amount').withTitle('Installation Amount').withClass('even-col'),
        DTColumnBuilder.newColumn('downpayment').withTitle('Down Payment').withClass('odd-col'),
    ];


    // Method to save JSON file to computer
    $scope.saveJSON = function () {
        if (!json) {
            console.error('No data');
            return;
        }

        var date = new Date();
        var filename = 'SOLshare - All SOLcontrols - ' + date + '.json';

        if (typeof json === 'object') {
            json = JSON.stringify(json, undefined, 2);
        }

        var blob = new Blob([json], { type: 'text/json' });

        if (window.navigator && window.navigator.msSaveOrOpenBlob) {
            window.navigator.msSaveOrOpenBlob(blob, filename);
        }
        else {
            var e = document.createEvent('MouseEvents'),
                a = document.createElement('a');

            a.download = filename;
            a.href = window.URL.createObjectURL(blob);
            a.dataset.downloadurl = ['text/json', a.download, a.href].join(':');
            e.initEvent('click', true, false, window,
                0, 0, 0, 0, 0, false, false, false, false, 0, null);
            a.dispatchEvent(e);
        }
    };

});/*all devices*/
