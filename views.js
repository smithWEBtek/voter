// reset the map view to original page load; connected to click event on logo-image, zoom level 11
function refresh() {
  $('img#logo-image').on('click', function (event) {
    event.preventDefault()
    map.setView([42.358056, -71.063611], 11);
  })
  resetAddressForm()
}

// listen for click of button, pan out to greater Boston, zoom level 11
function bostonView() {
  $('#load-boston-view').on('click', function (event) {
    event.preventDefault()
    event.stopPropagation()
    map.setView([42.358056, -71.063611], 11);
    resetAddressForm()
  })
}

// listen for click of button, pan out to greater Boston, zoom level 7
function newEnglandView() {
  $('#load-new-england-view').on('click', function (event) {
    event.preventDefault()
    event.stopPropagation()
    map.setView([42.163686, -72.635366], 7);
    resetAddressForm()
  })
}

// listen for click of button, pan out to national view, zoom level 4
function nationalView() {
  $('#load-national-view').on('click', function (event) {
    event.preventDefault()
    event.stopPropagation()
    map.setView([38.645955, -95.153003], 4);
    resetAddressForm()
  })
}
