## Summary
This app provides a live clickable map for voters to indicate their voting preference. The user can either enter their address in a form and have it geocoded to the map, or vice-versa, they can click on the map to populate the address form. 

Once the form is completed, the user can choose from 3 options:  Support, Oppose or Undecided.

The voter preference will then be stored in the database, with an appropriate map marker colored by their choice: 
Yellow  = Undecided
Red = Oppose
Green = Support

A live reloading D3 bar chart represents the current counts of the 3 voter preference groups.

## Configuration and Setup
* Ruby version: 2.4.4

* System dependencies: Gemfile contains required dependencies. 

* Configuration: 
	- This is a Rails app in API mode, to provide data for the Voter Preference app.

* Database creation:
	- Postgresql requires database creation, which is included in a custom rake tasks below.

* Database initialization:
	- To create the database, migrate the tables, seed the database and start your local Rails server, please run: 
	`$ rake db:dcms`
	- see this task here: `app/lib/tasks/dcms.rake`

	- To do the same steps after deployment to Heroku, please run: 
	`$ rake db:hdcms` 
	- see this task here: `app/lib/tasks/hdcms.rake`

* How to run the test suite
	- Currently there is not a test suite

* Services (job queues, cache servers, search engines, etc.)

* Deployment instructions
	- The app is comprised of 2 github repositories, 1 for the client, and 1 for the api.

	[CLIENT](https://github.com/smithWEBtek/voter-preference-client)

	[API](https://github.com/smithWEBtek/voter-preference-api)



## Setup notes
- `index.html` has required dependencies in CDN link tags

- the Leaflet JavaScript library is included as physical files in the directory structure, (but could also be a CDN link if preferred).

- `index.html` has script tag link to `map.js`

- the files `composer.json` and `index.php` are present for ease of deployment to Heroku, otherwise these 2 files have no functional effect on the app.

- `Bulma` is used as a css library for ease of quick deployment, with a responsive, clean layout

- `map.css` has any custom css that is required

- Here.com is used for geocoding and reverse geocoding

- D3 is used for live data visualization

## Display
The `index.html` page has 4 areas:
1. `nav bar`
2. `map div`
3. `voter preference form` 
4. `D3 data visualization bar chart`


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

9. The map is updated with a colored map point icon based on the Voter's preference
	- Green = Support
	- Red = Oppose
	- Yellow = Undecided

## Views
	
- The app includes 3 views including Boston, New England and US national view.

- The map displays the entire voter database table, with markers colored by the preference of each individual voter

- A D3 bar graph shows a visual representation of the data
