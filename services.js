// baseURL can be toggled between your local running Rails server or Heroku demo server
// const baseURL = 'https://voter-preference-api.herokuapp.com/api/'
const baseURL = 'http://127.0.0.1:3000/api/'

// API service to geocode street address and vice versa
let platform = new H.service.Platform({
	'app_id': 'HCIyXQOhmMjxjUE3NteH',
	'app_code': 'ax8hst6McVJjLFKhWRkz1A'
});

// instance of the API service
let geocoder = platform.getGeocodingService();

// instance of Leaflet map
let map = L.map('map').setView([42.358056, -71.063611], 12);
L.tileLayer('http://a.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	attribution: 'Map data &copy; OpenStreetMap contributors'
}).addTo(map);
