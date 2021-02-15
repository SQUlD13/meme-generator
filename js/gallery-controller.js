'use strict'

const TOUCH_EVS = ['touchstart', 'touchmove', 'touchend']


var gKeywords
var gIsSearching = false
var gElSearchBarInput

function onInitGallery() {
    createDB()
    renderImages()
    renderSavedImages()
    gElSearchBarInput = document.getElementById('search-bar')

    addListeners()
    gKeywords = getKeywords()
}

//EVENTS
function toggleSavedMemes() {
    document.body.classList.toggle('saved-memes')
}
function onFileUploadClick(ev) {
    ev.preventDefault()
    ev.stopPropagation()
    var elInput = document.getElementById('file-input')
    elInput.click()
}
function onFileUpload(ev) {
    ev.preventDefault()
    ev.stopPropagation()
    loadImageFromInput(ev, addUserImage)
}

function onSearchSubmit(ev) {
    ev.preventDefault()
    var filter = document.getElementById('search-bar').value
    setFilter(filter)
    renderImages()
}
function onSearch(elSearchBar) {
    if (gIsSearching) {
        var input = elSearchBar.value
        renderSuggestions(input)
    }
}

function onImgDelete(imgId) {
    deleteImg(imgId)
    renderImages()
}
function onImgSelect(imgId) {
    var meme = getMeme()
    meme = createMeme()
    setMemePicture(imgId)
    if (meme.lines.length > 0) showLineModal()
    drawCanvas()
    toggleEditor()
    renderEditor()
    window.location.href = '#header'
}
function onDeleteMeme(ev, id) {
    ev.stopPropagation()
    var delMeme = deleteMemeByID(id)
    renderSavedImages()
}


//HTML & RENDERING
function renderSuggestions(input = '') {
    var elAutocom = document.querySelector('.autocom-box')
    var strHTML = '<ul>'
    if (input !== '') var suggestions = gKeywords.filter(word => word.toLowerCase().startsWith(input.toLowerCase()))
    else suggestions = gKeywords
    suggestions.forEach(suggestion => strHTML += `<li><p onclick="setFilter('${suggestion}'); renderImages(); clearSearch()">${suggestion}</p></li>`)
    strHTML += '</ul>'
    elAutocom.innerHTML = strHTML;
}
function clearSearch() {
    document.getElementById('search-bar').value = ''
}
function renderImages() {
    var elGallery = document.getElementById('image-gallery')
    var imgs = getImgs()
    var strHTML = ''
    imgs.forEach(img => {
        strHTML += getImageHTML(img.id)
    });
    elGallery.innerHTML = strHTML
    assignAspectRatioClasses()
}
function getImageHTML(idx) {
    var imgObj = getImageById(idx)
    var DeleteBtn = /*html*/`<button class="btn img-btn img-del-btn"  onclick="onImgDelete(${idx})">Delete</button>`
    var strHTML = /*html*/`<div class="img-container">
        <div class="img-modal flex column align-center space-evenly" onclick="toggleImageModal(this)">
        <button class="btn img-btn img-open-btn"  onclick="onImgSelect(${idx})">Open</button>`
    if (imgObj.userImage) {
        strHTML += DeleteBtn
    }
    strHTML += /*html*/`</div>
        <img class="meme-img" id="meme-${idx}" src="${imgObj.url}" alt="${imgObj.keywords[0]} meme">
    </div>`
    return strHTML
}
function renderSavedImages() {
    var elGallery = document.querySelector('#saved-memes')
    var memes = getMemes()
    var strHTML = ''
    memes.forEach(meme => {
        strHTML += getSavedMemeHTML(meme)
    });
    elGallery.innerHTML = strHTML
}
function getSavedMemeHTML(meme) {
    var strHTML = /*html*/ `<div class="saved-image" onclick="setMemeToCanvas('${meme.id}')">
    <img class="meme-img" src="${meme.imgData}" alt="saved meme">
    <div class="flex space-evenly align-center">
    <a href="${meme.imgData}" download="meme - ${meme.id}" onclick="event.stopPropagation()">
         <button class="btn save-btn">Download</button>
    </a>
         <button class="btn del-btn" onclick="onDeleteMeme(event,'${meme.id}')">Delete</button>
     </div>
    </div>`

    return strHTML
}

//OTHER
function assignAspectRatioClasses() {
    var imgs = document.querySelectorAll('.meme-img')
    imgs.forEach((img) => {
        if (Math.abs(img.naturalWidth - img.naturalHeight) < 20) return
        else if (img.naturalWidth - img.naturalHeight < 0) img.parentElement.classList.add('portrait')
        else img.parentElement.classList.add('landscape')
    })
}

//LISTENERS
function addListeners() {
    addSearchBarListeners()
    //addEditorListeners()
    window.addEventListener('resize', () => {
        if (document.body.classList.contains('editor')) {
            resizeCanvas()
            drawCanvas()
            placeLineModal()
        }
    })

}

function addSearchBarListeners() {
    gElSearchBarInput.addEventListener('click', toggleSearch)
    document.body.addEventListener('click', closeSearch)
}

//DOM Manipulation
function toggleImageModal(elImageModal) {
    if (elImageModal.classList.contains('active')) { elImageModal.classList.remove('active'); return }
    closeImageModals()
    elImageModal.classList.toggle('active')
}
function closeImageModals() {
    var modals = document.querySelectorAll('.img-modal')
    modals.forEach(modal => {
        modal.classList.remove('active')
    });
}
function toggleEditor() {
    document.body.classList.toggle('editor')
}
function toggleSearch(ev) {
    ev.stopPropagation()
    gElSearchBarInput.readOnly = !gElSearchBarInput.readOnly
    gIsSearching = !gIsSearching
    document.querySelector('.search').classList.toggle('active')
    renderSuggestions()
}
function closeSearch() {
    gElSearchBarInput.readOnly = true
    gIsSearching = false
    document.querySelector('.search').classList.remove('active')
    renderSuggestions()
    clearSearch()
}
