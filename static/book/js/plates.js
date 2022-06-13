//Document variables
const APP_ID = '36fe944a';
const APP_KEYS = '300852e26afe9a26fb7addbed6ef3ee4';
let containerPlates = document.querySelector(".risultati-wrapper")
let header = document.querySelector('header')
let ricercaTitolo = document.querySelector('#ricerca-titolo')
let url = document.querySelector('#plates-url').dataset.url;
let overlay = document.querySelector('.overlay')
let loadingAnimation = document.createElement('div')
let body = document.querySelector('body');
let textStatus = document.querySelector("#ricerca-titolo")

//Getting data from db
async function fetchData() {
    loader(true)
    let response = await fetch(url, {
        method: 'GET',
        credentials: 'same-origin',
        headers: {
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
        }
    })
    let data = await response.json();
    if (data.length === 0) {
        textStatus.innerHTML = 'Non hai nessun piatto preferito :c'
    }
    if (data.length !== 0) {
        generateHtml(data)
    }
    loader(false)
}

async function generateHtml(data) {
    for (let i = 0; i < data.length; i++) {
        
        //Declarations of variables
        let div = document.createElement('div');
        let textDiv = document.createElement('div');
        let mainButtons = document.createElement('div')
        let visualizza = document.createElement('a');
        let recipeUrl = data[i].recipeUrl;
        let title = data[i].title;
        let tempoStimato = data[i].tempoStimato;
        let mealType = data[i].mealType;
        let food = encodeURIComponent(title);
        const response = await fetch(`https://api.edamam.com/api/recipes/v2?type=public&q=${food}&app_id=${APP_ID}&app_key=${APP_KEYS}`);
        const convertedData = await response.json();
        let imageUrl = convertedData.hits[0].recipe.image;
        let img = document.createElement('img');
        let titleElement = document.createElement('h3');
        let mealTypeElement = document.createElement('p');
        let tempoStimatoElement = document.createElement('p');
        let rimuoviBtn = document.createElement("button"); 

        img.src = imageUrl;
        titleElement.innerText = title;
        tempoStimatoElement.innerText = tempoStimato;
        mealTypeElement.innerText = mealType;

        //Classes
        div.classList.add('favourite');
        visualizza.classList.add('dettagli-piatto');
        textDiv.classList.add('favourite-text');
        rimuoviBtn.classList.add('dettagli-piatto');
        mainButtons.classList.add('main-buttons')

        //Styling overriding
        rimuoviBtn.innerHTML = "Rimuovi"
        visualizza.href = `${recipeUrl}`;
        visualizza.innerHTML = 'Visita il sito'
        visualizza.style.textAlign = 'center'
        visualizza.style.display = 'flex'
        visualizza.style.alignItems = 'center'
        visualizza.style.justifyContent = 'center'
        visualizza.target = '_blank'

        //Appending
        mainButtons.append(visualizza)
        mainButtons.append(rimuoviBtn)
        textDiv.append(titleElement);
        textDiv.append(mealTypeElement);
        textDiv.append(tempoStimatoElement);
        div.append(img);
        div.append(textDiv);
        div.append(mainButtons)
        containerPlates.append(div);
        //Updating status
        if (data.length !== 1) {
            textStatus.innerHTML = `Hai ${data.length} piatti preferiti`;
        } else {
            textStatus.innerHTML = `Hai ${data.length} piatto preferito`;
        }

        rimuoviBtn.addEventListener('click', (e) => {
            const csrftoken = getCookie('csrftoken')
            fetch(url, {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    'X-requested-With': 'XMLHttpRequest',
                    /* "X-CSRFToken": csrftoken, */
                },
                body: JSON.stringify({ "removeItem": title })
            })
                .then((response) => {
                    return response.json();
                })
                .then((data) => {
                    div.style.animationPlayState = 'running';
                    div.addEventListener('animationend', () => {
                        div.remove();
                    })
                    if (data.platesCount > 1) {
                        textStatus.innerHTML = `Hai ${data.platesCount} piatti preferiti!`;
                    } else if (data.platesCount === 1) {
                        textStatus.innerHTML = `Hai ${data.platesCount} piatto preferito!`;
                    } else {
                        textStatus.innerHTML = 'Non hai nessun piatto preferito :c';
                    }
                })
        })

    }
}

function loader(start) {
    if (start === true) {
        overlay.classList.remove('hidden')
        loadingAnimation.classList.add('plates-loader')
        body.append(loadingAnimation)
    }
    if (start === false) {
        overlay.classList.add('hidden')
        loadingAnimation.classList.remove('plates-loader')
    }
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
fetchData()