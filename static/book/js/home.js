const APP_ID = '84d8d287';
const APP_KEYS = '2ba545d70650fba893e600009c892bcb';
let submitButton = document.querySelector('#submit-button');
let inputArea = document.querySelector('#input-food');
let body = document.querySelector('body');
let section = document.querySelector('section');
let risultati = document.querySelector('.risultati');
let ricercato = document.getElementById('ricerca-titolo')
let overlay = document.querySelector('.overlay')
let loadingAnimation = document.createElement('div')
let statusMessage = document.querySelector('.status-message')
let ricercaTitolo = document.querySelector('#ricerca-titolo')

submitButton.addEventListener('click', async (e) => {
    e.preventDefault();
    let food = inputArea.value;
    if (!checkSearch(food)) {
        return;
    }
    cleanSearch();
    const BASE_URL = `https://api.edamam.com/api/recipes/v2?type=public&q=${food}&app_id=${APP_ID}&app_key=${APP_KEYS}`;
    await fetchData(BASE_URL);

    if (risultati.children.length === 0) {
        ricercato.textContent = "Non e' stato trovato nulla per \"" + food + "\"" + ' :c';
    }

    ricercaTitolo.scrollIntoView();
});

async function fetchData(url) {
    loader(true)
    try {
        const response = await fetch(url);
        const data = await response.json();
        const hits = await data.hits;
        console.log(data)
        await hits.forEach((foodItem) => {
            generateHtml(foodItem);
        })

        if (Object.keys(data._links).length === 0) {
            return;
        }

        const nextPage = data._links.next.href;
        window.onscroll = async () => {
            if (window.innerHeight + window.scrollY > document.documentElement.scrollHeight) {
                await fetchData(nextPage);
            }
        }
    }
    catch (error) {
        console.log(error.message);
    }
    loader(false)
}

function checkSearch(food) {
    let regexp = /[a-z]/ig;
    if (!regexp.test(food)) {
        ricercato.textContent = "Cercare un piatto!";
        return false;
    } else {
        ricercato.textContent = "Risultati per \"" + food + "\"";
        return true;
    }

}

function cleanSearch() {
    inputArea.value = '';
    let risultati = document.querySelector('.risultati');
    if (risultati.children.length > 1) {
        let risultato = document.querySelectorAll('.risultato')
        risultato.forEach(e => {
            e.remove();
        })
    }
}

function generateHtml(foodItem) {
    const url = new URL(`${foodItem.recipe.url}`);
    url.protocol;  // "http:"
    url.hostname;  // "aaa.bbb.ccc.com"
    url.pathname;  // "/asdf/asdf/sadf.aspx"
    url.search;    // "?blah"

    if (foodItem.recipe.image != null) {
        let generaHtml = `
        <img src=${foodItem.recipe.image} alt="">
        <h3>
            ${foodItem.recipe.label.length > 20 ? formatString(foodItem.recipe.label) : foodItem.recipe.label}
        </h3>
        <div class="dish-labels">
            <h5 class='cuisineType'>${foodItem.recipe.cuisineType[0].toUpperCase()}</h5>
            <h5 class='dishType'>${foodItem.recipe.dishType[0].toUpperCase()}</h5>
        </div>
        <p><strong>${foodItem.recipe.mealType[0].toUpperCase()}</strong></p>
        <p>
            ${foodItem.recipe.totalTime !== 0 ? '<i class="fa fa-clock-o" aria-hidden="true"></i> ' + foodItem.recipe.totalTime + ' minuti' : '<br>'}
        </p>
        <p class="description">
            ${foodItem.recipe.healthLabels[0]}, ${foodItem.recipe.healthLabels[1]}, ${foodItem.recipe.healthLabels[2]}.${foodItem.recipe.dietLabels.join(', ')}. 
        </p>
        <div class='main-buttons'>
            <button class="dettagli-piatto">Visualizza</button>
            <button class='like'>Aggiungi</i></button>
        </div>
        <div class="popup hidden">
            <h3>${foodItem.recipe.label}</h3>
            <div>
                <img src=${foodItem.recipe.image} alt=""></img>
            </div>
            <i class="fa fa-times close-button" aria-hidden="true"></i>
            <div class="details">
                <h5 class="ingredienti-btn">Ingredienti</h5>
                <h5 class="dettagli-btn">Dettagli</h5>
            </div>
            ${cycleSublist(foodItem.recipe, 'Ingredienti')}
            ${cycleSublist(foodItem.recipe, 'Dettagli')}
            <a href="${foodItem.recipe.url}" target="_blank">${url.hostname}</a>
        </div>`;
        let risultato = document.createElement('div');
        risultato.classList.add('risultato');
        risultato.innerHTML = generaHtml;
        risultati.appendChild(risultato);
    }
}

function formatString(text) {
    return text.substring(0, 20);
}

function loader(start) {
    if (start === true) {
        loadingAnimation.classList.add('home-loader')
        body.append(loadingAnimation)
    }
    if (start === false) {
        loadingAnimation.classList.remove('home-loader')
    }
}

