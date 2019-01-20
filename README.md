## Setup notes
- `index.html` has required dependencies in CDN link tags
- the Leaflet JavaScript library is included as physical files in the directory structure, (but could also be a CDN link if preferred).
- `index.html` has script tag link to `map.js`
- the files `composer.json` and `index.php` are present simply for ease of deployment to Heroku, otherwise these 2 files have no functional effect on the app.
- `Bulma` is used as a css library for ease of quick deployment, with a responsive, clean layout
- `map.css` has any custom css that is required


## Display
The `index.html` page has 4 areas:
1. `map div`
2. `address form`
3. `voter preference form` 
4. `app response div`


## Voter Interaction Flow
1. The `app response div`, shows Voter prompts & app responses

2. The map is centered on Boston geocode with zoom level 12
`([42.358056, -71.063611], 12)`

3. The `confirm address` button is grayed out, non-functional until the form contains a validated street address.

4. The `voter preference form` is grayed out and not functional until an API validated, Voter-accepted address appears in the `address form`, (which activates the `voter preference form` (step #7).

5. The Voter is prompted with 2 options for address validation with a default message in the `app response div`
	
	OPTION 1: ENTER ADDRESS in `address form`
	- The address is auto-completed as the Voter types, using an API call to the `here.com` api.
	- Voter chooses correct address from API responses, or 
	- Voter continues editing the `address form` until the api returns a valid address.
	- Voter clicks `confirm address` button.
	- Valided address appears in the `address validation div`.

	OPTION 2: MAP-ZOOM-CLICK on address location

	- Voter clicks map and coordinates are captured by JavaScript.
	- An API call is made to HERE.com to find a street address that is closest to, and within 150 meters of, the "Voter-clicked" location coordinates.
	- The Voter accepts the returned street address by clicking `Confirm Address` button.
	- The Voter rejects the returned address and is prompted to ENTER ADDRESS or MAP-ZOOM-CLICK on location
	- Voter clicks `confirm address` button.
	- Required section of the address form turns GREEN
	

6. When a valid address appears in the  `address validation div`:
	- A JavaScript class Object of `Voter` is instantiated with the validated address and geocode information.
	- The `voter preference form` is activated and javascript starts listening for the `Submit Preference` button click

7. Voter Submit Preference
	- Voter clicks radio button in `voter preference form`
	- support / opppose / undecided

8. The Voter Object is updated with the chosen preference and saved to the PostgreSQL database.

9. The map is updated with a map point icon:
	- The Voter's preference is shown by color
	- Green = Support
	- Red = Oppose
	- Yellow = Undecided

9. The Voter is prompted/invited to:
	- Complete a survey of election topics.
	- Attend a local informational event.

## Campaign Manager View
	
- The Campaign Manager is given an unpublished URL directing them to their view of the map.

- At the url, the Campaign Manager is required to login and authenticate.

- The map displays the entire voter database table, with markers colored by the preference of each individual voter

- A D3 bar graph shows interesting visual representation of the data
- Analysis is performed to identify:

	- Areas of highest density of SUPPORTING voters
		- To convert voters to advocates
		- To convert advocates to campaign volunteers
		- To convert campaign volunteers to campaign workers

	- Areas of highest density of OPPOSING voters
		- To stage informational events
		- To go door to door, wining hearts and minds
		- To convert opposers to supporters