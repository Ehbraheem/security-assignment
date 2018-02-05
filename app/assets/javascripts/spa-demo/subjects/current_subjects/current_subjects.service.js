(function() {
  "use strict";

  angular
    .module("spa-demo.subjects")
    .service("spa-demo.subjects.currentSubjects", CurrentSubjects);

  CurrentSubjects.$inject = ["$rootScope","$q",
                             "$resource",
                             "spa-demo.geoloc.currentOrigin",
                             "spa-demo.config.APP_CONFIG"];

  function CurrentSubjects($rootScope, $q, $resource, currentOrigin, APP_CONFIG) {
    var subjectsResource = $resource(APP_CONFIG.server_url + "/api/subjects",{},{
      query: { cache:false, isArray:true }
    });
    var museumsResource = $resource(APP_CONFIG.server_url + "/api/museums",{},{
      query: { cache:false, isArray:true }
    });
    var service = this;
    service.version = 0;
    service.images = [];
    service.imageIdx = null;
    service.things = [];
    service.thingIdx = null;
    service.museums = [];
    service.museumIdx = null;
    service.refresh = refresh;
    service.isCurrentImageIndex = isCurrentImageIndex;
    service.isCurrentThingIndex = isCurrentThingIndex;
    service.isCurrentMuseumIndex = isCurrentMuseumIndex;
    service.nextThing = nextThing;
    service.previousThing = previousThing;
    service.nextMuseum = nextMuseum;
    service.previousMuseum = previousMuseum;

    //refresh();
    $rootScope.$watch(function(){ return currentOrigin.getVersion(); }, refresh);
    $rootScope.$watch(() => service.getCurrentMuseumId(), refresh)
    return;
    ////////////////
    function refresh() {      
      var params=currentOrigin.getPosition();
      if (!params || !params.lng || !params.lat) {
        params=angular.copy(APP_CONFIG.default_position);
      } else {
        params["distance"]=true;
      }

      if (currentOrigin.getDistance() > 0) {
        params["miles"]=currentOrigin.getDistance();
      }
      params["order"]="ASC";
      console.log("refresh",params);

      var p1=refreshImages(params);
      params["subject"]="thing";
      params["museum_id"]=service.getCurrentMuseumId();  
      var p2=refreshThings(params);
      var p3=refreshMuseums(params)
      $q.all([p3,p1,p2]).then(
        function(){
          service.setCurrentImageForCurrentThing();
        });      
    }

    function refreshImages(params) {
      var result=subjectsResource.query(params);
      result.$promise.then(
        function(images){
          service.images=images;
          service.version += 1;
          if (!service.imageIdx || service.imageIdx > images.length) {
            service.imageIdx=0;
          }
          console.log("refreshImages", service);
        });
      return result.$promise;
    }
    function refreshThings(params) {
      var result=subjectsResource.query(params);
      result.$promise.then(
        function(things){
          service.things=things;
          service.version += 1;
          if (!service.thingIdx || service.thingIdx > things.length) {
            service.thingIdx=0;
          }
          console.log("refreshThings", service);
        });
      return result.$promise;
    }
    function refreshMuseums(params) {
      var result=museumsResource.query(params);
      result.$promise.then(
        function(museums){
          service.museums=museums;
          console.clear();
          console.log(museums)
          service.version += 1;
          if (!service.museumIdx || service.museumIdx > museums.length) {
            service.museumIdx=0;
          }
          console.log("refreshMuseums", service);
        });
      return result.$promise;
    }

    function isCurrentImageIndex(index) {
      //console.log("isCurrentImageIndex", index, service.imageIdx === index);
      return service.imageIdx === index;
    }
    function isCurrentThingIndex(index) {
      //console.log("isCurrentThingIndex", index, service.thingIdx === index);
      return service.thingIdx === index;
    }
    function isCurrentMuseumIndex(index) {
      //console.log("isCurrentThingIndex", index, service.thingIdx === index);
      return service.museumIdx === index;
    }
    function nextThing() {
      if (service.thingIdx !== null) {
        service.setCurrentThing(service.thingIdx + 1);
      } else if (service.things.length >= 1) {
        service.setCurrentThing(0);
      }    
    }
    function previousThing() {
      if (service.thingIdx !== null) {
        service.setCurrentThing(service.thingIdx - 1);
      } else if (service.things.length >= 1) {
        service.setCurrentThing(service.things.length-1);
      }
    }
    function nextMuseum() {
      if (service.museumIdx !== null) {
        service.setCurrentMuseum(service.museumIdx + 1);
      } else if (service.museums.length >= 1) {
        service.setCurrentMuseum(0);
      }    
    }
    function previousMuseum() {
      if (service.museumIdx !== null) {
        service.setCurrentMuseum(service.museumIdx - 1);
      } else if (service.museums.length >= 1) {
        service.setCurrentMuseum(service.museums.length-1);
      }
    }    
  }

  CurrentSubjects.prototype.getVersion = function() {
    return this.version;
  }
  CurrentSubjects.prototype.getImages = function() {
    return this.images;
  }
  CurrentSubjects.prototype.getThings = function() {
    return this.things;
  }
  CurrentSubjects.prototype.getMuseums = function() {
    return this.museums;
  }
  CurrentSubjects.prototype.getCurrentImageIndex = function() {
     return this.imageIdx;
  }
  CurrentSubjects.prototype.getCurrentImage = function() {
    return this.images.length > 0 ? this.images[this.imageIdx] : null;
  }
  CurrentSubjects.prototype.getCurrentThing = function() {
    return this.things.length > 0 ? this.things[this.thingIdx] : null;
  }
  CurrentSubjects.prototype.getCurrentMuseum = function() {
    return this.museums.length > 0 ? this.museums[this.museumIdx] : null;
  }
  CurrentSubjects.prototype.getCurrentImageId = function() {
    var currentImage = this.getCurrentImage();
    return currentImage ? currentImage.image_id : null;
  }
  CurrentSubjects.prototype.getCurrentThingId = function() {
    var currentThing = this.getCurrentThing();
    return currentThing ? currentThing.thing_id : null;
  }
  CurrentSubjects.prototype.getCurrentMuseumId = function() {
    var currentMuseum = this.getCurrentMuseum();
    return currentMuseum ? currentMuseum.id : null;
  }


  CurrentSubjects.prototype.setCurrentImage = function(index, skipThing) {
    if (index >= 0 && this.images.length > 0) {
      this.imageIdx = (index < this.images.length) ? index : 0;
    } else if (index < 0 && this.images.length > 0) {
      this.imageIdx = this.images.length - 1;
    } else {
      this.imageIdx = null;
    }

    if (!skipThing) {
      this.setCurrentThingForCurrentImage();
    }

    console.log("setCurrentImage", this.imageIdx, this.getCurrentImage());
    return this.getCurrentImage();
  }

  CurrentSubjects.prototype.setCurrentThing = function(index, skipImage) {
    if (index >= 0 && this.things.length > 0) {
      this.thingIdx = (index < this.things.length) ? index : 0;
    } else if (index < 0 && this.things.length > 0) {
      this.thingIdx = this.things.length - 1;
    } else {
      this.thingIdx=null;
    }

    if (!skipImage) {
      this.setCurrentImageForCurrentThing();
    }

    console.log("setCurrentThing", this.thingIdx, this.getCurrentThing());
    return this.getCurrentThing();
  }

  CurrentSubjects.prototype.setCurrentMuseum = function(index) {
    if (index >= 0 && this.museums.length > 0) {
      this.museumIdx = (index < this.museums.length) ? index : 0;
    } else if (index < 0 && this.museums.length > 0) {
      this.museumIdx = this.museums.length - 1;
    } else {
      this.museumIdx=null;
    }

    console.log("setCurrentMuseum", this.museumIdx, this.getCurrentMuseum());
    return this.getCurrentMuseum();
  }

  CurrentSubjects.prototype.setCurrentThingForCurrentImage = function() {
    var image=this.getCurrentImage();
    if (!image || !image.thing_id) {
      this.thingIdx = null;
    } else {
      var thing=this.getCurrentThing();
      if (!thing || thing.thing_id !== image.thing_id) {
        this.thingIdx=null;
        for (var i=0; i<this.things.length; i++) {
          thing=this.things[i];
          if (image.thing_id === thing.thing_id) {
            this.setCurrentThing(i, true);
            break;
          }
        }
      }      
    }
  }

  CurrentSubjects.prototype.setCurrentImageForCurrentThing = function() {
    var image=this.getCurrentImage();
    var thing=this.getCurrentThing();
    if (!thing) {
      this.imageIdx=null;
    } else if ((thing && (!image || thing.thing_id !== image.thing_id)) || image.priority!==0) {
      for (var i=0; i<this.images.length; i++) {
        image=this.images[i];
        if (image.thing_id === thing.thing_id && image.priority===0) {
          this.setCurrentImage(i, true);
          break;
        }
      }
    }
  }

  CurrentSubjects.prototype.setCurrentImageId = function(image_id, skipThing) {
    var found=this.getCurrentImageId() === image_id;
    if (image_id && !found) {
      for(var i=0; i<this.images.length; i++) {
        if (this.images[i].image_id === image_id) {
          this.setCurrentImage(i, skipThing);
          found=true;
          break;
        }
      }
    }
    if (!found) {
      this.setCurrentImage(null, true);      
    }
  }
  CurrentSubjects.prototype.setCurrentThingId = function(thing_id, skipImage) {
    var found=this.getCurrentThingId() === thing_id;
    if (thing_id && !found) {
      for (var i=0; i< this.things.length; i++) {
        if (this.things[i].thing_id === thing_id) {
          this.setCurrentThing(i, skipImage);
          found=true;
          break;
        }
      }
    }
    if (!found) {
      this.setCurrentThing(null, true);      
    }    
  }
  CurrentSubjects.prototype.setCurrentMuseumId = function(museum_id) {
    var found=this.getCurrentMuseumId() === museum_id;
    if (museum_id && !found) {
      for (var i=0; i< this.museums.length; i++) {
        if (this.museums[i].id === museum_id) {
          this.setCurrentMuseum(i);
          found=true;
          break;
        }
      }
    }
    if (!found) {
      this.setCurrentMuseum(null);      
    }    
  }
  CurrentSubjects.prototype.setCurrentSubjectId = function(thing_id, image_id) {
    console.log("setCurrentSubject", thing_id, image_id);
    this.setCurrentThingId(thing_id, true);
    this.setCurrentImageId(image_id, true);
  }















  })();
