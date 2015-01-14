// spinner
var spinner = 0;

// Don't scape HTML string in Mustache
Mustache.escape = function (text) { return text; }

// https://github.com/Leaflet/Leaflet
var map = new L.Map('map');
var iconLayer = new L.LayerGroup();
map.addLayer(iconLayer);

var attribution = ' Data: <a href="http://www.overpass-api.de/" target="_blank">OverpassAPI</a>/ODbL OpenStreetMap';
var tileLayerData = {
    mapnik: {
	name: 'Estándar',
	url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
    },
    lyrk: {
	name: 'Lyrk',
	url: 'http://tiles.lyrk.org/ls/{z}/{x}/{y}?apikey=3d836013a4ab468f965bfd1328d89522',
	attribution: 'Tiles by <a href="http://lyrk.de/">Lyrk</a>'
    },
    fr: {
	name: 'OpenStreetMap France',
	url: 'http://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png'
    },
    mapquest: {
	name: 'MapQuest Open',
	url: 'http://otile{s}.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.jpeg',
	attribution: 'Tiles Courtesy of <a href="http://www.mapquest.com/" target="_blank">MapQuest</a> &mdash;',
	subdomains: '1234'
    },
    hot: {
	name: 'Humanitario',
	url: 'http://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
	attribution: 'Tiles courtesy of <a href="http://hot.openstreetmap.org/" target="_blank">Humanitarian OpenStreetMap Team</a> &mdash;'
    }
};

var tileLayers = {};
for (tile in tileLayerData) {
    var tileAttribution;
    var subdomains = tileLayerData[tile].subdomains ? tileLayerData[tile].subdomains : 'abc';
    if (tileLayerData[tile].attribution) {
	tileAttribution = tileLayerData[tile].attribution + attribution;
    }
    else tileAttribution = attribution;

    tileLayers[tileLayerData[tile].name] = L.tileLayer(
	tileLayerData[tile].url,
	{attribution: tileAttribution, subdomains: subdomains}
    )
}

tileLayers['Estándar'].addTo(map);
L.control.layers(tileLayers).addTo(map);

// https://github.com/perliedman/leaflet-control-geocoder
var geocoder = L.Control.geocoder({
    position: 'topleft',
    placeholder: 'Buscar...',
    errorMessage: 'Ningún resultado',
    showResultIcons: true
}).addTo(map);

geocoder.markGeocode = function(result) {
    this._map.fitBounds(result.bbox);
    return this;
};


// https://github.com/Turbo87/sidebar-v2/
var sidebar = L.control.sidebar('sidebar').addTo(map);
$(document).ready(function () {
    // open #home sidebar-pane to show the available POIs
    sidebar.open('home');
});

// https://github.com/mlevans/leaflet-hash
var hash = new L.Hash(map);

// update the permalink when L.Hash changes the #hash
window.onhashchange = function() {
    update_permalink();
}


// https://github.com/domoritz/leaflet-locatecontrol
L.control.locate({
    follow: false,
    setView: true,
    keepCurrentZoomLevel: true,
    showPopup: false,
    strings: {
	title: 'Muéstrame donde estoy',
	popup: 'Estás a {distance} metros aprox. de aquí',
	outsideMapBoundsMsg: 'No es posible ubicar tu posición en el mapa'
    },
    onLocationError: function(err) {
	alert('Disculpa. Hubo un error al intentar localizar tu ubicación.');
    }
}).addTo(map);

// https://github.com/ebrelsford/Leaflet.loading
var loadingControl = L.Control.loading({
    separate: true
});
map.addControl(loadingControl);

var pois = {
    bar: {
	name: 'Bar',
	query: '[amenity=bar]',
	iconName: 'bar_coktail'
    },

    pub: {
	name: 'Pub',
	query: '[amenity=pub]',
	iconName: 'bar'
    },

    restaurant: {
	name: 'Restaurante',
	query: '[amenity=restaurant]',
	iconName: 'restaurant'
    },

    fast_food: {
	name: 'Comida Rápida',
	query: '[amenity=fast_food]',
	iconName: 'fastfood'
    },

    bank: {
	name: 'Banco',
	query: '[amenity=bank]',
	iconName: 'bank'
    },

    atm: {
	name: 'Cajero',
	query: '[amenity=atm]',
	iconName: 'atm-2'
    },

    fuel: {
	name: 'Estación de Servicio',
	query: '[amenity=fuel]',
	iconName: 'fillingstation'
    },

    wheel_repair: {
	name: 'Gomería',
	query: '[shop=car_repair][car_repair=wheel_repair]',
	iconName: 'tires',
	tagParser: car_repair_parser
    },

    clinic: {
	name: 'Clínica',
	query: '[amenity=clinic]',
	iconName: 'medicine'
    },

    hospital: {
	name: 'Hospital',
	query: '[amenity=hospital]',
	iconName: 'hospital-building'
    },

    pharmacy: {
	name: 'Farmacia',
	query: '[amenity=pharmacy]',
	iconName: 'drugstore'
    },

    supermarket: {
	name: 'Supermercado',
	query: '[shop=supermarket]',
	iconName: 'supermarket'
    },

    convenience: {
	name: 'Despensa',
	query: '[shop=convenience]',
	iconName: 'conveniencestore'
    },

    gallery: {
	name: 'Galería de Arte',
	query: '[tourism=gallery]',
	iconName: 'museum_art'
    },

    museum: {
	name: 'Museo',
	query: '[tourism=museum]',
	iconName: 'museum_crafts'
    },

    viewpoint: {
	name: 'Mirador',
	query: '[tourism=viewpoint]',
	iconName: 'sight-2'
    },

    'camp_site': {
	name: 'Camping',
	query: '[tourism=camp_site]',
	iconName: 'camping-2'
    },

    hotel: {
	name: 'Hotel',
	query: '[tourism=hotel]',
	iconName: 'hotel_0star'
    },

    hostel: {
	name: 'Hostel',
	query: '[tourism=hostel]',
	iconName: 'youthhostel'
    },

    info_tourism: {
	name: 'Información Turística',
	query: '[tourism=information]',
	iconName: 'information'
    },

    zoo: {
	name: 'Zoológico',
	query: '[tourism=zoo]',
	iconName: 'zoo'
    }
}

