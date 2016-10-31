'use strict';
var searchApp = angular.module('StarWarsSearchApp', ['ngRoute'])
    .config(function ($routeProvider) {
        $routeProvider
            .when('/', {
                controller: 'SearchCtrl',
                templateUrl: 'html/search.html',
                resolve: {
                    personsList: function(personsListFactory) {
                        return personsListFactory.getPersonsList();
                    }
                }
            })
            .otherwise({
                redirectTo: '/'
            });
    })
    .factory('personsListFactory', function ($http) {
        return {
            getPersonsList: function() {
                return $http.get('http://swapi.co/api/people/').then(function(response) {
                    return response.data;
                });
            }
        };
    })
    .controller('SearchCtrl', function ($scope, personsList) {
        $scope.personsData = personsList;
    });
