(function() {
  "use strict";

  angular
    .module("spa-demo.subjects")
    .factory("spa-demo.subjects.MuseumThing", MuseumThing);

  MuseumThing.$inject = ["$resource", "spa-demo.config.APP_CONFIG"];
  function MuseumThing($resource, APP_CONFIG) {
    return $resource(APP_CONFIG.server_url + "/api/museums/:museum_id/artifacts/:id",
      { museum_id: '@museum_id', 
        artifact_id: '@id'},
      { update: {method:"PUT"} 
      });
  }

})();