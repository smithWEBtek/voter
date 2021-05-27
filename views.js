// reset the map view to original page load; connected to click event on logo-image, zoom level 11
function refresh() {
  $('img#logo-image').on('click', function (event) {
    event.preventDefault()
    map.setView([42.26722962533316,-71.09355255306583], 4);
  })
  resetAddressForm()
}

// listen for click of button, pan out to greater Boston, zoom level 11
function mattapanCenterView() {
  $('#load-mattapan-view').on('click', function (event) {
    event.preventDefault()
    event.stopPropagation()
    map.setView([42.26722962533316,-71.09355255306583], 11);
    resetAddressForm()
  })
}