// https://github.com/kartenkarsten/leaflet-layer-overpass
function callback(data) {
    if (spinner > 0) spinner -= 1;
    if (spinner == 0) $('#spinner').hide();

    for(i=0; i < data.elements.length; i++) {
	e = data.elements[i];

	if (e.id in this.instance._ids) return;
	this.instance._ids[e.id] = true;

	var pos = (e.type == 'node') ?
	    new L.LatLng(e.lat, e.lon) :
	    new L.LatLng(e.center.lat, e.center.lon);

	// TODO: improve this
	var type = ''
	if (e.tags.amenity) {
	    if (type == '') type = e.tags.amenity;
	}
	if (e.tags.tourism) {
	    if (type == '') type = e.tags.tourism;
	}
	if (e.tags.shop) {
	    if (e.tags.car_repair == 'wheel_repair') type = 'wheel_repair';
	    if (type == '') type = e.tags.shop;
	}

	var poi = pois[type];
	// skip this undefined icon
	if (!poi) {
	    console.info('Skipping undefined icon: "' + type + '"');
	    continue;
	}

	var markerIcon  = L.icon({
	    iconUrl: 'assets/img/icons/' + poi.iconName + '.png',
	    iconSize: [32, 37],
	    iconAnchor: [18.5, 35],
	    popupAnchor: [0, -27]
	});
	var marker = L.marker(pos, {icon: markerIcon})
	var markerPopup = '\
            <ul class="nav nav-tabs" role="tablist" id="myTab">\
              <li role="presentation" class="active"><a href="#info" aria-controls="info" role="tab" data-toggle="tab">Info</a></li>\
              <li role="presentation"><a href="#raw" aria-controls="raw" role="tab" data-toggle="tab">Raw</a></li>\
            </ul>';

	if (poi.tagParser) {
	    markerPopup += poi.tagParser(e);
	}
	else {
	    for(tag in e.tags) {
		markerPopup += Mustache.render(
		    '<strong>{{name}}:</strong> {{value}}<br>',
		    {name: tag, value: e.tags[tag]});
	    }
	}
	// TODO: use marker.getPopup().update() to update the layout
	// once the user clicks on "Raw"
	marker.bindPopup(markerPopup);
	marker.addTo(this.instance);
    }
}

function build_overpass_query() {
    query = '(';
    $('#pois input:checked').each(function(i, element) {
	query += 'node(BBOX)' + pois[element.dataset.key].query + ';';
	query += 'way(BBOX)' + pois[element.dataset.key].query + ';';
	query += 'relation(BBOX)' + pois[element.dataset.key].query + ';';
    });
    query += ');out center;';
}

function setting_changed() {
    // remove pois from current map
    iconLayer.clearLayers();
    build_overpass_query();
    show_overpass_layer();
    update_permalink();
}

function show_pois_checkboxes() {
    // build the content for the "Home" sidebar pane
    var i = 0;
    var content = '';
    content += '<table>';
    for (poi in pois) {
	if (i % 2 == 0) content += '<tr>';
	content += '<td>';
	var checkbox = Mustache.render(
	    '<div class="poi-checkbox"> \
		<label> \
		    <img src="assets/img/icons/{{icon}}.png"></img> \
		    <input type="checkbox" data-key="{{key}}" onclick="setting_changed()"><span>{{name}}</span> \
		</label> \
	    </div>',
	    {key: poi, name: pois[poi].name, icon: pois[poi].iconName}
	);
	content += checkbox;
	content += '</td>';
	i++;
	if (i % 2 == 0) content += '</tr>';
    }
    content += '</table>';
    $('#pois').append(content);
}
show_pois_checkboxes();

var uri = URI(window.location.href);
if (uri.hasQuery('pois')) {
    var selectedPois = uri.search(true).pois;
    if (!$.isArray(selectedPois)) {
	poi = selectedPois.replace('/', '');
	$('#pois input[data-key='+ poi + ']').attr('checked', true);
    }
    else {
	for (i = 0; i < selectedPois.length; i++) {
	    // the last poi has a "/" on it because leaflet-hash
	    poi = selectedPois[i].replace('/', '');
	    $('#pois input[data-key='+ poi + ']').attr('checked', true);
	}
    }
    setting_changed();
}

// https://github.com/makinacorpus/Leaflet.RestoreView
if (!map.restoreView()) {
    map.setView([-27.4927, -58.8063], 12);
}

var query = '';
build_overpass_query();

function show_overpass_layer() {
    if (query == '' || query == '();out center;') {
	console.debug('There is nothing selected to filter by.');
	return;
    }
    var opl = new L.OverPassLayer({
	query: query,
	callback: callback,
	minzoom: 14
    });

    iconLayer.addLayer(opl);
}

function get_permalink() {
    var uri = URI(window.location.href);
    var selectedPois = [];
    $('#pois input:checked').each(function(i, element) {
	selectedPois.push(element.dataset.key);
    });

    uri.query({'pois': selectedPois, 'norestoreview': true});
    return uri.href();
}

function update_permalink() {
    var link = get_permalink();
    $('#permalink').attr('href', link);
}
