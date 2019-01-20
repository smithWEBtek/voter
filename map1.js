$(function () {
	console.log('map.js loaded ---');
	loadTestVoters()
	newVoterForm()
	// loadAllVoters()
});

let testVoters = [
	[42.346268, -71.095764],
	[42.380098, -71.116629],
	[42.36306, - 71.00639]
]

function loadTestVoters() {
	for (let i = 0; i < testVoters.length; i++) {
		testVoters[i] = new L.marker(testVoters[i], { icon: voteOpposeIcon }).addTo(map)
	}
}

// baseURL can be toggled local Rails server or Heroku
// const baseURL = 'https://voter-preference-api.herokuapp.com/api/'
const baseURL = 'http://127.0.0.1:3000/api/'

// API service to geocode street address and vice versa
let platform = new H.service.Platform({
	'app_id': 'HCIyXQOhmMjxjUE3NteH',
	'app_code': 'ax8hst6McVJjLFKhWRkz1A'
});

// instance of the API service
let geocoder = platform.getGeocodingService();

// instance of Leaflet map, centered on Boston
let map = L.map('map').setView([42.358056, -71.063611], 12);
L.tileLayer('http://a.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	attribution: 'Map data &copy; OpenStreetMap contributors'
}).addTo(map);


function loadAllVoters() {
	$.ajax({
		url: baseURL + 'markers',
		method: 'get',
		dataType: 'json'
	}).done(function (response) {
		console.log('response to loadAllVoters: ', response);
	})
}

// voter fills out address form, LatLng are derived by API
function newVoterForm() {
	$('form#voter-preference-form').on('submit', function (event) {
		event.preventDefault()

		let obj = {
			voter: {
				street_number: $('#street_number').val(),
				street_name: $('#street_name').val(),
				city: $('#city').val(),
				state: $('#state').val(),
				postal_code: $('#postal_code').val(),
				vote_preference: $("input[name='vote']:checked").val()
			}
		}

		$.ajax({
			method: 'post',
			url: baseURL + 'voters',
			data: obj
		}).done(function (data) {
			let voter = new Voter(data)
			getLatLngFromAddressString(voter.id, voter.address_string)

			let voterData = voter.voterHTML()
			showVoterData(voterData)
		})
	})
}


function showVoterData(data) {
	$('#voter-data').html(data)
}


// voter clicks map, LatLng is converted to street address for validation by user
// function getStreetAddressFromLatLng() {
// 	map.addEventListener('click', function (event) {
// 		console.log("e.latlng: ", event.latlng);

// 		geocoder.geocode(geocodingParams, onResult, function (e) {
// 			alert(e);
// 		});
// 	})
// }

let latlng;
function getLatLngFromAddressString(voter_id, string) {
	geocoder.geocode({ searchText: string }, onResult, function (error) {
		console.log("error with geocode request: ", error);
	})

	function onResult(data) {
		latlng = [data.Response.View[0].Result[0].Location.DisplayPosition.Latitude, data.Response.View[0].Result[0].Location.DisplayPosition.Longitude]

		console.log("latlng: ", latlng)
		let voterPatchData = {
			voter: {
				id: voter_id,
				lat: latlng[0].toString(),
				lng: latlng[1].toString(),
				geocode: latlng.toString()
			}
		}
		$.ajax({
			url: `${baseURL}voters/${voter_id}`,
			// method: 'patch',
			method: 'PATCH',
			// type: 'patch',
			// type: 'put',
			data: voterPatchData
		}).done(function (response) {
			console.log("update with latlng response: ", response);
			debugger
		})
		new L.marker(latlng, { icon: voteOpposeIcon }).addTo(map)
	}
}

class Voter {
	constructor(obj) {
		this.id = obj.id,
			this.street_number = obj.street_number,
			this.street_name = obj.street_name,
			this.city = obj.city,
			this.state = obj.state,
			this.postal_code = obj.postal_code,
			this.lat = obj.lat,
			this.lng = obj.lng,
			this.address_string = obj.address_string,
			this.vote_preference = obj.vote_preference
	}
}

Voter.prototype.voterHTML = function () {
	return (`
			<div data_id = ${this.id}>
				<p data-street_number=${this.street_number}>${this.street_number ? this.street_number : ""}</p>
				<p data-street_name=${this.street_name}>${this.street_name ? this.street_name : ""}</p>
				<p data-city=${this.city}>${this.city ? this.city : ""}</p>
				<p data-state=${this.state}>${this.state ? this.state : ""}</p>
				<p data-postal_code=${this.postal_code}>${this.postal_code ? this.postal_code : ""}</p>
				<p data-vote_preference=${this.vote_preference}>${this.vote_preference ? this.vote_preference : ""}</p>
		</div >
			`)
}

Voter.prototype.recordPreference = function (preference) {
	this.preference = preference
}

// Voter.prototype.updateLatLng = function () {
// 	debugger;
// 	$.ajax({
// 		url: baseURL + 'voters',
// 		method: 'post',
// 		data: JSON.stringify(this)
// 	}).then(function (response) {
// 		console.log("updating voter with lat/lng response: ", response);
// 	})
// }

function infoDiv() {
	let infoDiv = (`
		<div id = 'info' >
			<h1 id='name' class='subtitle'>title</h1>
			<h1 id='LatLng' class='subtitle'>LatLng</h1>
			<h1 id='link_anchor' class='subtitle'><a href='' target='_blank'>link</a></h1>
		</div>
	`)
	document.getElementById('voter-data').innerHTML = infoDiv;
}