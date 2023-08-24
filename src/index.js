

import SimpleLightbox from 'simplelightbox'; // імпорт бібліотеки для модального вікна
import 'simplelightbox/dist/simple-lightbox.min.css'; // імпорт бібліотеки для модального вікна
import { Notify } from 'notiflix/build/notiflix-notify-aio'; // імпорт бібліотеки для алерту
import { getImages, form } from './search-api'; // імпорт функції й змінної

const gallery = document.querySelector('.gallery'); // змінна списку зображень
const loadBtn = document.querySelector('.load-more'); // змінна кнопки прокрутки
const btnSearch = document.querySelector('.search-form button'); // змінна кнопки пошуку

let page = 0;
let per_page = 40;
let totalPage = 1;
let lightbox;
form.addEventListener('input', onFormInput); // прослуховувач на поле інпуту
form.addEventListener('submit', onFormSubmit); // прослуховувач на кнопку пошуку
loadBtn.addEventListener('click', onClickLoadBtn); //прослуховувач на кнопку прокрутки

function renderGallery(array) {
  // функція створення розмітки галереї
  const galleryList = array
    .map(
      // перебор масиву й створення html на основі отриманих параметрів з серверу
      ({
        webformatURL,
        largeImageURL,

        likes,
        views,
        comments,
        downloads,
        tags,
      }) =>
        `<div class="photo-card">
        <a href=${largeImageURL}>
        <img src="${webformatURL}" alt="${tags}" loading="lazy" width="300" height="200" />
        </a>
        <div class="info">
          <p class="info-item">
            <b> Likes </b>
            ${likes}
          </p>
          <p class="info-item">
            <b>Views </b>
            ${views}
          </p>
          <p class="info-item">
            <b>Comments </b>
            ${comments}
          </p>
          <p class="info-item">
            <b>Downloads </b>
            ${downloads}
          </p>
        </div>
      </div>`
    )
    .join(''); // об'єднання елементів
  gallery.insertAdjacentHTML('beforeend', galleryList); // додавання створеної розмітки елем до списку зображень
  lightbox.refresh(); //  реініціалізація лайтбоксу
}

btnSearch.disabled = true; // вимкнення  можливості натискання кнопки  пошуку

loadBtn.classList.add('is-hidden'); // кнопка прокрутки захована

function onFormInput(event) {
  // виконується, коли відбувається введення в поле форми.
  event.preventDefault(); // скидання базових налаштувань
  loadBtn.classList.add('is-hidden'); // приховуємо кнопку прокрутки
  btnSearch.disabled = true;
  const userInput = event.target.value.trim(); // отримує значення, введене в поле форми. Потім, за допомогою методу trim(), вона видаляє зайві пробіли зі значення.

  if (userInput.trim() !== '') {
    btnSearch.disabled = false; //  кнопка пошуку активна, якщо поле інпуту не порожнє
  }
}





async function onClickLoadBtn() { // виконується при кліку на кнопку прокрутки
  page++; // збільшує значення змінної page на одиницю
  if (page === totalPage) {
    loadBtn.classList.add('is-hidden'); // якщо page дорівнює totalPage, то додаємо клас "is-hidden" до елементу loadBtn 

    Notify.info(  // і викликаємо сповіщення, що немає зображень, що відповідають запиту.
      `Sorry, there are no images matching your search query. Please try again.`,
      {
        position: 'right-top',
        timeout: 2000,
      }
    );
  }
  try {
    const respData = await getImages(page);  // виконується асинхронний запит до getImages з передачею значення page
    renderGallery(respData.data.hits);  //  функція  рендерить галерею на основі отриманих даних
    const { height: cardHeight } =
      gallery.firstElementChild.getBoundingClientRect(); //плавне прокручування сторінки після запиту і відтворення кожної наступної групи зображень

    window.scrollBy({  
      top: cardHeight * 2,
      behavior: 'smooth',
    });
  } catch (error) {
    Notify.failure(`Oops, something went wrong`);
  }
}



