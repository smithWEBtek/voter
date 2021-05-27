// document ready, load listeners
$(function () {
	newUploadForm()
	mattapanCenterView()
	mapClickStreetAddress()
	loadAllAudioMarkers()
});

const baseURL = 'https://mattapan-audio-api.smithwebtek.com/api/'

// API service www.here.com to geocode street address and vice versa
let platform = new H.service.Platform({
	useCIT: true,
	'app_id': "HCIyXQOhmMjxjUE3NteH",
	'app_code': 'ax8hst6McVJjLFKhWRkz1A',
	useHTTPS: true
});

// create an instance of the here.com API service
let geocoder = platform.getGeocodingService();

// create an instance of Leaflet map, centered on Mattapan, zoom level 15
// let map = L.map('map').setView([42.358056, -71.063611], 12);
let map = L.map('map').setView([42.26722962533316,-71.09355255306583], 15);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
	attribution: 'Map data &copy; OpenStreetMap contributors'
}).addTo(map);

// clear address form fields; reset background color of form and submit button
function resetAddressForm() {
	$('#street_number').val('')
	$('#street_name').val('')
	$('#city').val('')
	$('#state').val('')
	$('#postal_code').val('')
	$('#upload-audio-form').css("background-color", "rgb(250, 240, 211")
	$('#upload-audio-file').css("background-color", "rgb(250, 240, 211")
	$('#geocode').html('')
}

// get all audio files from database, pass the response to loadMarkers()
function loadAllAudioMarkers() {
	$.ajax({
		url: baseURL + 'audio-files',
		method: 'get',
		dataType: 'json'
	}).done(function (response) {
		loadMarkers(response)
	})
}

// receive array of audio file data; access the geocode field of each one; create a new Marker on the map
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
            // icon: <add audio file icon here>
					}).addTo(map)
				}
			}
		}
	})
}

// user fills out address form, LatLng are derived by API, saved to database and rendered on map.
function newUploadForm() {
	$('button#upload-audio-file').on('click', function (event) {
		event.preventDefault()

		if (!$('#street_number').val()) {
			console.log("no valid street_number");
			return;
		}

		let obj = {
			audioFile: {
				geocode: '', // initially, geocode attribute is empty
				street_number: $('#street_number').val(),
				street_name: $('#street_name').val(),
				city: $('#city').val(),
				state: $('#state').val(),
				postal_code: $('#postal_code').val(),
				address_string: $('#street_number').val() + ' ' + $('#street_name').val() + ', ' + $('#city').val() + ', ' + $('#state').val() + ' ' + $('#postal_code').val()
			}
		}

		// geocode attribute is then retreived from API
		geocoder.geocode({ searchText: obj.audioFile.address_string }, onResult, function (error) {
			console.log("error with geocode request: ", error);
		})

		function onResult(data) {
			obj.audioFile.geocode = [data.Response.View[0].Result[0].Location.DisplayPosition.Latitude, data.Response.View[0].Result[0].Location.DisplayPosition.Longitude].toString()

			$.ajax({
				method: 'post',
				url: baseURL + 'audio-files',
				data: obj
			}).done(function (data) {
				let audioFile = new AudioFile(data)

				// data is replaced on the DOM, in the address form, ready for User to edit address if needed
				loadDataToAddressForm(audioFile)

				new L.marker(audioFile.geocode.split(',').map(c => parseFloat(c)), {
					// icon: <set audioFile icon>
				}).addTo(map)
				resetAddressForm()
			})
		}
	})
}

// User clicks map, LatLng is converted to street address for validation by user, before voting
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
		let audioFile = {
			address_string: address.Label,
			street_number: address.HouseNumber,
			street_name: address.Street,
			city: address.City,
			state: address.State,
			postal_code: address.PostalCode,
			geocode: geocode
		}

		// a valid LatLng does NOT mean we have a valid street address ...
		if (!audioFile.street_number || !audioFile.street_name) {
			resetAddressForm()

			$('#geocode').html('<p>Please click again, there is no valid address within 100 meters of where you clicked.</p>').css('background-color', 'pink')
			return;
		} else {

			// if we have a valid street address, the data is replaced on the DOM, in the address form, for User to edit/accept.
			loadDataToAddressForm(audioFile)
      $('#geocode-label').show()
			$('#voter-preference-form-div').css("background-color", "rgb(183, 240, 160)");
			$('#submit-vote-preference-button').css("background-color", "rgb(183, 240, 160)");
			$('#geocode').html(`<p>${audioFile.geocode}</p>`)
		}
	}
}

// load address form from map click
function loadDataToAddressForm(data) {
	$('#street_number').val(data.street_number)
	$('#street_name').val(data.street_name)
	$('#city').val(data.city)
	$('#state').val(data.state)
	$('#postal_code').val(data.postal_code)
	$('#geocode').css('background-color', 'rgb(201, 214, 228)')
}

// listen for click of button, pan out to Mattapan, zoom level 15
function mattapanCenterView() {
  $('button#load-mattapan-view').on('click', function (event) {
    event.preventDefault()
    event.stopPropagation()
    map.setView([42.26722962533316,-71.09355255306583], 15);
    resetAddressForm()
    $('#geocode-label').hide()
    resetAddressForm()
  })
}

class AudioFile {
	constructor(obj) {
		this.id = obj.id,
			this.street_number = obj.street_number,
			this.street_name = obj.street_name,
			this.city = obj.city,
			this.state = obj.state,
			this.postal_code = obj.postal_code,
			this.geocode = obj.geocode,
			this.address_string = obj.address_string
	}
}

AudioFile.prototype.audioFileHTML = function () {
	return (`
		<div>
			<p>${this.street_number ? this.street_number : ""} ${this.street_name ? this.street_name : ""}</p>
			<p>${this.city ? this.city : ""}, ${this.state ? this.state : ""}  ${this.postal_code ? this.postal_code : ""}</p>
			<p>${this.geocode ? this.geocode : ""}</p>
		</div>
	`)
}
