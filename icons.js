// map icon for OPPOSE vote
let oppose = L.icon({
	iconUrl: 'lib/img/oppose.png',
	iconSize: [12, 12],
	iconAnchor: [12, 22],
	popupAnchor: [0, -22]
})

// map icon for SUPPORT vote
let support = L.icon({
	iconUrl: 'lib/img/support.png',
	iconSize: [12, 12],
	iconAnchor: [12, 22],
	popupAnchor: [0, -22]
})

// map icon for UNDECIDED vote
let undecided = L.icon({
	iconUrl: 'lib/img/undecided.png',
	iconSize: [12, 12],
	iconAnchor: [12, 22],
	popupAnchor: [0, -22]
})

// let none = L.icon({
// 	iconUrl: 'lib/img/none.png',
// 	iconSize: [25, 25],
// 	iconAnchor: [12, 22],
// 	popupAnchor: [0, -22]
// })

// this object is used to match icon with Voter.vote_preference
let icons = { support: support, oppose: oppose, undecided: undecided }