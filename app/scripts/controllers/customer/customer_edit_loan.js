'use strict';

angular.module('solcontrolApp').controller('customerEditLoan', function($scope, $state, $stateParams, $location, $anchorScroll, $q, solcontroller_loan, SweetAlert, Restangular) {

    var dateFormater = function(solcontroller_loan) {
        solcontroller_loan.start_date = solcontroller_loan.start_date != null ? new Date(solcontroller_loan.start_date) : null;
        solcontroller_loan.stop_date = solcontroller_loan.stop_date != null ? new Date(solcontroller_loan.stop_date) : null;
        solcontroller_loan.agreement_date = solcontroller_loan.agreement_date != null ? new Date(solcontroller_loan.agreement_date) : null;
        solcontroller_loan.next_installation_date = solcontroller_loan.next_installation_date != null ? new Date(solcontroller_loan.next_installation_date) : null;
        solcontroller_loan.installation_date = solcontroller_loan.installation_date != null ? new Date(solcontroller_loan.installation_date) : null;
        return solcontroller_loan;
    }

    $location.hash('loanEditPanel');
    $anchorScroll();

    $scope.solcontroller_loan = dateFormater(solcontroller_loan);

    $scope.calenderOpen = function(field) {
        $scope.calenderPopup[field] = true;
    };
    $scope.calenderPopup = {
        startDate: false,
        stopDate: false,
        agreementDate: false,
        nextInstallationDate: false,
        installationDate: false
    };


    $scope.goLoanEditCancel = function() {
        $state.go('^', { relaod: true });
    }

    $scope.editLoan = function() {

        // console.log($scope.solcontroller_loan);

        SweetAlert.swal({
                title: 'Please confirm you want to update solcontroller loan for the customer ' + $stateParams.customer_id + ' for controller ' + $stateParams.sol_id,
                type: 'success',
                showCancelButton: true,
                confirmButtonColor: '#35B376',
                confirmButtonText: 'Confirm',
                closeOnConfirm: true,
                animation: true
            },
            function(isConfirm) {
                if (isConfirm) {
                    Restangular.one('solcontroller_loan', $stateParams.sol_loan_id)
                        .patch($scope.solcontroller_loan)
                        .then(function(response) {
                            $state.transitionTo('app.customer.viewcustomer', { customer_id: $stateParams.customer_id }, { reload: true });
                            SweetAlert.swal('Updated!', 'The SOLcontroller loan has been updated.', 'success');
                        }, function errorCallback() {
                            SweetAlert.swal('Error', 'The SOLocntroller loan couldn\'t be updated. Please try again later.', 'error');
                        });
                }
            }
        );

    }
});
