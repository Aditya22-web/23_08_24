let playerNames = [];

function initializeAutocomplete() {
  console.log('Initializing autocomplete...');

  function autocomplete(input) {
    console.log(`Autocompleting for input: "${input}"`);
    if (!input || typeof input !== 'string') {
      console.log('Invalid input for autocomplete');
      return [];
    }
    const matchingNames = playerNames.filter(name =>
      name && name.toLowerCase().startsWith(input.toLowerCase())
    );
    console.log(`Found ${matchingNames.length} matches for "${input}"`);
    console.log('Matches:', matchingNames.slice(0, 5));
    return matchingNames.slice(0, 5);
  }

  function setupAutocomplete(inputElement, suggestionsElement) {
    console.log(`Setting up autocomplete for element: ${inputElement.id}`);
    let currentValue = '';
    inputElement.addEventListener('input', (e) => {
      try {
        currentValue = e.target.value.trim();
        console.log(`Input event triggered for ${inputElement.id} with value: "${currentValue}"`);

        if (currentValue.length === 0) {
          suggestionsElement.innerHTML = '';
          suggestionsElement.style.display = 'none';
          return;
        }

        const suggestions = autocomplete(currentValue);
        console.log(`Received ${suggestions.length} suggestions for "${currentValue}"`);

        suggestionsElement.innerHTML = '';

        if (suggestions.length > 0) {
          suggestionsElement.style.display = 'block';
          suggestions.forEach(suggestion => {
            const li = document.createElement('li');
            li.textContent = suggestion;
            li.addEventListener('click', (event) => {
              event.preventDefault();
              inputElement.value = suggestion;
              inputElement.dispatchEvent(new Event('input', { bubbles: true }));
              suggestionsElement.innerHTML = '';
              suggestionsElement.style.display = 'none';
              console.log(`Suggestion selected for ${inputElement.id}: "${suggestion}"`);
            });
            suggestionsElement.appendChild(li);
          });
          console.log(`Added ${suggestions.length} suggestions to DOM for ${inputElement.id}`);
        } else {
          suggestionsElement.style.display = 'none';
          console.log(`No suggestions found for "${currentValue}" in ${inputElement.id}`);
        }
      } catch (error) {
        console.error(`Error in autocomplete for ${inputElement.id}:`, error);
        console.error(`Error stack: ${error.stack}`);
      }
    });

    // Add blur event listener to hide suggestions when focus is lost
    let suggestionClicked = false;
    suggestionsElement.addEventListener('mousedown', () => {
      suggestionClicked = true;
    });
    inputElement.addEventListener('blur', () => {
      setTimeout(() => {
        if (!suggestionClicked) {
          suggestionsElement.style.display = 'none';
        }
        suggestionClicked = false;
      }, 200); // Small delay to allow for suggestion selection
    });
  }

  const playerInputs = document.querySelectorAll('.player-name');
  console.log(`Found ${playerInputs.length} player input fields`);
  playerInputs.forEach((input, index) => {
    const suggestionsElement = document.getElementById(`suggestions-${index + 1}`);
    if (suggestionsElement) {
      setupAutocomplete(input, suggestionsElement);
    } else {
      console.error(`Suggestions element not found for player ${index + 1}`);
    }
  });
}

function initializeApp() {
  console.log('Initializing app...');
  fetch('./PlayersNames1.csv')
    .then(response => {
      console.log(`CSV fetch response status: ${response.status}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.text();
    })
    .then(csvData => {
      console.log('CSV data received, starting parsing...');
      console.log('First 100 characters of CSV data:', csvData.substring(0, 100));
      Papa.parse(csvData, {
        complete: function(results) {
          console.log('Papa Parse complete. Rows parsed:', results.data.length);
          console.log('First row of parsed data:', JSON.stringify(results.data[0]));

          if (results.data.length > 0 && results.data[0].hasOwnProperty('Name')) {
            playerNames = [...new Set(results.data.map(row => row.Name).filter(name => name && name.trim() !== ''))];
          } else if (results.data.length > 0) {
            // Fallback: assume the first column contains names
            playerNames = [...new Set(results.data.map(row => Object.values(row)[0]).filter(name => name && name.trim() !== ''))];
          }

          console.log('CSV file successfully processed. Player names extracted:', playerNames.length);
          console.log('First 5 player names:', playerNames.slice(0, 5));

          if (playerNames.length === 0) {
            console.error('No player names were extracted from the CSV file.');
          }

          initializeAutocomplete();
        },
        header: true,
        skipEmptyLines: true,
        error: function(error) {
          console.error('Papa Parse error:', error);
        }
      });
    })
    .catch(error => {
      console.error('Error loading or parsing CSV file:', error);
      const errorMessage = document.createElement('div');
      errorMessage.textContent = 'Failed to load player names. Please try refreshing the page.';
      errorMessage.style.color = 'red';
      errorMessage.style.padding = '10px';
      document.body.insertBefore(errorMessage, document.body.firstChild);
    });
}

if (document.readyState === 'loading') {
  console.log('Document still loading, adding DOMContentLoaded listener');
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  console.log('Document already loaded, initializing app');
  initializeApp();
}

// Submit button click event handler
document.getElementById('submit').addEventListener('click', async () => {
  const players = Array.from(document.querySelectorAll('.player-name')).map(input => input.value).filter(name => name.trim() !== '');
  const pitchReport = document.getElementById('pitch-report').value;

  if (players.length !== 22) {
    showError('Please enter 22 player names.');
    return;
  }

  if (pitchReport.trim() === '') {
    showError('Please enter a pitch report.');
    return;
  }

  try {
    const response = await axios.post(`${API_BASE_URL}/api/suggest-team`, { players, pitchReport });
    displaySuggestedTeam(response.data);
  } catch (error) {
    console.error('Error suggesting team:', error);
    showError('An error occurred while suggesting the team. Please try again.');
  }
});

function showError(message) {
  const errorElement = document.getElementById('error-message');
  errorElement.textContent = message;
  errorElement.style.display = 'block';
}

function displaySuggestedTeam(data) {
  const resultElement = document.getElementById('suggested-team');
  resultElement.innerHTML = `
    <h2>Suggested Team</h2>
    <h3>Best Eleven:</h3>
    <ul>${data.bestEleven.map(player => `<li>${player.name}</li>`).join('')}</ul>
    <p>Captain: ${data.captain.name}</p>
    <p>Vice Captain: ${data.viceCaptain.name}</p>
  `;
  resultElement.style.display = 'block';
}
