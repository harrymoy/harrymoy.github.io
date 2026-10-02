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

  // Pin icons keyed by each place's `type`, drawn on a 16px grid as stroked paths.
  var ICONS = {
    restaurant: 'M4 2v4a2 2 0 0 0 4 0V2M6 8v6M11.5 14V2c-1.5 1.5-2 3.5-2 6h2',
    pub: 'M4 3h8l-1 11H5zM4.4 6.5h7.2',
    bar: 'M3 3h10L8 9zM8 9v5M5.5 14h5',
    cafe: 'M3 6h8v4a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3zM11 7h1a1.5 1.5 0 0 1 0 3h-1M6 2v2M8.5 2v2',
    bakery: 'M3 8.5A2.5 2.5 0 0 1 4 3.5h8a2.5 2.5 0 0 1 1 5V13H3zM6 7l1.5-2M9 7l1.5-2',
    'ice cream': 'M4.5 7a3.5 3.5 0 0 1 7 0zM4.5 7L8 14l3.5-7',
    museum: 'M2 6l6-3.5L14 6zM3.5 8v4M6.5 8v4M9.5 8v4M12.5 8v4M2 13.5h12',
    park: 'M8 14V9M8 2a4 4 0 0 0-4 4c0 2 1.5 3 4 3s4-1 4-3a4 4 0 0 0-4-4z',
    market: 'M2.5 6l1-3h9l1 3M2.5 6a1.8 1.8 0 0 0 3.7 0 1.8 1.8 0 0 0 3.6 0 1.8 1.8 0 0 0 3.7 0M3.5 8.5V14h9V8.5',
    stadium: 'M14 8A6 6 0 1 1 2 8a6 6 0 0 1 12 0zM8 5.5l2.4 1.7-.9 2.8H6.5l-.9-2.8z'
  };
  var SVG_NS = 'http://www.w3.org/2000/svg';

  function icon(type) {
    var svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('viewBox', '0 0 16 16');
    svg.setAttribute('aria-hidden', 'true');
    var path = svg.appendChild(document.createElementNS(SVG_NS, 'path'));
    path.setAttribute('d', ICONS[type] || ICONS.restaurant);
    return svg;
  }

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
    pin.setAttribute('aria-label', place.name + ', ' + place.type + ', ' + place.area);
    // MapLibre positions the marker element with `transform`, so hover effects go on this inner dot
    var dot = pin.appendChild(document.createElement('span'));
    dot.className = 'pin__dot';
    dot.appendChild(icon(place.type));

    var label = document.createElement('div');
    var tag = document.createElement('span');
    tag.className = 'place-popup__tag';
    tag.textContent = place.type;
    var name = document.createElement('strong');
    name.textContent = place.name;
    label.append(tag, name, document.createElement('br'), place.area);

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
