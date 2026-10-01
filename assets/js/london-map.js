// Renders the favourite-places map on /london from _data/london.yml.
// MapLibre + OpenFreeMap vector tiles: free, no key, attribution comes from the style.
(function () {
  var el = document.getElementById('london-map');
  if (!el || !window.maplibregl) return;

  // WebGL can't read CSS variables, so these mirror the tokens in main.scss.
  // Warms Positron's greys towards the site's paper colours. Keyed by style layer id.
  var BASEMAP_TINTS = {
    background: ['background-color', '#F1EEE6'],
    landuse_residential: ['fill-color', '#ECE8DE'],
    building: ['fill-color', '#E5E0D4'],
    park: ['fill-color', '#DFE5D2'],
    landcover_wood: ['fill-color', '#D9E0CB'],
    water: ['fill-color', '#C8D5DB']
  };

  var places = window.LONDON_PLACES;
  var bounds = new maplibregl.LngLatBounds();
  places.forEach(function (place) { bounds.extend([place.lng, place.lat]); });

  var map = new maplibregl.Map({
    container: el,
    style: 'https://tiles.openfreemap.org/styles/positron',
    bounds: bounds,
    fitBoundsOptions: { padding: 48 },
    cooperativeGestures: true,
    attributionControl: { compact: true }
  });

  map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-left');

  map.on('style.load', function () {
    Object.keys(BASEMAP_TINTS).forEach(function (layer) {
      if (map.getLayer(layer)) map.setPaintProperty(layer, BASEMAP_TINTS[layer][0], BASEMAP_TINTS[layer][1]);
    });
  });

  places.forEach(function (place) {
    var pin = document.createElement('button');
    pin.type = 'button';
    pin.className = 'pin';
    pin.setAttribute('aria-label', place.name + ', ' + place.area);
    // MapLibre positions the marker element with `transform`, so hover effects go on this inner dot
    pin.appendChild(document.createElement('span')).className = 'pin__dot';

    var label = document.createElement('div');
    var name = document.createElement('strong');
    name.textContent = place.name;
    label.append(name, document.createElement('br'), place.area);

    var popup = new maplibregl.Popup({ offset: 14, closeButton: false, closeOnClick: false, className: 'place-popup' })
      .setDOMContent(label);

    var marker = new maplibregl.Marker({ element: pin }).setLngLat([place.lng, place.lat]).addTo(map);

    function open() { popup.setLngLat([place.lng, place.lat]).addTo(map); }
    function close() { popup.remove(); }

    pin.addEventListener('mouseenter', open);
    pin.addEventListener('mouseleave', close);
    pin.addEventListener('focus', open);
    pin.addEventListener('blur', close);
    // Touch has no hover, so a tap toggles the label
    pin.addEventListener('click', function () { popup.isOpen() ? close() : open(); });
  });
})();
