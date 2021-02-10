'use strict'

const TOUCH_EVS = ['touchstart', 'touchmove', 'touchend']


var gElCanvas
var gCtx

var gIsDragging
var gLastPos

function onInit() {
    createMemes()
    renderImages()
    renderSavedImages()
    gElCanvas = document.getElementById('image-canvas');
    gCtx = gElCanvas.getContext('2d');

    addListeners()
    resizeCanvas()
}


//INPUTS
function onFontSizeChange(sizeDiff) {
    var line = getSelectedLine()
    line.size += sizeDiff
    drawCanvas()
}
function onVertLineMove(moveDiff) {
    var line = getSelectedLine()
    line.y += moveDiff
    drawCanvas()
    placeLineModal()
}
function onToggleLine() {
    var meme = getMeme()
    var nextIdx = (meme.selectedLineIdx === meme.lines.length - 1) ? 0 : meme.selectedLineIdx + 1
    meme.selectedLineIdx = nextIdx
    drawCanvas()
}
function onTextInput(elTextInput) {
    var text = elTextInput.value
    updateMemeText(text)
    drawCanvas()
}

//EVENTS
function onImgSelect(imgIdx) {
    setMemePicture(imgIdx)
    drawCanvas()
}
function onSave() {
    var imgData = gElCanvas.toDataURL("image/jpeg")
    addMeme(imgData)
    saveMemes()
    renderSavedImages()
}
function onDelete(ev, id) {
    ev.stopPropagation()
    var delMeme = deleteMemeByID(id)
    renderSavedImages()
}


// CANVAS
function placeLineModal() {
    var line = getSelectedLine()
    var elModal = document.querySelector('.line-modal')
    elModal.innerHTML = line.text
    elModal.style = ` left: ${gElCanvas.offsetLeft + line.x}px;top: calc( ${gElCanvas.offsetTop + line.y}px); font-family:${line.font};`
}
function setMemeToCanvas(id) {
    var meme = getMemeByID(id)
    setMeme(meme)
    drawCanvas()
}
function clearCanvas() {
    gCtx.clearRect(0, 0, gElCanvas.width, gElCanvas.height)
}
function resizeCanvas() {
    // const elContainer = document.querySelector('.canvas-container');
    // gElCanvas.width = elContainer.offsetWidth
    // gElCanvas.height = elContainer.offsetHeight
    var phoneScaling = window.matchMedia("(max-width:1120px)")
    if (phoneScaling.matches) {
        var size = 320
    } else size = 400
    gElCanvas.width = size; gElCanvas.height = size
}
function drawCanvas() {
    drawImage()
    drawText()
    placeLineModal()
}
function drawImage() {
    var meme = getMeme()
    var imgObj = getImageById(meme.selectedImgId)
    var img = new Image()
    img.src = imgObj.url
    gCtx.drawImage(img, 0, 0, gElCanvas.width, gElCanvas.height);
}
function drawText() {
    var meme = getMeme()
    meme.lines.forEach((undefined, idx) => {
        drawTextLine(idx)
    });
}
function drawTextLine(lineIdx) {
    var meme = getMeme()
    var line = meme.lines[lineIdx]
    var { outlineColor, outlineWidth, color, align } = line
    gCtx.lineWidth = outlineWidth
    gCtx.strokeStyle = outlineColor
    gCtx.fillStyle = color
    gCtx.textAlign = 'center'
    // gCtx.textBaseline = 'top'
    var fontStr = `${line.size}px ${line.font}`
    gCtx.font = fontStr
    var { text, x, y } = line
    gCtx.fillText(text, x, y)
    gCtx.strokeText(text, x, y)
}

//HTML RENDERING
function renderImages() {
    var elGallery = document.querySelector('.image-gallery')
    var imgs = getImgs()
    var strHTML = ''
    imgs.forEach(img => {
        strHTML += getImageHTML(img.id)
    });
    elGallery.innerHTML = strHTML
}
function getImageHTML(idx) {
    var imgObj = getImageById(idx)
    var strHTML = /*html*/ `<img class="meme-img" id="meme-${idx}" src="${imgObj.url}" alt="${imgObj.keywords[0]} meme"
    onclick="onImgSelect(${idx})">`
    return strHTML
}

function renderSavedImages() {
    var elGallery = document.querySelector('#saved-image-gallery')
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
    <div class="flex space-evenly">
         <button class="btn save-btn" onclick="onDownload(event,'${meme.id}')">Download</button>
         <button class="btn del-btn" onclick="onDelete(event,'${meme.id}')">Delete</button>
     </div>
    </div>`

    return strHTML
}

function getEvPos(ev) {
    var pos = {
        x: ev.offsetX,
        y: ev.offsetY
    }
    if (TOUCH_EVS.includes(ev.type)) {
        ev.preventDefault()
        ev = ev.changedTouches[0]
        pos = {
            x: ev.pageX - ev.target.offsetLeft - ev.target.clientLeft,
            y: ev.pageY - ev.target.offsetTop - ev.target.clientTop
        }
    }
    return pos
}

function addListeners() {
    addMouseListeners()
    //addTouchListeners()
    window.addEventListener('resize', () => {
        //resizeCanvas()
        //clearCanvas()
        placeLineModal()
    })
}
function addMouseListeners() {
    var elModal = document.querySelector('.line-modal')
    elModal.addEventListener('mousemove', onMove)
    elModal.addEventListener('mousedown', onDown)
    elModal.addEventListener('mouseup', onUp)
}

function addTouchListeners() {
    var elModal = document.querySelector('.line-modal')
    elModal.addEventListener('touchmove', onMove)
    elModal.addEventListener('touchstart', onDown)
    elModal.addEventListener('touchend', onUp)
}

function onDown(ev) {
    const pos = getEvPos(ev)
    gLastPos = pos;
    if (gIsDragging) return
    var elModal = ev.target
    gIsDragging = true
    console.log('Beginning drag!')
}

function onMove(ev) {
    if (gIsDragging) {
        const pos = getEvPos(ev)

        gLastPos = pos
    }
}

function onUp() {
    gIsDragging = false
}