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
    mapConfig = mapConfig || {type: 'stamen'};
    leafletMapOptions = leafletMapOptions || {};
    leafletBaseLayerOptions = jQuery.extend(leafletBaseLayerOptions, {
      maxZoom: 18
    });

    var map = new L.Map(container, leafletMapOptions);
    var baseLayer, baseLayerUrl;

    if (mapConfig.type == 'mapbox') {
      // MapBox base map
      if (!mapConfig['mapbox.map_id'] || !mapConfig['mapbox.access_token']) {
        throw '[CKAN Map Widgets] You need to provide a map ID ([account].[handle]) and an access token when using a MapBox layer. ' +
	  'See http://www.mapbox.com/developers/api-overview/ for details';
      }
    
      baseLayerUrl = '//{s}.tiles.mapbox.com/v4/' + mapConfig['mapbox.map_id'] + '/{z}/{x}/{y}.png?access_token=' + mapConfig['mapbox.access_token'];
      leafletBaseLayerOptions.handle = mapConfig['mapbox.map_id'];
      leafletBaseLayerOptions.subdomains = mapConfig.subdomains || 'abcd';
      leafletBaseLayerOptions.attribution = mapConfig.attribution || 'Data: <a href="http://osm.org/copyright" target="_blank">OpenStreetMap</a>, Design: <a href="http://mapbox.com/about/maps" target="_blank">MapBox</a>';
      baseLayer = new L.TileLayer(baseLayerUrl, leafletBaseLayerOptions);
      
    } else if (mapConfig.type == 'custom') {
      // Custom XYZ layer
      baseLayerUrl = mapConfig['custom.url'];
      if (mapConfig.subdomains) leafletBaseLayerOptions.subdomains = mapConfig.subdomains;
      if (mapConfig.tms) leafletBaseLayerOptions.tms = mapConfig.tms;
      leafletBaseLayerOptions.attribution = mapConfig.attribution;
      baseLayer = new L.TileLayer(baseLayerUrl, leafletBaseLayerOptions);    
    } else if (mapConfig.type === 'multilayer') {
      // Custom multi-layer map
      // parse layer-specific mapConfig properties into array of layers
      mapConfig.layers = (function(mc) {
	var ma, mprop, layeridx, layerlist;
	var layers = {};
	// collect layer properties from config
	for (mprop in mc) {
	  if ((ma = /^layer_(\d+)\.(.+)$/.exec(mprop))) {
	    if (! layers.hasOwnProperty(ma[1])) {
	      // there is no object yet for this layer yet
	      layers[ma[1]] = {};
	    }
	    layers[ma[1]][ma[2]] = mc[ma[0]];
	  }
	}
	// sort layers
	layeridx = Object.keys(layers);
	layeridx.sort(function (a, b) {
	  return(parseInt(a) - parseInt(b));
	});
	layerlist = layeridx.map(function (idx) {
	  var url;
	  var label;
	  url = layers[idx]['url'];
	  delete layers[idx]['url'];
	  label = layers[idx]['label'] || 'layer_' + idx;
	  delete layers[idx]['label'];
	  return({'url': url,
	    'label': label,
	    'options': layers[idx]
	  });
	});
	return(layerlist);
      })(mapConfig);
      // create layercontrol
      (function (layerlist) {
	var baseLayers = {};
	layerlist.forEach(function (val) {
	  baseLayers[val['label']] = new L.TileLayer(val['url'], val['options']);
	});
	return(L.control.layers(baseLayers, undefined, {position: "bottomright"}));
      })(mapConfig.layers).addTo(map);
      baseLayerUrl = mapConfig.layers[0]['url'];
      leafletBaseLayerOptions = mapConfig.layers[0]['options'];
      
    } else {
      // Default to Stamen base map
      baseLayerUrl = 'https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}.png';
		       leafletBaseLayerOptions.subdomains = mapConfig.subdomains || 'abcd';
      leafletBaseLayerOptions.attribution = mapConfig.attribution || 'Map tiles by <a href="http://stamen.com">Stamen Design</a> (<a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>). Data by <a href="http://openstreetmap.org">OpenStreetMap</a> (<a href="http://creativecommons.org/licenses/by-sa/3.0">CC BY SA</a>)';
          }
    baseLayer = new L.TileLayer(baseLayerUrl, leafletBaseLayerOptions);
    map.addLayer(baseLayer);
    return map;
  };
})(this.ckan, this.jQuery);
