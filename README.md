## Summary
This app provides a live clickable map for Users to upload geocoded audio files for the Mattapan Mapping project led by Powerful Pathways. The user can either enter their address in a form and have it geocoded to the map, or vice-versa, they can click on the map to populate the address form. 

Once the form is completed, the user can upload an audio file to be stored in SoundCloud, and to be embedded in the Mattapan Mapping website.

## Configuration and Setup
* Deployment instructions
	- The app is comprised of 2 github repositories, 1 for the UI, and 1 for the api.

	[CLIENT](https://github.com/smithWEBtek/mattapan-audio)

	[API](https://github.com/smithWEBtek/mattapan-audio-api)

## Setup notes
- `index.html` has required dependencies in CDN link tags

- the Leaflet JavaScript library is included as physical files in the directory structure, (but could also be a CDN link if preferred).

- `index.html` has script tag link to `map.js`

- the files `composer.json` and `index.php` are present for ease of deployment to Heroku, otherwise these 2 files have no functional effect on the app.

- `Bulma` is used as a css library for ease of quick deployment, with a responsive, clean layout

- `map.css` has any custom css that is required

- Here.com is used for geocoding and reverse geocoding

## Display
The `index.html` page has 2 areas:
1. `audio file upload form` 
2. `map for clicking on addresses`

## UI flow
1. The `app response div`, shows User prompts & app responses

2. The map is centered on the Mattapan area of Boston, geocoded with zoom level 15
`42.26722962533316,-71.09355255306583`

3. Data entry or click the map
	OPTION 1: ENTER ADDRESS in `address form`
	- The address is auto-completed as the User types, using an API call to the `here.com` api.
	- User chooses correct address from API responses, or 
	- User continues editing the `address form` until the api returns a valid address.
	- User clicks `confirm address` button.
	- Valided address appears in the `address validation div`.

	OPTION 2: MAP-ZOOM-CLICK on address location

	- User clicks map and coordinates are captured by JavaScript.
	- An API call is made to HERE.com to find a street address that is closest to, and within 150 meters of, the "clicked" location coordinates.
	- The User accepts the returned street address by clicking `Confirm Address` button.
	- The User rejects the returned address and is prompted to ENTER ADDRESS or MAP-ZOOM-CLICK on location
	- User clicks `Upload Audio File` button.

6. When a valid address appears in the `address validation div`:
	- A JavaScript class Object of `User` is instantiated with the validated address and geocode information.
	- The `voter preference form` is activated and javascript starts listening for the `Submit Preference` button click

8. The AudioFile Object is updated with the chosen preference and saved to the PostgreSQL database.

9. The map is updated with a colored map point icon based on the AudioFile geocode and data from the form.
