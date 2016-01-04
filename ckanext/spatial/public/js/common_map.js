(function (ckan, jQuery) {

  /* Returns a Leaflet map to use on the different spatial widgets
   *
   * All Leaflet based maps should use this constructor to provide consistent
   * look and feel and avoid duplication.
   *
   * container               - HTML element or id of the map container
   * mapConfig               - (Optional) CKAN config related to the base map.
   *                           These are defined in the config ini file (eg
   *                           map type, API keys if necessary, etc).
   * leafletMapOptions       - (Optional) Options to pass to the Leaflet Map constructor
   * leafletBaseLayerOptions - (Optional) Options to pass to the Leaflet TileLayer constructor
   *
   * Examples
   *
   *   // Will return a map with attribution control
   *   var map = ckan.commonLeafletMap('map', mapConfig);
   *
   *   // For smaller maps where the attribution is shown outside the map, pass
   *   // the following option:
   *   var map = ckan.commonLeafletMap('map', mapConfig, {attributionControl: false});
   *
   * Returns a Leaflet map object.
   */
  ckan.commonLeafletMap = function (container,
                                    mapConfig,
                                    leafletMapOptions,
                                    leafletBaseLayerOptions) {

      var isHttps = window.location.href.substring(0, 5).toLowerCase() === 'https';
      var mapConfig = mapConfig || {type: 'mapquest'};
      var leafletMapOptions = leafletMapOptions || {};
      var leafletBaseLayerOptions = jQuery.extend(leafletBaseLayerOptions, {
                maxZoom: 18
      });
      var leafletMultiLayerOptions = [];

      map = new L.Map(container, leafletMapOptions);

      if (mapConfig.type == 'mapbox') {
          // MapBox base map
          if (!mapConfig['mapbox.map_id'] || !mapConfig['mapbox.access_token']) {
              throw '[CKAN Map Widgets] You need to provide a map ID ' +
		  '([account].[handle]) and an access token when using a MapBox layer. ' +
                  'See http://www.mapbox.com/developers/api-overview/ for details';
          }

          baseLayerUrl = '//{s}.tiles.mapbox.com/v4/' + mapConfig['mapbox.map_id'] +
	      '/{z}/{x}/{y}.png?access_token=' + mapConfig['mapbox.access_token'];
          leafletBaseLayerOptions.handle = mapConfig['mapbox.map_id'];
          leafletBaseLayerOptions.subdomains = mapConfig.subdomains || 'abcd';
          leafletBaseLayerOptions.attribution = mapConfig.attribution ||
	      'Data: <a href="http://osm.org/copyright" target="_blank">' +
	      'OpenStreetMap</a>, Design: <a href="http://mapbox.com/about/maps"' +
	      'target="_blank">MapBox</a>';
      } else if (mapConfig.type == 'custom') {
          // Custom XYZ layer
          baseLayerUrl = mapConfig['custom.url'];
          if (mapConfig.subdomains) leafletBaseLayerOptions.subdomains = mapConfig.subdomains;
          leafletBaseLayerOptions.attribution = mapConfig.attribution;
      } else if (mapConfig.type == 'multilayer') {
	  // Custom multi-layer map
	  console.log(mapConfig);
	  // parse layer-specific mapConfig properties into array of layers
	  function layerprops(mc) {
	      var match = [];
	      for (mprop in mc) {
		  if ((ma = /^(layer_\d+)\.(.+)$/.exec(mprop))) {
		      match.push(ma);
		  }
	      }
	      return(match);
	  };
	  
	  mapconf = (function (){
	      var mc = JSON.parse(JSON.stringify(mapConfig));
	      for (lp in layerprops(mapConfig)) {
		  delete mc[lp[0]];
		  mc[lp[1]] = mc[lp[1]] || {};
		  
		  
	      
			      
	      
	  console.log(layerprops);
	  // layernames = (function (mapconf) {
	  //     var layernames = Object.getOwnPropertyNames(mapconf).filter(function (key) {
	  // 	  return (/^layer_(\d+)\..+$/.test(key));
	  //     });
	  //     return(layernames);
	  // }(mapConfig))

      } else {
          // MapQuest OpenStreetMap base map
          if (isHttps) {
            baseLayerUrl = '//otile{s}-s.mqcdn.com/tiles/1.0.0/osm/{z}/{x}/{y}.png';
          } else {
            baseLayerUrl = '//otile{s}.mqcdn.com/tiles/1.0.0/osm/{z}/{x}/{y}.png';
          }
          leafletBaseLayerOptions.subdomains = mapConfig.subdomains || '1234';
          leafletBaseLayerOptions.attribution = mapConfig.attribution ||
	      'Map data &copy; OpenStreetMap contributors, Tiles Courtesy of ' +
	      '<a href="http://www.mapquest.com/" target="_blank">MapQuest</a> ' +
	      '<img src="//developer.mapquest.com/content/osm/mq_logo.png">';
      }
      
      var baseLayer = new L.TileLayer(baseLayerUrl, leafletBaseLayerOptions);
      map.addLayer(baseLayer);

      return map;

  }

})(this.ckan, this.jQuery);
