(function() {
  "use strict";

  angular
    .module("spa-demo.subjects")
    .component("sdMuseumEditor", {
      templateUrl: museumEditorTemplateUrl,
      controller: MuseumEditorController,
      bindings: {
        authz: "<"
      },
      require: {
        museumsAuthz: "^sdMuseumsAuthz"
      }      
    })
    .component("sdMuseumSelector", {
      templateUrl: museumSelectorTemplateUrl,
      controller: MuseumSelectorController,
      bindings: {
        authz: "<"
      }
    })
    ;


  museumEditorTemplateUrl.$inject = ["spa-demo.config.APP_CONFIG"];
  function museumEditorTemplateUrl(APP_CONFIG) {
    return APP_CONFIG.museum_editor_html;
  }    
  museumSelectorTemplateUrl.$inject = ["spa-demo.config.APP_CONFIG"];
  function museumSelectorTemplateUrl(APP_CONFIG) {
    return APP_CONFIG.museum_selector_html;
  }    

  MuseumEditorController.$inject = ["$scope","$q",
                                   "$state","$stateParams",
                                   "spa-demo.authz.Authz",
                                   "spa-demo.subjects.Museum",
                                   "spa-demo.subjects.MuseumThing"];
  function MuseumEditorController($scope, $q, $state, $stateParams, 
                                 Authz, Museum, MuseumThing) {
    var vm=this;
    vm.create = create;
    vm.clear  = clear;
    vm.update  = update;
    vm.remove  = remove;
    vm.haveDirtyLinks = haveDirtyLinks;
    vm.updateThingLinks = updateThingLinks;

    vm.$onInit = function() {
      console.log("MuseumEditorController",$scope);
      $scope.$watch(function(){ return Authz.getAuthorizedUserId(); }, 
                    function(){ 
                      if ($stateParams.id) {
                        reload($stateParams.id); 
                      } else {
                        newResource();
                      }
                    });
    }

    return;
    //////////////
    function newResource() {
      vm.item = new Museum();
      vm.museumsAuthz.newItem(vm.item);
      return vm.item;
    }

    function reload(museumId) {
      var itemId = museumId ? museumId : vm.item.id;      
      console.log("re/loading museum", itemId);
      vm.things = MuseumThing.query({museum_id:itemId});
      vm.item = Museum.get({id:itemId});
      vm.museumsAuthz.newItem(vm.item);
      vm.things.$promise.then(
        function(){
          angular.forEach(vm.things, function(ti){
            ti.originalPriority = ti.priority;            
          });                     
        });
      $q.all([vm.item.$promise,vm.things.$promise]).catch(handleError);
    }
    function haveDirtyLinks() {
      for (var i=0; vm.things && i<vm.things.length; i++) {
        var ti=vm.things[i];
        if (ti.toRemove || ti.originalPriority != ti.priority) {
          return true;
        }        
      }
      return false;
    }    

    function create() {      
      vm.item.errors = null;
      vm.item.$save().then(
        function(){
          console.log("museum created", vm.item);
          $state.go(".",{id:vm.item.id});
        },
        handleError);
    }

    function clear() {
      newResource();
      $state.go(".",{id: null});    
    }

    function update() {      
      vm.item.errors = null;
      var update=vm.item.$update();
      updateThingLinks(update);
    }
    function updateThingLinks(promise) {
      console.log("updating links to things");
      var promises = [];
      if (promise) { promises.push(promise); }
      angular.forEach(vm.things, function(ti){
        if (ti.toRemove) {
          promises.push(ti.$remove());
        } else if (ti.originalPriority != ti.priority) {          
          promises.push(ti.$update());
        }
      });

      console.log("waiting for promises", promises);
      $q.all(promises).then(
        function(response){
          console.log("promise.all response", response); 
          //update button will be disabled when not $dirty
          $scope.museumform.$setPristine();
          reload(); 
        }, 
        handleError);    
    }

    function remove() {      
      vm.item.$remove().then(
        function(){
          console.log("museum.removed", vm.item);
          clear();
        },
        handleError);
    }

    function handleError(response) {
      console.log("error", response);
      if (response.data) {
        vm.item["errors"]=response.data.errors;          
      } 
      if (!vm.item.errors) {
        vm.item["errors"]={}
        vm.item["errors"]["full_messages"]=[response]; 
      }      
      $scope.museumform.$setPristine();
    }    
  }

  MuseumSelectorController.$inject = ["$scope",
                                     "$stateParams",
                                     "spa-demo.authz.Authz",
                                     "spa-demo.subjects.Museum"];
  function MuseumSelectorController($scope, $stateParams, Authz, Museum) {
    var vm=this;

    vm.$onInit = function() {
      console.log("MuseumSelectorController",$scope);
      $scope.$watch(function(){ return Authz.getAuthorizedUserId(); }, 
                    function(){ 
                      if (!$stateParams.id) {
                        vm.items = Museum.query();
                        console.log("Museums below: ");
                        console.log(vm.items);        
                      }
                    });
    }
    return;
    //////////////
  }

})();
