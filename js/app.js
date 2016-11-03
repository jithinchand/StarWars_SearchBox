'use strict';
var searchApp = angular.module('StarWarsSearchApp', ['ngRoute', 'ngMaterial', 'ngProgress', 'LocalStorageModule'])
    .constant('NEWMODIFIERS', {
        'PEOPLE' : 'people',
        'FILMS'  : 'films',
        'PLANETS': 'planets',
        'SPECIES': 'species',
        'STARSHIPS': 'starships',
        'VEHICLES': 'vehicles'
    })
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
    .factory('personsListFactory', function ($http, $q, NEWMODIFIERS) {
        return {
            getPersonsList: function () {
                var completePromiseData = [];
                var completeData = [];
                for (var modifier in NEWMODIFIERS) {
                    completePromiseData.push(getModifierResources(NEWMODIFIERS[modifier]));
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
                    var objResutls = {};
                    switch (modifier) {
                        case NEWMODIFIERS.PEOPLE    : objResutls[NEWMODIFIERS.PEOPLE] = results;
                            break;
                        case NEWMODIFIERS.FILMS     : objResutls[NEWMODIFIERS.FILMS] = results;
                            break;
                        case NEWMODIFIERS.PLANETS   : objResutls[NEWMODIFIERS.PLANETS] = results;
                            break;
                        case NEWMODIFIERS.SPECIES   : objResutls[NEWMODIFIERS.SPECIES] = results;
                            break;
                        case NEWMODIFIERS.STARSHIPS : objResutls[NEWMODIFIERS.STARSHIPS] = results;
                            break;
                        case NEWMODIFIERS.VEHICLES  : objResutls[NEWMODIFIERS.VEHICLES] = results;
                            break;
                        default                     : objResutls;
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
    .controller('AutoComplete', function ($scope, $timeout, $q, $log, $rootScope, $filter, localStorageService, NEWMODIFIERS) {
        var self = this;
        var personsList = $rootScope.pdata;
        self.states        = loadAll();
        self.querySearch   = querySearch;
        var storedResultsToDisplay = localStorageService.get('divResultsToDisplay');
        var storedDate = localStorageService.get('divDate');

        self.loadPerson = localStorageService.get('divLoadPerson') == true;
        self.loadFilm   = localStorageService.get('divLoadFilm') == true;
        self.loadPlanet   = localStorageService.get('divLoadPlanet') == true;
        self.loadSpecies   = localStorageService.get('divLoadSpecies') == true;
        self.loadStarships   = localStorageService.get('divLoadStarships') == true;
        self.loadVehicles   = localStorageService.get('divLoadVehicles') == true;
        self.loadDate   = localStorageService.get('divLoadDate') == true;
        self.resultsToDisplay   = storedResultsToDisplay != null ? storedResultsToDisplay :null;
        self.present = storedDate != null ? storedDate : null;

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

        function loadAll() {
            var allPersonsNamesArr = [];
            for (var mod in personsList) {
                if (personsList[mod].hasOwnProperty(NEWMODIFIERS.PEOPLE)) {
                    var tempArr = personsList[mod][(NEWMODIFIERS.PEOPLE)];
                    for (var per in tempArr) {
                        allPersonsNamesArr.push({
                            value: tempArr[parseInt(per)].name.toLowerCase(),
                            modifier: NEWMODIFIERS.PEOPLE,
                            display: tempArr[parseInt(per)].name
                        });
                    }
                }
                else if(personsList[mod].hasOwnProperty(NEWMODIFIERS.FILMS)) {
                    var tempArr = personsList[mod][NEWMODIFIERS.FILMS];
                    for (var per in tempArr) {
                        allPersonsNamesArr.push({
                            value: tempArr[parseInt(per)].title.toLowerCase(),
                            modifier: NEWMODIFIERS.FILMS,
                            display: tempArr[parseInt(per)].title
                        });
                    }
                }
                else if(personsList[mod].hasOwnProperty(NEWMODIFIERS.PLANETS)) {
                    var tempArr = personsList[mod][NEWMODIFIERS.PLANETS];
                    for (var per in tempArr) {
                        allPersonsNamesArr.push({
                            value: tempArr[parseInt(per)].name.toLowerCase(),
                            modifier: NEWMODIFIERS.PLANETS,
                            display: tempArr[parseInt(per)].name
                        });
                    }
                }
                else if(personsList[mod].hasOwnProperty(NEWMODIFIERS.SPECIES)) {
                    var tempArr = personsList[mod][NEWMODIFIERS.SPECIES];
                    for (var per in tempArr) {
                        allPersonsNamesArr.push({
                            value: tempArr[parseInt(per)].name.toLowerCase(),
                            modifier: NEWMODIFIERS.SPECIES,
                            display: tempArr[parseInt(per)].name
                        });
                    }
                }
                else if(personsList[mod].hasOwnProperty(NEWMODIFIERS.STARSHIPS)) {
                    var tempArr = personsList[mod][NEWMODIFIERS.STARSHIPS];
                    for (var per in tempArr) {
                        allPersonsNamesArr.push({
                            value: tempArr[parseInt(per)].name.toLowerCase(),
                            modifier: NEWMODIFIERS.STARSHIPS,
                            display: tempArr[parseInt(per)].name
                        });
                        if (tempArr[parseInt(per)].name != tempArr[parseInt(per)].model) {
                            allPersonsNamesArr.push({
                                value: tempArr[parseInt(per)].model.toLowerCase(),
                                modifier: NEWMODIFIERS.STARSHIPS,
                                display: tempArr[parseInt(per)].model
                            });
                        }
                    }
                }
                else if(personsList[mod].hasOwnProperty(NEWMODIFIERS.VEHICLES)) {
                    var tempArr = personsList[mod][NEWMODIFIERS.VEHICLES];
                    for (var per in tempArr) {
                        allPersonsNamesArr.push({
                            value: tempArr[parseInt(per)].name.toLowerCase(),
                            modifier: NEWMODIFIERS.VEHICLES,
                            display: tempArr[parseInt(per)].name
                        });
                        if (tempArr[parseInt(per)].name != tempArr[parseInt(per)].model) {
                            allPersonsNamesArr.push({
                                value: tempArr[parseInt(per)].model.toLowerCase(),
                                modifier: NEWMODIFIERS.VEHICLES,
                                display: tempArr[parseInt(per)].model
                            });
                        }
                    }
                }
            }

            return allPersonsNamesArr;
        }

        function createFilterFor(query) {
            var lowercaseQuery = angular.lowercase(query);

            return function filterFn(state) {
                return (state.value.indexOf(lowercaseQuery) === 0);
            };
        }
        
        self.displayResults = function () {
            console.log(self.selectedItem);
            for (var mod in personsList) {
                if (self.selectedItem.modifier == NEWMODIFIERS.PEOPLE) {
                    if (personsList[mod].hasOwnProperty(NEWMODIFIERS.PEOPLE)) {
                        var tempArr = personsList[mod][NEWMODIFIERS.PEOPLE];
                        for (var per in tempArr) {
                            if (self.selectedItem.display == tempArr[parseInt(per)].name) {
                                self.resultsToDisplay = tempArr[parseInt(per)];
                                self.loadPerson    = true;
                                self.loadFilm      = false;
                                self.loadPlanet    = false;
                                self.loadSpecies   = false;
                                self.loadStarships = false;
                                self.loadVehicles  = false;
                            }
                        }
                    }
                }
                else if (self.selectedItem.modifier == NEWMODIFIERS.FILMS) {
                    if (personsList[mod].hasOwnProperty(NEWMODIFIERS.FILMS)) {
                        var tempArr = personsList[mod][NEWMODIFIERS.FILMS];
                        for (var per in tempArr) {
                            if (self.selectedItem.display == tempArr[parseInt(per)].title) {
                                self.resultsToDisplay = tempArr[parseInt(per)];
                                self.loadPerson    = false;
                                self.loadFilm      = true;
                                self.loadPlanet    = false;
                                self.loadSpecies   = false;
                                self.loadStarships = false;
                                self.loadVehicles  = false;
                            }
                        }
                    }
                }
                else if (self.selectedItem.modifier == NEWMODIFIERS.PLANETS) {
                    if (personsList[mod].hasOwnProperty(NEWMODIFIERS.PLANETS)) {
                        var tempArr = personsList[mod][NEWMODIFIERS.PLANETS];
                        for (var per in tempArr) {
                            if (self.selectedItem.display == tempArr[parseInt(per)].name) {
                                self.resultsToDisplay = tempArr[parseInt(per)];
                                self.loadPerson    = false;
                                self.loadFilm      = false;
                                self.loadPlanet    = true;
                                self.loadSpecies   = false;
                                self.loadStarships = false;
                                self.loadVehicles  = false;
                            }
                        }
                    }
                }
                else if (self.selectedItem.modifier == NEWMODIFIERS.SPECIES) {
                    if (personsList[mod].hasOwnProperty(NEWMODIFIERS.SPECIES)) {
                        var tempArr = personsList[mod][NEWMODIFIERS.SPECIES];
                        for (var per in tempArr) {
                            if (self.selectedItem.display == tempArr[parseInt(per)].name) {
                                self.resultsToDisplay = tempArr[parseInt(per)];
                                self.loadPerson    = false;
                                self.loadFilm      = false;
                                self.loadPlanet    = false;
                                self.loadSpecies   = true;
                                self.loadStarships = false;
                                self.loadVehicles  = false;
                            }
                        }
                    }
                }
                else if (self.selectedItem.modifier == NEWMODIFIERS.STARSHIPS) {
                    if (personsList[mod].hasOwnProperty(NEWMODIFIERS.STARSHIPS)) {
                        var tempArr = personsList[mod][NEWMODIFIERS.STARSHIPS];
                        for (var per in tempArr) {
                            if (self.selectedItem.display == tempArr[parseInt(per)].name || self.selectedItem.display == tempArr[parseInt(per)].model) {
                                self.resultsToDisplay = tempArr[parseInt(per)];
                                self.loadPerson    = false;
                                self.loadFilm      = false;
                                self.loadPlanet    = false;
                                self.loadSpecies   = false;
                                self.loadStarships = true;
                                self.loadVehicles  = false;
                            }
                        }
                    }
                }
                else if (self.selectedItem.modifier == NEWMODIFIERS.VEHICLES) {
                    if (personsList[mod].hasOwnProperty(NEWMODIFIERS.VEHICLES)) {
                        var tempArr = personsList[mod][NEWMODIFIERS.VEHICLES];
                        for (var per in tempArr) {
                            if (self.selectedItem.display == tempArr[parseInt(per)].name || self.selectedItem.display == tempArr[parseInt(per)].model) {
                                self.resultsToDisplay = tempArr[parseInt(per)];
                                self.loadPerson    = false;
                                self.loadFilm      = false;
                                self.loadPlanet    = false;
                                self.loadSpecies   = false;
                                self.loadStarships = false;
                                self.loadVehicles  = true;
                            }
                        }
                    }
                }
            }
            localStorageService.set('divResultsToDisplay', self.resultsToDisplay);
            localStorageService.set('divLoadPerson', self.loadPerson);
            localStorageService.set('divLoadFilm', self.loadFilm);
            localStorageService.set('divLoadPlanet', self.loadPlanet);
            localStorageService.set('divLoadSpecies', self.loadSpecies);
            localStorageService.set('divLoadStarships', self.loadStarships);
            localStorageService.set('divLoadVehicles', self.loadVehicles);
            console.log(self.resultsToDisplay);
            self.present = $filter('date')(Date.now(), "yyyy-MM-dd HH:mm");
            self.loadDate = true;
            localStorageService.set('divLoadDate', self.loadDate);
            localStorageService.set('divDate', self.present);
        }
    })
    .controller('SearchCtrl', function ($rootScope, $scope, personsList) {
        $rootScope.pdata = personsList;
        $scope.personsData = personsList;
        console.log(personsList);
    });
searchApp
    .run(function($rootScope, ngProgressFactory) {
        $rootScope.progressbar = ngProgressFactory.createInstance();
        $rootScope.$on('$routeChangeStart', function(ev,data) {
            $rootScope.progressbar.start();
        });
        $rootScope.$on('$routeChangeSuccess', function(ev,data) {
            $rootScope.progressbar.complete();
        });
    });