function onFormSubmit(event) {  //виконується при відправленні форми

  event.preventDefault(); // скидання базових налаштувань
  page = 1; //задаємо початкову сторінку для отримання зображень.
  lightbox = new SimpleLightbox('.gallery a', { // створюємо новий об'єкт SimpleLightbox для всіх посиланнь всередині списку зображень
    captionsData: 'alt',
    navText: ['&#11013;', '&#10145;'],
  });
  loadBtn.classList.add('is-hidden'); // спочатку приховуємо кнопку прокрутки

  getImages(page) // викликаємо функцію, яка запитує зображення з сервера з вказаною сторінкою.
    .then(respData => {  //цей блок коду виконується після успішного отримання відповіді від сервера
      totalPage = Math.ceil(respData.data.totalHits / per_page); // розрахунок кількості сторінок
      renderGallery(respData.data.hits); // відображення галереї зображень  перевірка кількості знайдених зображень
      if (respData.data.total === 0) { // перевірка кількості знайдених зображень. Якщо бекенд повертає порожній масив, значить нічого підходящого не було знайдено
        Notify.failure(
          `Sorry, there are no images matching your search query. Please try again.`,  // У такому разі показується повідомлення
          {
            position: 'left-top',
            timeout: 2000,
          }
        );
      }
      if (respData.data.totalHits > 0) {  // перевірка кількості знайдених зображень.
        Notify.info(`Hooray! We found ${respData.data.totalHits} images.`, { // виведення повідомлення з кількістю знайдених зображень
          timeout: 5000,
        });
        if (respData.data.totalHits < 40) {  // перевірка кількості знайдених зображень.
          loadBtn.classList.add('is-hidden'); // приховуємо кнопку прокрутки
        } else {
          loadBtn.classList.remove('is-hidden');// або показуємо кнопку прокрутки
        }
      }
    })
    .catch(error => Notify.failure(`Oops, something went wrong`)); //  цей блок коду виконується, якщо виникає помилка під час запиту. Сповіщення про помилку

  gallery.innerHTML = ''; // видаляє вміст елементу відображення галереї зображень
  lightbox.refresh(); //  реініціалізація лайтбоксу

}


























// =================================================================
// async function onFormSubmit(event) {  //виконується при відправленні форми

//   event.preventDefault(); // скидання базових налаштувань
//   page = 1; //задаємо початкову сторінку для отримання зображень.
//   lightbox = new SimpleLightbox('.gallery a', { // створюємо новий об'єкт SimpleLightbox для всіх посиланнь всередині списку зображень
//     captionsData: 'alt',
//     navText: ['&#11013;', '&#10145;'],
//   });
//     loadBtn.classList.add('is-hidden'); // спочатку приховуємо кнопку прокрутки
//     try {
//         const respData = await getImages(page); // викликаємо функцію, яка запитує зображення з сервера з вказаною сторінкою.
 
//       //цей блок коду виконується після успішного отримання відповіді від сервера
//       totalPage = Math.ceil(respData.data.totalHits / per_page); // розрахунок кількості сторінок
//       renderImageGallery(respData.data.hits); // відображення галереї зображень  перевірка кількості знайдених зображень
//       if (respData.data.total === 0) { // перевірка кількості знайдених зображень. Якщо бекенд повертає порожній масив, значить нічого підходящого не було знайдено 
//         Notify.failure( 
//           `Sorry, there are no images matching your search query. Please try again.`,  // У такому разі показується повідомлення
//           {
//             position: 'left-top',
//             timeout: 2000,
//           }
//         );
//       }
//       if (respData.data.totalHits > 0) {  // перевірка кількості знайдених зображень. 
//         Notify.info(`Hooray! We found ${respData.data.totalHits} images.`, { // виведення повідомлення з кількістю знайдених зображень
//           timeout: 5000,
//         });
//         if (respData.data.totalHits < 40) {  // перевірка кількості знайдених зображень. 
//           loadBtn.classList.add('is-hidden'); // приховуємо кнопку прокрутки
//         } else {
//           loadBtn.classList.remove('is-hidden');// або показуємо кнопку прокрутки
//           }
//         }
        
//     } catch (error) {
//         Notify.failure(`Oops, something went wrong`); //  цей блок коду виконується, якщо виникає помилка під час запиту. Сповіщення про помилку
        
//     } 
//     gallery.innerHTML = ''; // видаляє вміст елементу відображення галереї зображень
//   lightbox.refresh(); //  реініціалізація лайтбоксу
// }