function cycleSublist(recipe, title) {
    let list;
    let html;

    if (title === 'Dettagli') {
        list = recipe.totalDaily;
        html = `<div class="dettagli hidden"><p><strong>${title}</strong></p>${recipe.totalTime > 0 ? `<p>Tempo stimato: ${recipe.totalTime} minuti</p>` : '<p>Nessun tempo stimato.</p>'}<ul>`;
    } else if (title === 'Ingredienti') {
        list = recipe.ingredientLines;
        html = `<div class="ingredienti"><p><strong>${title}</strong></p><ul>`;
    }

    if (title === "Dettagli") {
        html += `
        <li> ${list.CA.label} ${list.CA.quantity.toFixed(1)}mg</li>
        <li>${list.CHOLE.label} ${list.CHOLE.quantity.toFixed(1)}mg</li>
        <li>${list.ENERC_KCAL.label} ${list.ENERC_KCAL.quantity.toFixed(1)}kcal</li>
        <li>${list.FAT.label} ${list.FAT.quantity.toFixed(1)}g</li>
        <li>${list.FE.label} ${list.FE.quantity.toFixed(1)}mg</li>
        <li>${list.FIBTG.label} ${list.FIBTG.quantity.toFixed(1)}g</li>
        <li>${list.K.label} ${list.K.quantity.toFixed(1)}g</li>
        <li>${list.PROCNT.label} ${list.PROCNT.quantity.toFixed(1)}g</li>
        <li>${list.MG.label} ${list.MG.quantity.toFixed(1)}g</li>
        `
    }
    
    if (title === "Ingredienti") {
        length = list.length;
        for (let i = 0; i < length; i++) {
            html += `<li>${list[i]}</li>`
        }
    }

    html += '</ul></div>'
    return html;
}

function loadBtns() {
    let overlay = document.querySelector('.overlay');
    section.addEventListener('click', (e) => {
        /*When user clicks the 'visualizza' button*/
        if (e.target.classList.contains('dettagli-piatto')) {
            let visualizza = e.target;
            let mainButtons = visualizza.parentElement;
            let risultato = mainButtons.parentElement;
            let popup = risultato.lastElementChild;
            let ingredienti = popup.children[4];
            let dettagli = popup.children[5];

            popup.classList.remove('hidden')
            overlay.classList.remove('hidden')
            body.style.overflowY = 'hidden';
            section.style.pointerEvents = 'none';
            setTimeout(() => { ingredienti.style.overflowY = 'scroll'; dettagli.style.overflowY = 'auto' }, 1000);
            popup.addEventListener('click', (e) => {
                let button = e.target;
                //When user clicks on 'ingredienti' button
                if (button.classList.contains('ingredienti-btn')) {
                    ingredienti.classList.remove('hidden');
                    dettagli.classList.add('hidden');
                    setTimeout(() => { ingredienti.style.overflowY = 'auto'; }, 0300);
                }
                //When user clicks on 'dettagli' button
                else if (button.classList.contains('dettagli-btn')) {
                    dettagli.classList.remove('hidden');
                    ingredienti.classList.add('hidden');
                    dettagli.style.display = 'block';
                    setTimeout(() => { dettagli.style.overflowY = 'auto'; }, 2000);
                }
            })

        }
        if (e.target.classList.contains('overlay')) {
            section.style.pointerEvents = 'all';
            overlay.classList.add('hidden')
            body.style.overflowY = 'scroll';
            let popups = document.querySelectorAll('.popup')
            popups.forEach((popup) => {
                popup.classList.add('hidden')
            })

        }
        /*When user clicks the close button*/
        if (e.target.classList.contains('close-button')) {
            let closeButton = e.target;
            let parent = closeButton.parentElement;
            body.style.overflowY = 'scroll';
            section.style.pointerEvents = 'all';
            overlay.classList.add('hidden')
            parent.classList.add('hidden');
        }

        //Save the content into the database
        if (e.target.classList.contains('like')) {
            console.log('clicked')
            let likeButton = e.target;
            let mainButtons = likeButton.parentElement;
            let risultato = mainButtons.parentElement;
            let popup = risultato.lastElementChild;
            let dettagli = popup.children[5]


            let mealType = risultato.children[3].textContent; //Data
            let recipeUrl = popup.lastElementChild.href; //Data
            let tempoStimato = dettagli.children[1].innerHTML; //Data
            let title = popup.children[0].textContent; //Data

            const csrftoken = getCookie('csrftoken');
            console.log(csrftoken);
            const url = document.getElementById('home-url').dataset.url;

            //Send data to the database
            fetch(url, {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-requested-With': 'XMLHttpRequest',
                    // 'X-CSRFToken': csrftoken,
                },
                body: JSON.stringify({
                    "title": title,
                    "recipeUrl": recipeUrl,
                    "mealType": mealType,
                    "tempoStimato": tempoStimato
                })
            }
            )
                .then((response) => {
                    //Convert the response from the view into json
                    return response.json();
                })
                .then((data) => {
                    //Perform actions with the response data from the view
                    statusMessage.classList.remove('hide')
                    statusMessage.style.animationPlayState = 'running'

                    if (data.success) {
                        statusMessage.classList.add('success')
                        statusMessage.addEventListener('animationend', () => {
                            statusMessage.classList.add('hide')
                            statusMessage.classList.remove('success')
                            statusMessage.style.animationPlayState = 'paused'
                        })
                        statusMessage.innerHTML = `${data.message}<i class="fa fa-check-circle" aria-hidden="true"></i>`;
                    }

                    if (!data.success) {
                        statusMessage.classList.add('unsuccess')
                        statusMessage.addEventListener('animationend', () => {
                            statusMessage.classList.add('hide')
                            statusMessage.classList.remove('unsuccess')
                            statusMessage.style.animationPlayState = 'paused'
                        })
                        statusMessage.innerHTML = `${data.message}<i class="fa fa-times-circle" aria-hidden="true"></i>`
                    }
                })
                .catch((error) => {
                    alert(error.message)
                })
        }
    })
}

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}


loadBtns();
fetchData(`https://api.edamam.com/api/recipes/v2?type=public&q=italian&app_id=${APP_ID}&app_key=${APP_KEYS}`);
