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
    .factory('personsListFactory', function ($http, $q) {
        return {
            getPersonsList: function() {
                return $http.get('http://swapi.co/api/people').then(function(response) {
                    var count = response.data.count;
                    var lastPage = 1;
                    if (count % 10 == 0)
                        lastPage = 0;
                    var totPages = count/10 + lastPage;
                    var promiseResults = [];
                    var results = [];
                    for (var i = 1; i <= totPages; i++) {
                        promiseResults.push(getResource('http://swapi.co/api/people/?page=' + i));
                    }

                    return $q.all(promiseResults).then(function (response) {
                        for (var res in response) {
                            results = results.concat(response[parseInt(res)]);
                        }
                        return results;
                    });
                });
            }
        };

        function getResource(url) {
            return $http.get(url).then(function(response) {
                return response.data.results;
            });
        }
    })
    .controller('SearchCtrl', function ($scope, personsList) {
        $scope.personsData = personsList;
    });
