let testVoters = [
	[42.346268, -71.095764],
	[42.380098, -71.116629],
	[42.36306, - 71.00639],
	[42.390270801811454, -71.10008122399451]
]

function loadTestVoters() {
	for (let i = 0; i < testVoters.length; i++) {
		testVoters[i] = new L.marker(testVoters[i], { icon: voteOpposeIcon }).addTo(map)
	}
}


let addresses = [
	'138 Portland St, Boston, MA 02114',
	'181 Cambridge St, Boston, MA 02114'
]