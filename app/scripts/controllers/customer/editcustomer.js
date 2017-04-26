'use strict';

angular.module('solcontrolApp').controller('editcustomer', function ($scope, $stateParams, Restangular, $state, SweetAlert) {
    $scope.loading = true;

    var divByName = {};
    var disByName = {};
    var upaByName = {};

    var energySourceByName = {};

    var originalCustomer = {};

    $scope.customer = {};
    $scope.address = {};
    $scope.customer_names = {};
    $scope.customer_location = {};
    $scope.customer_energy_source = {};

    $scope.customer_id = $stateParams.customer_id;

    // For the date picker
    $scope.openDOB = function () {
        $scope.popupDOB.opened = true;
    };
    $scope.popupDOB = {
        opened: false
    };

    Restangular.one('division').get()
        .then(function (response) {
            $scope.divisions = response.Divisions;
            $scope.districts = response.Districts;
            $scope.upazilas = response.Upazilas;

            angular.forEach(response.Divisions, function (value) {
                this[value.name] = value;
            }, divByName); // {division_name1: {name: division_name1, id: 123}, ...}

            angular.forEach(response.Districts, function (value) {
                this[value.name] = value;
            }, disByName);

            angular.forEach(response.Upazilas, function (value) {
                this[value.name] = value;
            }, upaByName);

            Restangular.one('customer', $scope.customer_id).get().then(function (response2) {
                // Handle get customer response
                $scope.customer = response2;
                originalCustomer = angular.copy(response2); // Keep a copy to check changes at the end

                // Split the full name into first and last name and set upper cases
                var names = response2.customer.name.split(' ');
                $scope.customer_names.last_name = names[1].charAt(0).toUpperCase() + names[1].slice(1);
                $scope.customer_names.first_name = names[0].charAt(0).toUpperCase() + names[0].slice(1);
                originalCustomer.last_name = names[1].charAt(0).toUpperCase() + names[1].slice(1);
                originalCustomer.first_name = names[0].charAt(0).toUpperCase() + names[0].slice(1);
                originalCustomer.customer.name = originalCustomer.first_name + ' ' + originalCustomer.last_name;

                // Set div, dist and upa ids from names
                if (response2.address) {
                    $scope.customer_location.selectedDiv = divByName[response2.address.division];
                    $scope.customer_location.selectedDis = disByName[response2.address.district];
                    $scope.customer_location.selectedUpa = upaByName[response2.address.upazila];

                    originalCustomer.address.division_id = divByName[response2.address.division].id.toString();
                    originalCustomer.address.district_id = disByName[response2.address.district].id.toString();
                    originalCustomer.address.upazila_id = upaByName[response2.address.upazila].id.toString();

                    // Set ward to int (for input type=number)
                    $scope.customer.address.ward = Number(response2.address.ward);
                    originalCustomer.address.ward = $scope.customer.address.ward;
                }

                // Set date of birth, if exists
                if (response2.customer.date_of_birth) {
                    $scope.customer.customer.date_of_birth = new Date(response2.customer.date_of_birth);
                    originalCustomer.customer.date_of_birth = $scope.customer.customer.date_of_birth;
                }

                // Set gender id from gender name
                $scope.customer.customer.gender_id = response2.customer.gender_id ? response2.customer.gender_id.toString() : '';
                originalCustomer.customer.gender_id = $scope.customer.customer.gender_id;

                // Remove phone number country code
                var phoneSplited = response2.customer.phone.split(/^0088/);
                if (phoneSplited.length === 2) { // Bangladeshi phone, remove the prefix 0088
                    $scope.customer.customer.phone = phoneSplited[1];
                }

                // Get all energy sources
                Restangular.all('energy_source').getList().then(function (response3) {
                    $scope.energy_sources = response3;
                    angular.forEach(response3, function (value) {
                        this[value.name] = value;
                    }, energySourceByName);

                    // Set energy source
                    if (response2.customer.energy_source) {
                        $scope.customer_energy_source.selectedEnergySource = energySourceByName[originalCustomer.customer.energy_source];
                        originalCustomer.customer.energy_source_id = energySourceByName[originalCustomer.customer.energy_source].id.toString();
                    }

                    $scope.loading = false;
                }, function (error) {
                    console.log('There was an error loading the energy sources');
                    console.log('Error with status', error.statusText, 'code', error.status);
                });

            }, function (error) {
                console.log('There was an error loading the customer');
                console.log('Error with status', error.statusText, 'code', error.status);
            });

        }, function (error) {
            console.log('There was an error loading the divisions');
            console.log('Error with status', error.statusText, 'code', error.status);
        });

    $scope.reset = function () {
        $scope.customer = angular.copy(originalCustomer);

        // reset original names
        $scope.customer_names.last_name = originalCustomer.last_name;
        $scope.customer_names.first_name = originalCustomer.first_name;

        // reset original divs, districts and upaz
        if (originalCustomer.address) {
            $scope.customer_location.selectedDiv = divByName[originalCustomer.address.division];
            $scope.customer_location.selectedDis = disByName[originalCustomer.address.district];
            $scope.customer_location.selectedUpa = upaByName[originalCustomer.address.upazila];
        }
        else {
            $scope.customer_location.selectedDiv = '';
            $scope.customer_location.selectedDis = '';
            $scope.customer_location.selectedUpa = '';
        }


        // reset original energy source
        if (originalCustomer.customer.energy_source) {
            $scope.customer_energy_source.selectedEnergySource = energySourceByName[originalCustomer.customer.energy_source];
        }
        else {
            $scope.customer_energy_source.selectedEnergySource = '';
        }


        // reset phone number without country code
        var phoneSplited = originalCustomer.customer.phone.split(/^0088/);
        if (phoneSplited.length === 2) { // Bangladeshi phone, remove the prefix 0088
            $scope.customer.customer.phone = phoneSplited[1];
        }
    };

    $scope.nextStep = function () {
        $scope.customer.customer.name = $scope.customer_names.first_name + ' ' + $scope.customer_names.last_name;
        $scope.customer.address.division_id = $('#divisionSelect').val();
        $scope.customer.address.district_id = $('#districtSelect').val();
        $scope.customer.address.upazila_id = $('#upazilaSelect').val();
        $scope.customer.customer.energy_source_id = $('#energySourceSelect').val();
        $scope.customer.customer.phone = '0088' + $scope.customer.customer.phone;

        var params = [];
        for (var prop in $scope.customer.customer) {
            if ($scope.customer.customer[prop] !== originalCustomer.customer[prop]) {
                params.push({
                    op: 'replace',
                    path: '/' + prop,
                    value: $scope.customer.customer[prop]
                });
            }
        }
        for (prop in $scope.customer.address) {
            if ($scope.customer.address[prop] !== originalCustomer.address[prop]) {
                params.push({
                    op: 'replace',
                    path: '/' + prop,
                    value: $scope.customer.address[prop]
                });
            }
        }

        if (params.length === 0) {
            SweetAlert.swal({
                title: '',
                text: 'No change needs to be done',
                confirmButtonColor: '#41a3b5'
            }, function () {
                $state.go('app.customer.viewcustomer', { 'customer_id': $scope.customer_id });
            });
        } else {
            var patch_params = {};
            patch_params.patch = params;
            Restangular.one('customer', $scope.customer_id).patch(patch_params).then(function () {
                SweetAlert.swal({
                    title: '',
                    type: 'success',
                    text: 'The customer has been updated',
                    confirmButtonColor: '#35B376'
                }, function () {
                    $state.go('app.customer.viewcustomer', { 'customer_id': $scope.customer_id });
                });
            }, function (error) {
                console.log('Error with status', error.statusText, '. Code', error.status);
                SweetAlert.swal({
                    title: 'An error occured while updating the customer',
                    type: 'error',
                    text: 'Error with status ' + error.statusText + 'code ' + error.status,
                    confirmButtonColor: '#B02E3A'
                });
            });
        }
    };

});/*edit customer*/
