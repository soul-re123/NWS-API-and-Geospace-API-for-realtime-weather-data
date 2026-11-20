

A lightweight web app built with HTML, CSS, and JavaScript that fetches and displays live forecast and severe weather alert data from the National Weather Service (NWS) API (`api.weather.gov`). Defaults to **Saint Louis, MO** on load for testing.

## Features
- **City & State Search:** Geocodes U.S. city and state inputs (including two-letter state abbreviations) into coordinates before querying the NWS API.
- **Dual Forecast Fetching:** Concurrently retrieves both the 12-hour and hourly forecast endpoints to display temperature, wind speed, wind direction, and current dew point (°F).
- **Multi-Alert Rendering:** Loops through all active NWS alerts for the selected coordinates and displays each warning or advisory on the page.
