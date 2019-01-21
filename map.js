// document ready, load listeners
$(function () {
	refresh()
	newVoterForm()
	nationalView()
	newEnglandView()
	mapClickStreetAddress()
});

// baseURL can be switched to local Rails server or Heroku
// const baseURL = 'http://127.0.0.1:3000/api/'
const baseURL = 'https://voter-preference-api.herokuapp.com/api/'

// API service to geocode street address and vice versa
let platform = new H.service.Platform({
	'app_id': 'HCIyXQOhmMjxjUE3NteH',
	'app_code': 'ax8hst6McVJjLFKhWRkz1A'
});

// create an instance of the API service from www.here.com
let geocoder = platform.getGeocodingService();

// instance of Leaflet map, centered on Boston
let map = L.map('map').setView([42.358056, -71.063611], 12);
L.tileLayer('https://a.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	attribution: 'Map data &copy; OpenStreetMap contributors'
}).addTo(map);

// listens for click of button, calls loadAllVoters(), pans out to see Eastern US
function nationalView() {
	$('#load-national-view').on('click', function (event) {
		event.preventDefault()
		event.stopPropagation()
		map.setView([42.358056, -71.063611], 4);
		loadAllVoters()
	})
}

// listens for click of button, calls loadAllVoters(), pans out to see New England
function newEnglandView() {
	$('#load-new-england-view').on('click', function (event) {
		event.preventDefault()
		event.stopPropagation()
		map.setView([42.358056, -71.063611], 10);
		loadAllVoters()
	})
}

// resets the map view to original page load; connected to click event on logo-image
function refresh() {
	$('img#logo-image').on('click', function (event) {
		event.preventDefault()
		map.setView([42.358056, -71.063611], 12);
		resetAddressForm()
	})
}

// clear address form fields; reset background color of form and submitt button
function resetAddressForm() {
	$('#street_number').val('')
	$('#street_name').val('')
	$('#city').val('')
	$('#state').val('')
	$('#postal_code').val('')
	$('#voter-preference-form-div').css("background-color", "rgb(250, 240, 211")
	$('#submit-vote-preference-button').css("background-color", "rgb(250, 240, 211")
	$("input[name='vote']").val(["none"])
	$('#geocode').html('')
}

// gets all voters from database, passes the response to loadMarkers()
function loadAllVoters() {
	$.ajax({
		url: baseURL + 'voters',
		method: 'get',
		dataType: 'json'
	}).done(function (response) {
		loadMarkers(response)
	})
}

// receives an array of voter data; accesses the geocode field of each; creates a new Marker on the map
function loadMarkers(markers) {
	markers.forEach((marker) => {
		if (marker) {
			geocoder.geocode({ searchText: marker.address_string }, onResult, function (error) {
				console.log("error with geocode request: ", error);
			})
			function onResult(data) {
				if (data.Response.View[0].Result != 'undefined') {
					marker.geocode = [data.Response.View[0].Result[0].Location.DisplayPosition.Latitude, data.Response.View[0].Result[0].Location.DisplayPosition.Longitude].toString()
					new L.marker(marker.geocode.split(',').map(c => parseFloat(c)), {
						icon: icons[marker.vote_preference]
					}).addTo(map)
				} else {
					return;
				}
			}
		}
	})
}

// voter fills out address form, LatLng are derived by API, saved to database and rendered on map.
function newVoterForm() {
	$('button#submit-vote-preference-button').on('click', function (event) {
		event.preventDefault()
		let obj = {
			voter: {
				geocode: '', // initially, geocode attribute is empty
				street_number: $('#street_number').val(),
				street_name: $('#street_name').val(),
				city: $('#city').val(),
				state: $('#state').val(),
				postal_code: $('#postal_code').val(),
				vote_preference: $("input[name='vote']:checked").val().toLowerCase(),
				address_string: $('#street_number').val() + ' ' + $('#street_name').val() + ', ' + $('#city').val() + ', ' + $('#state').val() + ' ' + $('#postal_code').val()
			}
		}

		// geocode attribute is then retreived from API
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

				// data is replaced on the DOM, in the address form, ready for Voter to choose preference
				loadVoterDataToAddressForm(voter)

				new L.marker(voter.geocode.split(',').map(c => parseFloat(c)), {
					icon: icons[voter.vote_preference]
				}).addTo(map)
				resetAddressForm()
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

			// data is replaced on the DOM, in the address form, ready for Voter to choose preference
			loadVoterDataToAddressForm(voter)
			$('#voter-preference-form-div').css("background-color", "rgb(183, 240, 160)");
			$('#submit-vote-preference-button').css("background-color", "rgb(183, 240, 160)");
			$('#geocode').html(`<p>geocode: ${voter.geocode}</p>`)
		})
	}
}

// load address form from map click
function loadVoterDataToAddressForm(data) {
	$('#street_number').val(data.street_number)
	$('#street_name').val(data.street_name)
	$('#city').val(data.city)
	$('#state').val(data.state)
	$('#postal_code').val(data.postal_code)
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
