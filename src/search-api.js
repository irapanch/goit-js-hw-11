import axios from 'axios'; // імпорт бібліотеки запитів на сервер

const BASE_URL = 'https://pixabay.com/api/';
const form = document.querySelector('.search-form'); // змінна форми введення даних від користувача

async function getImages(page) { // функція отримання данних з серверу
  const params = new URLSearchParams({  // об'єкт для створення параметрів запиту
    key: '39011501-5171506c9db8b64cf4fbb065c',
    page,
    per_page: 40,

    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: true,
  });

  params.set('q', form.elements.searchQuery.value); // аргумент q встановлюється як значення введеного пошукового запиту з форми

  const response = await axios.get(`${BASE_URL}?${params}`); // об'єкт, що містить результати запиту
  return response; // виводимо результати запиту
}

export { getImages, form }; // експортуємо функцію й змінну
