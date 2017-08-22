(function() {
  "use strict";

  angular
    .module("spa-demo.subjects")
    .factory("spa-demo.subjects.MuseumsAuthz", MuseumsAuthzFactory);

  MuseumsAuthzFactory.$inject = ["spa-demo.authz.Authz",
                                "spa-demo.authz.BasePolicy"];
  function MuseumsAuthzFactory(Authz, BasePolicy) {
    function MuseumsAuthz() {
      BasePolicy.call(this, "Museum");
    }
      //start with base class prototype definitions
    MuseumsAuthz.prototype = Object.create(BasePolicy.prototype);
    MuseumsAuthz.constructor = MuseumsAuthz;


      //override and add additional methods
    MuseumsAuthz.prototype.canQuery=function() {
      //console.log("MuseumsAuthz.canQuery");
      return Authz.isAuthenticated();
    };

      //add custom definitions
    MuseumsAuthz.prototype.canAddThing=function(thing) {
        return Authz.isMember(thing);
    };
    MuseumsAuthz.prototype.canUpdateThing=function(thing) {
      console.log(thing);
        return Authz.isOrganizer(thing)
    };
    MuseumsAuthz.prototype.canRemoveThing=function(thing) {
        return Authz.isOrganizer(thing) || Authz.isAdmin();
    };
    
    return new MuseumsAuthz();
  }
})();