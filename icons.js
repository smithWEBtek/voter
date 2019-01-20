// map icon for OPPOSE vote
let oppose = L.icon({
	iconUrl: 'lib/img/oppose.png',
	iconRetinaUrl: 'lib/img/triangle-stroked-15.svg',
	iconSize: [9, 9],
	iconAnchor: [12, 22],
	popupAnchor: [0, -22]
})

// map icon for SUPPORT vote
let support = L.icon({
	iconUrl: 'lib/img/support.png',
	iconRetinaUrl: 'lib/img/triangle-stroked-15.svg',
	iconSize: [9, 9],
	iconAnchor: [12, 22],
	popupAnchor: [0, -22]
})

// map icon for UNDECIDED vote
let undecided = L.icon({
	iconUrl: 'lib/img/undecided.png',
	iconRetinaUrl: 'lib/img/triangle-stroked-15.svg',
	iconSize: [9, 9],
	iconAnchor: [12, 22],
	popupAnchor: [0, -22]
})

let icons = { support: support, oppose: oppose, undecided: undecided }