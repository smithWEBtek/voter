$(function () {
	console.log('map.js loaded ---');
	loadTestVoters()
	newVoterForm()
	loadCompaignManagerView()
	mapClickStreetAddress()
});

let testVoters = [
	[42.346268, -71.095764],
	[42.380098, -71.116629],
	[42.36306, - 71.00639]
]

function loadTestVoters() {
	for (let i = 0; i < testVoters.length; i++) {
		testVoters[i] = new L.marker(testVoters[i], { icon: support }).addTo(map)
	}
}

// baseURL can be toggled local Rails server or Heroku
const baseURL = 'https://voter-preference-api.herokuapp.com/api/'
// const baseURL = 'http://127.0.0.1:3000/api/'

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

function loadCompaignManagerView() {
	$('#load-campaign-manager-view').on('click', function (event) {
		event.preventDefault()
		map.setView([42.358056, -71.063611], 5);
		loadAllVoters()
	})
}

function loadAllVoters() {
	$.ajax({
		url: baseURL + 'voters',
		method: 'get',
		dataType: 'json'
	}).done(function (response) {
		loadMarkers(response)
	})
}

function loadMarkers(markers) {
	markers.forEach((marker) => {
		if (marker) {
			geocoder.geocode({ searchText: marker.address_string }, onResult, function (error) {
				console.log("error with geocode request: ", error);
			})
			function onResult(data) {
				marker.geocode = [data.Response.View[0].Result[0].Location.DisplayPosition.Latitude, data.Response.View[0].Result[0].Location.DisplayPosition.Longitude].toString()
				new L.marker(marker.geocode.split(',').map(c => parseFloat(c)), {
					icon: icons[marker.vote_preference]
				}).addTo(map)
			}
		}
	})
}

// voter fills out address form, LatLng are derived by API, saved to database and rendered on map.
function newVoterForm() {
	$('form#voter-preference-form').on('submit', function (event) {
		event.preventDefault()

		let obj = {
			voter: {
				geocode: '',
				street_number: $('#street_number').val(),
				street_name: $('#street_name').val(),
				city: $('#city').val(),
				state: $('#state').val(),
				postal_code: $('#postal_code').val(),
				vote_preference: $("input[name='vote']:checked").val().toLowerCase(),
				address_string: $('#street_number').val() + ' ' + $('#street_name').val() + ', ' + $('#city').val() + ', ' + $('#state').val() + ' ' + $('#postal_code').val()
			}
		}

		geocoder.geocode({ searchText: obj.voter.address_string }, onResult, function (error) {
			console.log("error with geocode request: ", error);
		})

		function onResult(data) {
			obj.voter.geocode = [data.Response.View[0].Result[0].Location.DisplayPosition.Latitude, data.Response.View[0].Result[0].Location.DisplayPosition.Longitude].toString()

			$.ajax({
				method: 'post',
				url: baseURL + 'voters',
				data: obj
			}).done(function (data) {
				let voter = new Voter(data)
				let voterData = voter.voterHTML()
				showVoterData(voterData)

				new L.marker(voter.geocode.split(',').map(c => parseFloat(c)), {
					icon: icons[voter.vote_preference]
				}).addTo(map)
			})
		}
	})
}

// voter clicks map, LatLng is converted to street address for validation by user
function mapClickStreetAddress() {
	let geocode;
	map.addEventListener('click', function (event) {
		geocode = [event.latlng.lat, event.latlng.lng].toString()
		let prox = `${event.latlng.lat.toString()},`
		prox += `${event.latlng.lng.toString()}, 150`

		let reverseGeocodingParameters = {
			// prox: '52.5309,13.3847,150',
			prox: prox,
			mode: 'retrieveAddresses',
			maxresults: 1
		};

		geocoder.reverseGeocode(reverseGeocodingParameters, onSuccess, function (error) {
			console.log('mapClickStreetAddress: error: ', error);
		});
	})
	function onSuccess(result) {
		let address = result.Response.View[0].Result[0].Location.Address
		console.log('the address_string: ', address);

		let obj = {
			voter: {
				address_string: address.Label,
				street_number: address.HouseNumber,
				street_name: address.Street,
				city: address.City,
				state: address.State,
				postal_code: address.PostalCode,
				geocode: geocode
			}
		}

		$.ajax({
			url: baseURL + 'voters',
			method: 'post',
			data: obj
		}).done(function (data) {
			let voter = new Voter(data)
			let voterData = voter.voterHTML()
			showVoterData(voterData)
			new L.marker(voter.geocode.split(',').map(c => parseFloat(c)), {
				icon: icons[voter.vote_preference]
			}).addTo(map)
		})
	}
}

function showVoterData(data) {
	$('#voter-data').html(data)
}

class Voter {
	constructor(obj) {
		this.id = obj.id,
			this.street_number = obj.street_number,
			this.street_name = obj.street_name,
			this.city = obj.city,
			this.state = obj.state,
			this.postal_code = obj.postal_code,
			this.geocode = obj.geocode,
			this.address_string = obj.address_string,
			this.vote_preference = obj.vote_preference.toLowerCase()
	}
}

Voter.prototype.voterHTML = function () {
	return (`
		<div>
			<p>${this.street_number ? this.street_number : ""} ${this.street_name ? this.street_name : ""}</p>
			<p>${this.city ? this.city : ""}, ${this.state ? this.state : ""}  ${this.postal_code ? this.postal_code : ""}</p>
			<p>${this.geocode ? this.geocode : ""}</p>
			<p>${this.vote_preference ? this.vote_preference : ""}</p>
		</div>
	`)
}

function infoDiv() {
	let infoDiv = (`
		<div id='info'>
			<h1 id='name' class='subtitle'>title</h1>
			<h1 id='LatLng' class='subtitle'>LatLng</h1>
			<h1 id='link_anchor' class='subtitle'><a href='' target='_blank'>link</a></h1>
		</div >
	`)
	document.getElementById('voter-data').innerHTML = infoDiv;
}
