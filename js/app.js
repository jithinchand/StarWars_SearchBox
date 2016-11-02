'use strict';
var searchApp = angular.module('StarWarsSearchApp', ['ngRoute', 'ngMaterial', 'LocalStorageModule'])
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
    .controller('AutoComplete', function ($scope, $timeout, $q, $log, $rootScope, localStorageService) {
        var self = this;
        var personsList = $rootScope.pdata;
        // list of `state` value/display objects
        self.states        = loadAll();
        self.querySearch   = querySearch;
        if (localStorageService.get('divLoaded') == true)
            self.loaded = true;
        else
            self.loaded = false;
        if (localStorageService.get('divResultsToDisplay') != null)
            self.resultsToDisplay = localStorageService.get('divResultsToDisplay');
        else
            self.resultsToDisplay = null;

        /**
         * Search for states... use $timeout to simulate
         * remote dataservice call.
         */
        function querySearch (query) {
            var results = query ? self.states.filter( createFilterFor(query) ) : self.states,
                deferred;
            if (self.simulateQuery) {
                deferred = $q.defer();
                $timeout(function () { deferred.resolve( results ); }, Math.random() * 1000, false);
                return deferred.promise;
            } else {
                return results;
            }
        }

        /**
         * Build `states` list of key/value pairs
         */
        function loadAll() {
            var allPersonsNames = '';
            for (var per in personsList) {
                allPersonsNames += personsList[parseInt(per)].name + ', ';
            }

            return allPersonsNames.split(/, +/g).map( function (state) {
                return {
                    value: state.toLowerCase(),
                    display: state
                };
            });
        }

        /**
         * Create filter function for a query string
         */
        function createFilterFor(query) {
            var lowercaseQuery = angular.lowercase(query);

            return function filterFn(state) {
                return (state.value.indexOf(lowercaseQuery) === 0);
            };
        }
        
        self.displayResults = function () {
            console.log(self.selectedItem);
            for (var per in personsList) {
                if (self.selectedItem.display == personsList[parseInt(per)].name) {
                    self.resultsToDisplay = personsList[parseInt(per)];
                }
            }
            self.loaded = true;
            localStorageService.set('divResultsToDisplay', self.resultsToDisplay);
            localStorageService.set('divLoaded', self.loaded);
            console.log(self.resultsToDisplay);
        }
    })
    .controller('SearchCtrl', function ($rootScope, $scope, personsList) {
        $rootScope.pdata = personsList;
        $scope.personsData = personsList;
    });
