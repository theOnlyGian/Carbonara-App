let nav = document.querySelector('.nav')
let prevScroll = window.scrollY
let scrollTop = document.querySelector('.scroll-to-top')

scrollTop.addEventListener('click', (e)=>{
    window.scrollTo(0, 0)
})

window.addEventListener('scroll', (e) => {
    let currentScroll = window.scrollY
    let documentMaxHeight = document.documentElement.scrollHeight;

    if (currentScroll > prevScroll) {
        nav.classList.remove('active')
        if (currentScroll > (documentMaxHeight/3)) {
            scrollTop.classList.remove('hide')
        }
    } else {
        nav.classList.add('active')
        if (currentScroll < (documentMaxHeight / 3)) {
            scrollTop.classList.add('hide')
        }
    }
    prevScroll = currentScroll;
})
