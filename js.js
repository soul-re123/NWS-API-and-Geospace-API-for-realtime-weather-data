/* 
- This function grabs forecast data using the API from the NWS.
- Note: This function was AI-assisted to help me better understand what I was doing.
 */

// 1. Set your coordinates globally here
const LAT = 38.6270; 
const LON = -90.1994; 

// Clean, single search function using separate city and state inputs
async function search() {
    // 1. Grab values from the two separate inputs
    const cityName = document.getElementById('cityInput').value.trim();
    const rawState = document.getElementById('stateInput').value.trim().toLowerCase();
    
    if (!cityName) {
        alert("Please enter a city name!");
        return;
    }

    // 2. Map state abbreviations if they typed one (e.g., "mo" -> "missouri")
    const stateMap = {
        "al": "alabama", "ak": "alaska", "az": "arizona", "ar": "arkansas", "ca": "california",
        "co": "colorado", "ct": "connecticut", "de": "delaware", "fl": "florida", "ga": "georgia",
        "hi": "hawaii", "id": "idaho", "il": "illinois", "in": "indiana", "ia": "iowa",
        "ks": "kansas", "ky": "kentucky", "la": "louisiana", "me": "maine", "md": "maryland",
        "ma": "massachusetts", "mi": "michigan", "mn": "minnesota", "ms": "mississippi", "mo": "missouri",
        "mt": "montana", "ne": "nebraska", "nv": "nevada", "nh": "new hampshire", "nj": "new jersey",
        "nm": "new mexico", "ny": "new york", "nc": "north carolina", "nd": "north dakota", "oh": "ohio",
        "ok": "oklahoma", "or": "oregon", "pa": "pennsylvania", "ri": "rhode island", "sc": "south carolina",
        "sd": "south dakota", "tn": "tennessee", "tx": "texas", "ut": "utah", "vt": "vermont",
        "va": "virginia", "wa": "washington", "wv": "west virginia", "wi": "wisconsin", "wy": "wyoming",
        "dc": "district of columbia"
    };

    let targetState = stateMap[rawState] || rawState; // Translates abbreviation or keeps full state name

    console.log(`Searching for City: "${cityName}", State Filter: "${targetState || 'none'}"`);

    try {
        const geoResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=10`);
        const geoData = await geoResponse.json();

        if (!geoData.results || geoData.results.length === 0) {
            throw new Error(`City "${cityName}" not found. Please check your spelling!`);
        }

        let selectedLocation = null;

        // If they typed a state, find the matching US result
        if (targetState) {
            selectedLocation = geoData.results.find(loc => 
                loc.admin1 && loc.admin1.toLowerCase() === targetState && loc.country === "United States"
            );
        }

        // Fallback to top result if no specific state match was found
        if (!selectedLocation) {
            selectedLocation = geoData.results[0];
        }

        const foundLat = selectedLocation.latitude;
        const foundLon = selectedLocation.longitude;
        const stateStr = selectedLocation.admin1 ? `, ${selectedLocation.admin1}` : '';
        const displayName = `${selectedLocation.name}${stateStr} (${selectedLocation.country})`;

        console.log(`Selected location: ${displayName} -> Lat: ${foundLat}, Lon: ${foundLon}`);
        initWeatherAppForLocation(foundLat, foundLon);

    } catch (error) {
        console.error("Search error:", error);
        alert(error.message); 
    }
}

async function fetchData(lat, lon){
    try{
        const headers = {
            'User-Agent': '(weather-app, ciangrizzle6@gmail.com)'
        };
    
        const pointsResponse = await fetch(`https://api.weather.gov/points/${lat},${lon}`, { headers });
        if (!pointsResponse.ok) throw new Error(`Error fetching points: ${pointsResponse.statusText}`);

        const pointsData = await pointsResponse.json();
        const forecastURL = pointsData.properties.forecast;

        const forecastResponse = await fetch(forecastURL, { headers });
        if (!forecastResponse.ok) throw new Error(`Error fetching forecast: ${forecastResponse.statusText}`);

        const forecastData = await forecastResponse.json();
        const periods = forecastData.properties.periods;

        return periods;

    } catch (error) {
        console.error("Failed to fetch weather data:", error);
    }
}

async function fetchAlerts(lat, lon) {
    try {
        const headers = {
            'User-Agent': '(weather-app, ciangrizzle6@gmail.com)'
        };

        const response = await fetch(`https://api.weather.gov/alerts/active?point=${lat},${lon}`, { headers });
        if (!response.ok) throw new Error(`Error fetching alerts: ${response.statusText}`);

        const data = await response.json();
        return data.features; // Returns an array of active alerts (empty if none)

    } catch (error) {
        console.error("Failed to fetch weather alerts:", error);
    }
}

function displayAlerts(alerts) {
    const alertElement = document.getElementById('activeAlerts');
    
    if (!alerts || alerts.length === 0) {
        alertElement.textContent = "No active weather alerts for this area.";
        alertElement.style.color = "green"; 
        return;
    }

    const currentAlert = alerts[0].properties;
    alertElement.textContent = `⚠️ ALERT: ${currentAlert.event} - ${currentAlert.headline}`;
    alertElement.style.color = "red"; 
}

// 2. Orchestrates fetching both datasets and updating the screen
async function initWeatherAppForLocation(lat = 38.6270, lon = -90.1994) {
    console.log(`Fetching weather for coordinates: ${lat}, ${lon}`);
    
    const periods = await fetchData(lat, lon);
    const alerts = await fetchAlerts(lat, lon);
    
    if (periods) {
        displayWeather(periods);
    }
    
    displayAlerts(alerts);
}

// 3. Takes the periods array and updates your HTML elements
function displayWeather(periods) {
    if (!periods || periods.length === 0) {
        console.warn("No periods found to display.");
        return;
    }

    const current = periods[0];
    console.log("Current period object:", current);

    const tempElement = document.getElementById('temp');
    const windElement = document.getElementById('wind');
    const windDirElement = document.getElementById('windDirection');

    if (tempElement) {
        tempElement.textContent = `Temperature: ${current.temperature}°${current.temperatureUnit}`;
    } else {
        console.error("Could not find element with id 'temp' in your HTML!");
    }

    if (windElement) {
        windElement.textContent = `Wind Speed: ${current.windSpeed}`;
    }
    
    if (windDirElement) {
        windDirElement.textContent = `Wind Direction: ${current.windDirection}`;
    }
}

// 4. Button & Enter Key Event Listeners
document.getElementById('searchButton').addEventListener('click', () => {
    search();
});

// Trigger search on Enter from the City input
document.getElementById('cityInput').addEventListener('keydown', (event) => {
    if (event.key === 'Enter') search();
});

// Trigger search on Enter from the State input
document.getElementById('stateInput').addEventListener('keydown', (event) => {
    if (event.key === 'Enter') search();
});

// 5. Run the app automatically when the page first loads using default coordinates
initWeatherAppForLocation(LAT, LON);