// document ready, load listeners
$(function () {
	refresh()
	newVoterForm()
	bostonView()
	newEnglandView()
	nationalView()
	mapClickStreetAddress()
	loadAllVoters()
	loadStats()
});

// baseURL can be switched to local Rails server or Heroku
const baseURL = 'http://127.0.0.1:3000/api/'
// const baseURL = 'https://voter-preference-api.herokuapp.com/api/'

// API service www.here.com to geocode street address and vice versa
let platform = new H.service.Platform({
	useCIT: true,
	'app_id': APP_ID,
	'app_code': APP_CODE,
	useHTTPS: true
});

// create an instance of the here.com API service
let geocoder = platform.getGeocodingService();

// create an instance of Leaflet map, centered on Boston, zoom level 12
let map = L.map('map').setView([42.358056, -71.063611], 12);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
	attribution: 'Map data &copy; OpenStreetMap contributors'
}).addTo(map);

// clear address form fields; reset background color of form and submit button
function resetAddressForm() {
	$("input[name='vote']").val(["undecided"])
	$('#street_number').val('')
	$('#street_name').val('')
	$('#city').val('')
	$('#state').val('')
	$('#postal_code').val('')
	$('#voter-preference-form-div').css("background-color", "rgb(250, 240, 211")
	$('#submit-vote-preference-button').css("background-color", "rgb(250, 240, 211")
	$('#geocode').html('')
	loadStats()
}

// get all voters from database, pass the response to loadMarkers()
function loadAllVoters() {
	$.ajax({
		url: baseURL + 'voters',
		method: 'get',
		dataType: 'json'
	}).done(function (response) {
		loadMarkers(response)
	})
}

// receive array of voter data; access the geocode field of each; create a new Marker on the map
function loadMarkers(markers) {
	markers.forEach((marker) => {
		if (marker) {
			geocoder.geocode({ searchText: marker.address_string }, onResult, function (error) {
				console.log("error with geocode request: ", error);
			})
			function onResult(data) {
				if (data && data.Response.View[0]) {
					marker.geocode = [data.Response.View[0].Result[0].Location.DisplayPosition.Latitude, data.Response.View[0].Result[0].Location.DisplayPosition.Longitude].toString()

					new L.marker(marker.geocode.split(',').map(c => parseFloat(c)), {
						icon: icons[marker.vote_preference]
					}).addTo(map)
				}
			}
		}
	})
}

// voter fills out address form, LatLng are derived by API, saved to database and rendered on map.
function newVoterForm() {
	$('button#submit-vote-preference-button').on('click', function (event) {
		event.preventDefault()

		if (!$('#street_number').val()) {
			console.log("no valid street_number");
			return;
		}

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

// voter clicks map, LatLng is converted to street address for validation by user, before voting
function mapClickStreetAddress() {
	let geocode;
	map.addEventListener('click', function (event) {
		geocode = [event.latlng.lat, event.latlng.lng].toString()
		let prox = `${event.latlng.lat.toString()},`
		prox += `${event.latlng.lng.toString()}, 100`

		let reverseGeocodingParameters = {
			prox: prox, // (example)prox: '52.5309,13.3847,150',
			mode: 'retrieveAddresses',
			maxresults: 1
		};

		geocoder.reverseGeocode(reverseGeocodingParameters, onSuccess, function (error) {
			console.log('mapClickStreetAddress: error: ', error);
		});
	})
	function onSuccess(result) {
		let address = result.Response.View[0].Result[0].Location.Address
		console.log('the address_string: ', address.Label);

		// let obj = {
		let voter = {
			address_string: address.Label,
			street_number: address.HouseNumber,
			street_name: address.Street,
			city: address.City,
			state: address.State,
			postal_code: address.PostalCode,
			geocode: geocode
		}

		// a valid LatLng does NOT mean we have a valid street address ...
		if (!voter.street_number || !voter.street_name) {
			resetAddressForm()

			$('#geocode').html('<p>Please click again, there is no valid address within 100 meters of where you clicked.</p>').css('background-color', 'pink')
			return;
		} else {

			// if we have a valid street address, the data is replaced on the DOM, in the address form, for Voter to vote
			loadVoterDataToAddressForm(voter)
			$('#voter-preference-form-div').css("background-color", "rgb(183, 240, 160)");
			$('#submit-vote-preference-button').css("background-color", "rgb(183, 240, 160)");
			$('#geocode').html(`<p>geocode: ${voter.geocode}</p>`)
		}
	}
}

// load address form from map click
function loadVoterDataToAddressForm(data) {
	$('#street_number').val(data.street_number)
	$('#street_name').val(data.street_name)
	$('#city').val(data.city)
	$('#state').val(data.state)
	$('#postal_code').val(data.postal_code)
	$('#geocode').css('background-color', 'rgb(201, 214, 228)')
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
