'use strict';

angular.module('solcontrolApp').controller('allvisits',function(DTOptionsBuilder, DTColumnBuilder, Restangular) {
	var vm = this;

	vm.dtOptions = DTOptionsBuilder.fromFnPromise(function() {
        return Restangular.all('solbox').getList();
    }).withPaginationType('full_numbers').withBootstrap().withLanguage({
														    	'sSearch': '_INPUT_',
																'sSearchPlaceholder': 'Search...'
															}).withOption('responsive', {'details': {
                                                                                        'type': 'column',
                                                                                        'target': 'tr'}})
                                                            .withOption('order', [1, 'desc']);
    vm.dtColumns = [
        DTColumnBuilder.newColumn(null).withClass('control').notSortable().renderWith(function() {return null;}),
        DTColumnBuilder.newColumn('id').withTitle('ID').withClass('odd-col'),
        DTColumnBuilder.newColumn('date').withTitle('Date').withClass('even-col'),
        DTColumnBuilder.newColumn('').withTitle('Reason').withClass('odd-col'),
        DTColumnBuilder.newColumn('').withTitle('Location match?').withClass('even-col')
                                                                    .renderWith(function(data) {
                                                                        if(data === '1') {return 'Yes';}
                                                                        else {return 'No';}
                                                                    }),
        DTColumnBuilder.newColumn('').withTitle('Accessible?').withClass('odd-col')
                                                                    .renderWith(function(data) {
                                                                        if(data === '1') {return 'Yes';}
                                                                        else {return 'No';}
                                                                    }),
        DTColumnBuilder.newColumn(null).withTitle('Action').withClass('even-col').notSortable()
                                .renderWith(function() {
                                    return '<div class="buttons">'+
                                           '<button type="button" class="btn btn-view btn-xs" onclick="">View</button>'+
                                           '<button type="button" class="btn btn-edit btn-xs" onclick="">Edit</button>'+
                                           '<button type="button" class="btn btn-delete btn-xs">Delete</button></div>';
                                })
        ];

});/*all visits*/
