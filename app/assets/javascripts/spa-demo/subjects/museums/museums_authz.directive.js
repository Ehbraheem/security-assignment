(function() {
  "use strict";

  angular
    .module("spa-demo.subjects")
    .directive("sdMuseumsAuthz", MuseumsAuthzDirective);

  MuseumsAuthzDirective.$inject = [];

  function MuseumsAuthzDirective() {
    var directive = {
        bindToController: true,
        controller: MuseumAuthzController,
        controllerAs: "vm",
        restrict: "A",
        link: link
    };
    return directive;

    function link(scope, element, attrs) {
      console.log("MuseumsAuthzDirective", scope);
    }
  }

  MuseumAuthzController.$inject = ["$scope", 
                                  "spa-demo.subjects.MuseumsAuthz"];
  function MuseumAuthzController($scope, MuseumsAuthz) {
    var vm = this;
    vm.authz={};
    vm.authz.canUpdateItem = canUpdateItem;
    vm.newItem=newItem;

    activate();
    return;
    ////////////
    function activate() {
      vm.newItem(null);
    }

    function newItem(item) {
      MuseumsAuthz.getAuthorizedUser().then(
        function(user){ authzUserItem(item, user); },
        function(user){ authzUserItem(item, user); });
    }

    function authzUserItem(item, user) {
      console.log("new Item/Authz", item, user);

      vm.authz.authenticated = MuseumsAuthz.isAuthenticated();
      vm.authz.canQuery      = MuseumsAuthz.canQuery();
      vm.authz.canCreate     = MuseumsAuthz.canCreate();
      if (item && item.$promise) {
        vm.authz.canUpdate      = false;
        vm.authz.canDelete      = false;
        vm.authz.canGetDetails  = false;
        vm.authz.canUpdateImage = false;
        vm.authz.canRemoveImage = false;      
        item.$promise.then(function(){ checkAccess(item); });
      } else {
        checkAccess(item);
      }      
    }

    function checkAccess(item) {
      vm.authz.canUpdate     = MuseumsAuthz.canUpdate(item);
      vm.authz.canDelete     = MuseumsAuthz.canDelete(item);
      vm.authz.canGetDetails = MuseumsAuthz.canGetDetails(item);
      vm.authz.canUpdateImage = MuseumsAuthz.canUpdateThing(item);
      vm.authz.canRemoveImage = MuseumsAuthz.canRemoveThing(item);      
      console.log("checkAccess", item, vm.authz);
    }

    function canUpdateItem(item) {
      return MuseumsAuthz.canUpdate(item);
    }    
  }
})();
