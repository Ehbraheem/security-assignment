(function() {
  "use strict";

  angular
    .module("spa-demo.subjects")
    .factory("spa-demo.subjects.Museum", MuseumFactory);

  MuseumFactory.$inject = ["$resource","spa-demo.config.APP_CONFIG"];
  function MuseumFactory($resource, APP_CONFIG) {
    var service = $resource(APP_CONFIG.server_url + "/api/museums/:id",
        { id: '@id'},
        { update: {method:"PUT"} }
      );
    return service;
  }
})();