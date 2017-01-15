(function () {

    'use strict';

    // var API_URL = 'http://staging.rebeam.de/api';
    //var API_URL = 'http://localhost:8000/rebeam/web/app_dev.php/api';
     var API_URL = 'https://www.xeedaltgegenneu.de/api';
    var PLATFORM_ID = 14;

    var files;
    var newby;

    var transform = function (data) {
        return $.param(data);

    };

    var app = angular.module('SeeBierApp', ['ui.bootstrap', 'ui.select', 'ngRoute', 'ngCookies', 'angularLocalStorage']);


    app.config(

        ['$routeProvider',
            function ($routeProvider) {
                $routeProvider.
                    when('/contact', {
                        templateUrl: 'partials/contact.html',
                        controller: 'contactController'
                    }).
                    when('/terms_en', {
                        templateUrl: 'partials/terms_en.html'
                    }).
                    when('/terms_de', {
                        templateUrl: 'partials/terms_de.html'
                    }).
                    when('/checkout', {
                        templateUrl: 'partials/checkout.html',
                        controller: 'checkoutController'
                    }).
                    when('/index', {
                        templateUrl: 'partials/index.html'
                    }).
                    otherwise({
                        templateUrl: 'partials/index.html'
                    });
            }]);





    app.filter('propsFilter', function () {
        return function (items, props) {
            var out = [];

            if (angular.isArray(items)) {
                items.forEach(function (item) {
                    var itemMatches = false;

                    var keys = Object.keys(props);
                    for (var i = 0; i < keys.length; i++) {
                        var prop = keys[i];
                        var text = props[prop].toLowerCase();
                        if (item[prop].toString().toLowerCase().indexOf(text) !== -1) {
                            itemMatches = true;
                            break;
                        }
                    }

                    if (itemMatches) {
                        out.push(item);
                    }
                });
            } else {
                // Let the output be the input untouched
                out = items;
            }

            return out;
        }
    });

    var order = [];
    var survey = [];
    var file;
    var tanks = [];
    var detail;
    var lock;




    app.controller('orderController', ['$scope', '$http', 'storage', '$location', '$translate', function ($scope, $http, storage, $location, $translate) {


        $scope.getNumberofrepeats = function(){

            var repeats = 0;
            for (var i = 0; i < $scope.order.length; i++) {
                var item = $scope.order[i];
                repeats = parseInt(item.quantity) + repeats;
            }
            return new Array (repeats);
        };


        storage.bind($scope, 'order', []);

        if ($scope.order.length > 0) {
            order = $scope.order;
        }

        angular.element("#checkoutbutton").click(function(event) {

                if (survey.length < order.length) {

                    if ($translate.use() == 'de_DE') {
                        alert('Sie können nur ein Altgerät per Neugerät eintauschen, bitte fügen sie zuerst einen weiteren Projektor hinzu.');
                        event.preventDefault();
                        event.stopPropagation();
                    } else {
                        alert('You can only trade in one old projector per new projector, please add an old projector first.');
                        event.preventDefault();
                        event.stopPropagation();
                    }
                }
            }
        );

        angular.element("#indexbutton").click(function(event) {
            $location.path('#/index');
            window.scrollTo(0, 0);
        });


        $scope.$watch(function () {
            return order
        }, function (value) {
            $scope.order = value;
        });


        $scope.removeOrder = function (index) {
            if (index !== -1) {
                if (order.length === 1) {
                    order = [];
                } else {
                    order.splice(index, 1);
                }
            }
        };

        $scope.conditiontgetter = function(index) {
            if ($translate.use() == 'en_US') {
                switch (order[index].condition.Id) {
                    case 1:
                        return "As new";
                        break;
                    case 2:
                        return "Used";
                        break;
                    case 3:
                        return "Partly defective";
                        break;
                    case 4:
                        return "Defective";
                        break;
                }
            } else {
                switch (order[index].condition.Id) {
                    case 1:
                        return "Wie neu";
                        break;
                    case 2:
                        return "Gebraucht";
                        break;
                    case 3:
                        return "Mit Mängeln";
                        break;
                    case 4:
                        return "Defekt";
                        break;
                }
            }
        }

        $scope.getTotal = function () {
            $scope.showTable = $scope.order.length > 0;

            var total = 0;
            for (var i = 0; i < $scope.order.length; i++) {
                var product = $scope.order[i];
                total += (product.price * product.quantity);
            }
            return total.toFixed(2);
        };

    }]);

    app.controller('selectFormController', ['$scope', '$http', 'storage', '$rootScope', '$translate', function ($scope, $http, storage, $rootScope, $translate) {

        $scope.surveylength = function () {

            if (survey.length > 0) {
                return true;
            }
            return false;
        }

        $scope.test = function() {
            if (survey.length < order.length) {
                return true;
            }
            return false;
        }

        $rootScope.$on('$translateChangeSuccess', function () {
            $scope.pageTitle = $translate.instant('ADDRESS');
        });

        $scope.isenglish = function () {
            if ($translate.use() == 'en_US') {
                return true;
            }
            return false;
        }

        $scope.brands = [];
        $scope.models = [];

        $scope.conditions = [
            {Id: 1, Name_de: 'Wie neu', Name_en: 'As new'},
            {Id: 2, Name_de: 'Gebraucht', Name_en: 'Used'},
            {Id: 3, Name_de: 'Mit Mängeln', Name_en: 'Partly defective'},
            {Id: 4, Name_de: 'Defekt', Name_en: 'Defective'}
        ];

        $scope.incomplete = true;

        var selectedModel = [];
        var selectedCondition = [];


        $http.get(API_URL + "/brands?platform=" + PLATFORM_ID)
            .success(function (response) {
                $scope.brands = response.brands;
            });

        $scope.updateBrand = function ($item, $model) {
            $scope.$select_brand = this.$select;
            $scope.incomplete = true;
            $http.get(API_URL + "/brands/" + $model.Id + "?platform=" + PLATFORM_ID)
                .success(function (response) {
                    $scope.models = response.models;
                });
        };

        $scope.updateModel = function ($item, $model) {
            $scope.$select_model = this.$select;
            $http.get(API_URL + "/models/" + $model.Id + "?platform=" + PLATFORM_ID + "&newby=" + storage.get('newby') )
                .success(function (response) {
                    selectedModel = response.model;
                    $scope.selectPrice();
                });
        };

        $scope.updateCondition = function ($item, $model) {
            $scope.$select_condition = this.$select;
            selectedCondition = $model;
            $scope.selectPrice();
        };


        $scope.selectPrice = function () {
            if (typeof selectedCondition.Id !== "undefined" && typeof selectedModel.prices !== "undefined") {
                $scope.buyingPrice = (selectedModel.prices[selectedCondition.Id]);
                $scope.incomplete = false;
            } else {
                $scope.incomplete = true;
            }

        };

        function getBrandById(id) {
            var i = 0, len = $scope.brands.length;
            for (; i < len; i++) {
                if (+$scope.brands[i].Id == +id) {
                    return $scope.brands[i];
                }
            }
            return null;
        }

        $scope.addToOrder = function ($select) {

            if (survey.length <= order.length) {
                if ($translate.use() == 'de_DE') {
                    alert('Sie können nur ein Altgerät per Neugerät eintauschen, bitte fügen sie zuerst einen weiteren Projektor hinzu.');
                } else {
                    alert('You can only trade in one old projector per new projector, please add an old projector first.');
                }

            } else {


                order.push({
                    brand: getBrandById(selectedModel.BrandId),
                    model: selectedModel,
                    condition: selectedCondition,
                    quantity: 1,
                    price: $scope.buyingPrice,
                    newby: storage.get('newby')
                });


                //reset search
                $scope.$select_condition.selected = undefined;
                $scope.$select_model.selected = undefined;
                $scope.$select_brand.selected = undefined;
                $scope.incomplete = true;


            }}

    }]);

    app.controller('checkoutController', ['$scope', '$http', '$location', '$translate', function ($scope, $http, $location, $translate) {


        if (order.length == 0) {
            $location.path('/');
        } else {
            window.scrollTo(0, 0);
        }

        $http.get(API_URL + "/pickup-dates")
            .success(function (response) {
                $scope.pickupDates = response.dates;
                $scope.pickupTimes = response.times;
            });

        $scope.formLocked = false;



        $scope.getTotalWeight = function () {
            var weight = 0;
            for (var i = 0; i < order.length; i++) {
                var product = order[i];
                weight = weight + (product.model.Weight * product.quantity);
            }
            return weight;
        };

        /*  $scope.data = {customer: [{country: 'DE'},
         {country: 'FR'},
         {country:'UK'}
         ]};*/

        $scope.isenglish = function () {
            if ($translate.use() == 'en_US') {
                return true;
            }
            return false;
        }

        $scope.checkout = function (data) {

            $scope.formLocked = true;

            if ($scope.checkoutForm.$valid) {

                var i = 0, len = order.length, items = [];
                for (; i < len; i++) {
                    items.push({
                        model_id: order[i].model.Id,
                        quantity: order[i].quantity,
                        condition: order[i].condition.Id,
                        newby: order[i].newby
                    });
                }

                for (i = 0; i < survey.length; i++) {
                    delete survey[i].$$hashKey;
                }

                data.survey = survey;
                data.items = items;


                var locale;
                if ($translate.use() == 'de_DE') {
                    locale = 'de';
                } else {
                    locale = 'en';
                }

                data.locale = locale;


                $http.post(API_URL + "/order?platform=" + PLATFORM_ID, data, {
                    headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
                    transformRequest: transform
                })
                    .success(function () {
                        if ($translate.use() == 'de_DE') {
                            $scope.successMessage = "Vielen Dank für Ihren Auftrag!";
                        } else {
                            $scope.successMessage = "Thanks for your order!";
                        }
                        $scope.errorMessage = null;
                        $scope.formLocked = false;
                        order = [];
                        survey = [];
                    })
                    .error(function () {
                        if ($translate.use() == 'de_DE') {
                            $scope.errorMessage = "Fehler beim Abschicken des Auftrags...";
                        } else {
                            $scope.errorMessage = "There was an error transmitting your Trade-In";
                        }
                        $scope.successMessage = null;
                        $scope.successMessage = null;
                        $scope.formLocked = false;
                    });
            } else {
                if ($translate.use() == 'de_DE') {
                    $scope.errorMessage = "Bitte füllen Sie alle Pflichtfelder aus (die mit '*' markierten Felder sind Pflichtfelder)";
                } else {
                    $scope.errorMessage = "Please fill out all required fields. (The fields marked with '*' are mandatory fields)";
                }

                $scope.successMessage = null;
                $scope.formLocked = false;
            }
        };

    }]);

    app.directive('formElements', function () {
        return {
            templateUrl: 'app/directives/form-elements.html'
        }
    });

    app.directive('surveyElements', function () {
        return {
            templateUrl: 'app/directives/survey-elements.html'
        }
    });

    app.directive('orderElements', function () {
        return {
            templateUrl: 'app/directives/order-elements.html'
        }
    });

    app.directive('overviewElements', function () {
        return {
            templateUrl: 'app/directives/overview-elements.html'
        }
    });

    app.directive('detailElements', function () {
        return {
            templateUrl: 'app/directives/detail-elements.html'
        }
    });

    app.controller  ('surveyController', ['$scope', '$http', 'storage', '$rootScope', function ($scope, $http, storage, $rootScope) {


        storage.bind($scope, 'survey', []);
        if ($scope.survey.length > 0) {
            survey = $scope.survey;
        }

        $scope.$watch(function () {
            return survey
        }, function (value) {
            $scope.survey = value;
        });


        $scope.disable = function (){

            if(survey.length > 0) {
                return true;
            } else {
                return false;
            }
        };


        $scope.removeSurvey = function (index) {
            if (index !== -1) {
                if (survey.length === 1) {
                    survey = [];
                    order = [];
                } else {
                    survey.splice(index, 1);
                    order.splice(index, 1);
                }
            }
        };

    }]);



    app.controller('startController', ['$scope', '$timeout', '$http', '$location', '$rootScope', 'storage', function ($scope, $timeout, $http, $location, $rootScope, storage) {

            $scope.counter = 0;
            var updateCounter = function() {
                $scope.counter++;
                $timeout(updateCounter, 1000);
                $scope.remaining = 300 - $scope.counter;
                if ($scope.counter == 300) {
                    return $scope.getdetail(false);
                }
            };
            if ($scope.lock === true) {
                    updateCounter();
            }

        tanks = [];



        $http.get("post_read.php")
            .then(function(response) {
                $scope.tanks = response.data;
            });


  /*      tanks.push({
                starttime: 1377420390,
                beer: "21°C",
                air: "20°C",
                target: "15°C",
                targets: [
                    { ts: 80061, temp: 22 },
                    { ts: 60162, temp: 21 },
                    { ts: 90263, temp: 20 }]
            }
        );


        tanks.push({
                starttime: null,
                beer: "32°C",
                air: "31°C",
                target: "25°C",
                targets: [
                    { ts: 50, temp: 15 },
                    { ts: 30, temp: 14 },
                    { ts: 20, temp: 13 }]
            }
        );*/

        $scope.detail = false;
        $scope.edit = false;

     //   $scope.tanks = tanks;


        $scope.getdetail = function ($index) {
            if ($index === false) {
                $scope.lock = false;
                $scope.counter = 0;

                $http.post("post_save.php", $scope.tanks);

                return $scope.detail = false;
            }
            $scope.currenttank = $index;
            $scope.lock = true;

            updateCounter();
            return $scope.detail = true


        };

        $scope.getedit = function ($row) {
            if ($row === false) {
                $http.post("post_save.php", $scope.tanks);
                $scope.edit = false;
                return $scope.detail = true;
            }
                $scope.target = $scope.tanks[$scope.currenttank].steps[$row];
                $scope.detail = null;
                return $scope.edit = true;
        };

        $scope.getadd = function () {
            $scope.tanks[$scope.currenttank].steps.push({ step_duration: 0, step_temperature: 0 });
            var targetid = $scope.tanks[$scope.currenttank].steps.length - 1;
            $scope.target = $scope.tanks[$scope.currenttank].steps[targetid];
            $scope.detail = null;
            return $scope.add = true;
        };

        $scope.runningsince = function ($index) {
                if ($scope.tanks[$scope.currenttank].starttime !== null) {
                    return $scope.runningseconds = Math.floor(Date.now() / 1000) - $scope.tanks[$scope.currenttank].starttime;
            }
        };

        $scope.play = function ($bool) {
                if ($bool === false) {
                    var r = confirm("Gärtank zurücksetzen? Bitte bestätigen!");
                    if (r == true) {
                        $scope.tanks[$scope.currenttank].starttime = null;
                        $http.post("http://localhost/post_stop.php", $scope.tanks);
                        return $scope.detail = false;
                    }
                } else {
                    $scope.tanks[$scope.currenttank].starttime = Math.round(+new Date()/1000);
                    $http.post("post_start.php", $scope.tanks);
                    return $scope.detail = false;

                }
        };

        $scope.getstatus = function ($index) {
            if ($scope.tanks[$index].starttime === null) {
                return 'stopped';
            } else {
                return 'running';
            }
        };

        $scope.addtotarget = function () {

            $http.post("post_save.php", $scope.tanks);

            $scope.add = false;

            return $scope.detail = true;

        };

        $scope.remove = function ($index) {
           $scope.tanks[$scope.currenttank].steps.splice($index, 1);
        };

        $scope.tempup = function () {
            return  $scope.target.step_temperature = Number($scope.target.step_temperature) + 1/2;
        };

        $scope.tempdown = function () {
            return  $scope.target.step_temperature = Number($scope.target.step_temperature) - 1/2;
        };

        $scope.daysup = function () {
            return $scope.target.step_duration += 86400;
        };

        $scope.daysdown = function () {
            return $scope.target.step_duration -= 86400;
        };

        $scope.hrsup = function () {
            return $scope.target.step_duration += 3600;
        };

        $scope.hrsdown = function () {
            return $scope.target.step_duration -= 3600;
        };

        $scope.convertdays = function ($ts) {
               return $scope.days = Math.floor($ts / 86400);
        };

        $scope.converthrs = function ($ts) {
            return $scope.hours = Math.floor(($ts - ($scope.days * 86400)) / 3600);
        };

        $scope.convertmin = function ($ts) {
            return $scope.minutes = Math.floor(($ts - ($scope.days * 86400) - ($scope.hours * 3600)) / 60);
        }

    }]);

    app.controller('detailController', ['$scope', function($scope) {


        $scope.detail = function ($index) {

        };

    }]);


    app.controller('contactController', ['$scope', '$http', '$translate', function ($scope, $http, $translate) {


        $scope.isenglish = function () {
            if ($translate.use() == 'en_US') {
                return true;
            }
            return false;
        };


        $scope.formLocked = false;

        $scope.send = function (message) {

            $scope.formLocked = true;

            if ($scope.contactForm.$valid) {
                $http.post(API_URL + "/contact?platform=" + PLATFORM_ID, message, {
                    headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
                    transformRequest: transform
                })
                    .success(function () {
                        if ($translate.use() == 'de_DE') {
                            $scope.successMessage = "Vielen Dank für Ihre Nachricht!";}
                        else {
                            $scope.successMessage = "Thanks for your message!";
                        }
                        $scope.errorMessage = null;
                        $scope.formLocked = false;
                    })
                    .error(function () {
                        if ($translate.use() == 'de_DE') {
                            $scope.errorMessage = "Versand der Nachricht fehlgeschlagen...";}
                        else {
                            $scope.successMessage = "Sending of message failed...";

                        }
                        $scope.successMessage = null;
                        $scope.formLocked = false;
                    });
            } else {
                if ($translate.use() == 'de_DE') {
                    $scope.errorMessage = "Bitte füllen Sie alle Pflichtfelder aus (die mit '*' markierten Felder sind Pflichtfelder)";}
                else {
                    $scope.errorMessage = "Please fill out all required fields. (The fields marked with '*' are mandatory fields)";

                }
                $scope.successMessage = null;
                $scope.formLocked = false;
            }
        };
    }]);

})();
