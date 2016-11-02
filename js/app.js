'use strict';
var searchApp = angular.module('StarWarsSearchApp', ['ngRoute', 'ngMaterial', 'LocalStorageModule'])
    .constant('MODIFIERS', ['people', 'films'])
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
    .factory('personsListFactory', function ($http, $q, MODIFIERS) {
        return {
            getPersonsList: function () {
                var completePromiseData = [];
                var completeData = [];
                for (var i = 0; i < MODIFIERS.length; i++) {
                    completePromiseData.push(getModifierResources(MODIFIERS[i]));
                }
                return $q.all(completePromiseData).then(function (response) {
                    for (var res in response) {
                        console.log(response[parseInt(res)]);
                        completeData.push(response[parseInt(res)]);
                    }
                    return completeData;
                });
            }
        };

        function getModifierResources(modifier) {
            return $http.get('http://swapi.co/api/' + modifier).then(function(response) {
                var count = response.data.count;
                var lastPage = 1;
                if (count % 10 == 0)
                    lastPage = 0;
                var totPages = count/10 + lastPage;
                var promiseResults = [];
                var results = [];
                for (var i = 1; i <= totPages; i++) {
                    promiseResults.push(getResource('http://swapi.co/api/'+ modifier + '/?page=' + i));
                }

                return $q.all(promiseResults).then(function (response) {
                    for (var res in response) {
                        results = results.concat(response[parseInt(res)]);
                    }
                    var objResutls = {}
                    switch (modifier) {
                        case MODIFIERS[0] : objResutls[MODIFIERS[0]] = results;
                            break;
                        case MODIFIERS[1] : objResutls[MODIFIERS[1]] = results;
                            break;
                    }
                    return objResutls;
                });
            });
        }

        function getResource(url) {
            return $http.get(url).then(function(response) {
                return response.data.results;
            });
        }
    })
    .controller('AutoComplete', function ($scope, $timeout, $q, $log, $rootScope, localStorageService, MODIFIERS) {
        var self = this;
        var personsList = $rootScope.pdata;
        // list of `state` value/display objects
        self.states        = loadAll();
        self.querySearch   = querySearch;
        if (localStorageService.get('divLoadPerson') == true)
            self.loadPerson = true;
        else
            self.loadPerson = false;
        if (localStorageService.get('divLoadFilm') == true)
            self.loadFilm = true;
        else 
            self.loadFilm = false;
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
            var allPersonsNamesArr = [];
            for (var mod in personsList) {
                if (personsList[mod].people) {
                    var tempArr = personsList[mod].people;
                    for (var per in tempArr) {
                        allPersonsNamesArr.push({
                            value: tempArr[parseInt(per)].name.toLowerCase(),
                            modifier: MODIFIERS[0],
                            display: tempArr[parseInt(per)].name
                        });
                    }
                }
                else if(personsList[mod].films) {
                    var tempArr = personsList[mod].films;
                    for (var per in tempArr) {
                        allPersonsNamesArr.push({
                            value: tempArr[parseInt(per)].title.toLowerCase(),
                            modifier: MODIFIERS[1],
                            display: tempArr[parseInt(per)].title
                        });
                    }
                }
            }

            return allPersonsNamesArr;
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
            switch (self.selectedItem.modifier) {
                case MODIFIERS[0]:
            }
            for (var mod in personsList) {
                if (self.selectedItem.modifier == MODIFIERS[0]) {
                    if (personsList[mod].people) {
                        var tempArr = personsList[mod].people;
                        for (var per in tempArr) {
                            if (self.selectedItem.display == tempArr[parseInt(per)].name) {
                                self.resultsToDisplay = tempArr[parseInt(per)];
                                self.loadPerson = true;
                                self.loadFilm = false;
                            }
                        }
                    }
                }
                else if (self.selectedItem.modifier == MODIFIERS[1]) {
                    if (personsList[mod].films) {
                        var tempArr = personsList[mod].films;
                        for (var per in tempArr) {
                            if (self.selectedItem.display == tempArr[parseInt(per)].title) {
                                self.resultsToDisplay = tempArr[parseInt(per)];
                                self.loadFilm = true;
                                self.loadPerson = false;
                            }
                        }
                    }
                }
            }
            localStorageService.set('divResultsToDisplay', self.resultsToDisplay);
            localStorageService.set('divLoadPerson', self.loadPerson);
            localStorageService.set('divLoadFilm', self.loadFilm);
            console.log(self.resultsToDisplay);
        }
    })
    .controller('SearchCtrl', function ($rootScope, $scope, personsList) {
        $rootScope.pdata = personsList;
        $scope.personsData = personsList;
        console.log(personsList);
    });
