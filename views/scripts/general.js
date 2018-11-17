const readMore = document.getElementById('read-more')
const more = document.getElementById('more')

function clickReadMore(){
    readMore.style.display = 'none'
    more.style.display = 'unset'
}

readMore.addEventListener('click',clickReadMore)