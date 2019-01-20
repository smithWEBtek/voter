// map icon for OPPOSE vote
let oppose = L.icon({
	iconUrl: 'lib/img/oppose.png',
	iconSize: [13, 13],
	iconAnchor: [12, 22],
	popupAnchor: [0, -22]
})

// map icon for SUPPORT vote
let support = L.icon({
	iconUrl: 'lib/img/support.png',
	iconSize: [13, 13],
	iconAnchor: [12, 22],
	popupAnchor: [0, -22]
})

// map icon for UNDECIDED vote
let undecided = L.icon({
	iconUrl: 'lib/img/undecided.png',
	iconSize: [13, 13],
	iconAnchor: [12, 22],
	popupAnchor: [0, -22]
})

// this object is used to match icon with Voter.vote_preference
let icons = { support: support, oppose: oppose, undecided: undecided }