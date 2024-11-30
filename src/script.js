'use strict';

const btn = document.querySelector('.btn-country');
const countriesContainer = document.querySelector('.countries');

const displayCountry = function (data, className = '') {
  const currencies = data.currencies;
  const currencyName = Object.values(currencies)[0].name;

  const language = data.languages;
  const languages = Object.values(language)[0];
  const html = `
    <article data-text="" class="country ${className}">
      <img class="country__img" src="${data.flags.svg}" />
      <div class="country__data">
        <h3 class="country__name">${data.name.common}</h3>
        <h4 class="country__region">${data.region}</h4>
        <p class="country__row"><span>👨‍👩‍👧‍👦</span>${(+data.population / 1000000).toFixed(1)} миллионов</p>
        <p class="country__row"><span>🗣️</span>${languages}</p>
        <p class="country__row"><span>💰</span>${currencyName}</p>
      </div>
    </article>
  `;

  countriesContainer.insertAdjacentHTML('beforeend', html);
  countriesContainer.style.opacity = 1;
};

const displayError = function (message) {
  countriesContainer.insertAdjacentText('beforeend', message);
  countriesContainer.style.opacity = 1;
};

const getUserPosition = function () {
  return new Promise(function (resolve, reject) {
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
};

const getCountryData = async function () {
  try {
    const userPosition = await getUserPosition();

    const { latitude: lat, longitude: lng } = userPosition.coords;
    const geocodingResponse = await fetch(`https://geocode.xyz/${lat},${lng}?geoit=json`);
    if (!geocodingResponse.ok) throw new Error('Проблема с извлечением местопложения!');
    const geocodingData = await geocodingResponse.json();

    const response = await fetch(`https://restcountries.com/v3.1/name/${geocodingData.country.toLowerCase()}?geoit=json`);
    if (!response.ok) throw new Error('Проблема с извлечением местопложения!');
    const data = await response.json();
    displayCountry(data[0]);

    const fetchNeighbourCountriesPromises = data[0].borders.map(async (neighbour) => {
      const response = await fetch(`https://restcountries.com/v3.1/alpha/${neighbour}?geoit=json`);
      const countryData = await response.json();
      return countryData[0];
    });

    const neighbourCountries = await Promise.all(fetchNeighbourCountriesPromises);

    neighbourCountries.forEach(country => {
      displayCountry(country, 'neighbour');
    });

    return `Вы в ${geocodingData.city} , ${geocodingData.country}`;
  } catch (error) {
    console.error(`${error} кек`);
    displayError(`Что то пошло не так ${error.message}`);
    throw error;
  }
};

btn.addEventListener('click', (e) => {
  console.log(`1 Получаем местоположение`);
  (async function () {
    try {
      const countryData = await getCountryData();
      const country = document.querySelector('.country');
      if (country) {
        country.setAttribute('data-text', `${countryData}`);
      }
      console.log(`2 ${countryData}`);
    } catch (error) {
      setTimeout(() => location.reload(),1500)
      console.error(`2 ${error.message}`);
    }

    console.log('3 Получили местоположение');
  })();
});


