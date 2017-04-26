'use strict';
/*
*
* This service contains numerous common methods used in all new ressource controllers
* When a page needs tabs
*
*/
angular.module('solcontrolApp').factory('multiTabStepHandler', function(){
    var fact = {};

    // Get the index of the current step given selection
    fact.getCurrentStepIndex = function($scope){
        return _.indexOf($scope.steps, $scope.selection);
    };

    // Go to a defined step index
    fact.goToStep = function(index, $scope) {
        if ( !_.isUndefined($scope.steps[index]) ){
            $scope.selection = $scope.steps[index];
        }
    };

    // Go to next step
    fact.incrementStep = function($scope) {
        var stepIndex = fact.getCurrentStepIndex($scope);
        var nextStep = stepIndex + 1;
        $scope.selection = $scope.steps[nextStep];
    };

    // Go to previous step
    fact.decrementStep = function($scope) {
        var stepIndex = fact.getCurrentStepIndex($scope);
        var previousStep = stepIndex - 1;
        $scope.selection = $scope.steps[previousStep];
    };

    return fact;
});
