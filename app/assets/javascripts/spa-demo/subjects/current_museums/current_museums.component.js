(function() {
  "use strict";

  angular
    .module("spa-demo.subjects")
    .component("sdCurrentMuseums", {
      templateUrl: museumsTemplateUrl,
      controller: CurrentMuseumsController,
    })
    .component("sdCurrentMuseumInfo", {
      templateUrl: museumInfoTemplateUrl,
      controller: CurrentMuseumInfoController,
    })
    ;

  museumsTemplateUrl.$inject = ["spa-demo.config.APP_CONFIG"];
  function museumsTemplateUrl(APP_CONFIG) {
    return APP_CONFIG.current_museums_html;
  }    
  museumInfoTemplateUrl.$inject = ["spa-demo.config.APP_CONFIG"];
  function museumInfoTemplateUrl(APP_CONFIG) {
    return APP_CONFIG.current_museum_info_html;
  }    

  CurrentMuseumsController.$inject = ["$scope",
                                     "spa-demo.subjects.currentSubjects"];
  function CurrentMuseumsController($scope,currentSubjects) {
    var vm=this;
    vm.museumClicked = museumClicked;
    vm.isCurrentMuseum = currentSubjects.isCurrentMuseumIndex;

    vm.$onInit = function() {
      console.log("CurrentMuseumsController",$scope);
    }
    vm.$postLink = function() {
      $scope.$watch(
        function() { return currentSubjects.getMuseums(); }, 
        function(museums) { console.clear; console.log(museums);vm.museums = museums; }
      );
    }    
    return;
    //////////////
    function museumClicked(index) {
      currentSubjects.setCurrentMuseum(index);
    }    
  }

  CurrentMuseumInfoController.$inject = ["$scope",
                                        "spa-demo.subjects.currentSubjects",
                                        "spa-demo.subjects.Museum",
                                        "spa-demo.authz.Authz"];
  function CurrentMuseumInfoController($scope,currentSubjects, Museum, Authz) {
    var vm=this;
    vm.nextMuseum = currentSubjects.nextMuseum;
    vm.previousMuseum = currentSubjects.previousMuseum;

    vm.$onInit = function() {
      console.log("CurrentMuseumInfoController",$scope);
    }
    vm.$postLink = function() {
      $scope.$watch(
        function() { return currentSubjects.getCurrentMuseum(); }, 
        newMuseum 
      );
      $scope.$watch(
        function() { return Authz.getAuthorizedUserId(); },
        function() { newMuseum(currentSubjects.getCurrentMuseum()); }
      );        
    }    
    return;
    //////////////
    function newMuseum(link) {
      console.log("link Museum", link);
      vm.link = link; 
      vm.museum = null;
      if (link && link.id) {
        vm.museum=Museum.get({id:link.id});
      }
    }







  }
})();
