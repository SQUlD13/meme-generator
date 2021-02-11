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
    document.querySelector('.line-modal').fontSize = line.size
    drawCanvas()
}
function onTextAlignment(alignmentStr) {
    alignLine(alignmentStr)
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
function onDeleteLine() {
    deleteSelectedLine()
    var meme = getMeme()
    if (meme.lines.length > 0) setMemeSelectedLine(0)
    else hideLineModal()
    drawCanvas()
}
function onAddLine() {
    var line = {
        x: 0.5,
        y: 0.5,
        text: 'Enter text here',
        size: 40,
        align: undefined,
        color: 'white',
        outline: true,
        outlineWidth: 2,
        outlineColor: 'black',
        font: 'Impact'
    }
    var meme = getMeme()
    meme.lines.push(line)
    setMemeSelectedLine(meme.lines.length - 1)
    drawCanvas()
    showLineModal()
}
function onImgSelect(imgIdx) {
    setMemePicture(imgIdx)
    var meme = getMeme()
    if (meme.lines.length > 0) showLineModal()
    drawCanvas()
    toggleEditor()
    placeLineModal();
}
function onDownload(ev, memeId) {
    var a = document.createElement('a')
    var meme = getMemeByID(memeId)
    a.href = meme.imgData
    a.download = `${memeId}.png`
    a.click()
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

function onDown(ev) {
    const pos = getEvPos(ev)
    if (gIsDragging) return
    var line = findClickedLine(ev)
    if (line) {
        console.log('clicked in line', line)
        gLastPos = pos
        gIsDragging = true
    }
}
function findClickedLine(ev) {
    var meme = getMeme()
    var elText = document.querySelector('.line-modal-content')
    var textContent = elText.innerHTML
    const pos = getEvPos(ev)
    for (let i = 0; i < meme.lines.length; i++) {
        var line = meme.lines[i]
        elText.innerHTML = line.text
        var rect = elText.getBoundingClientRect()
        var halfRectWidth = (rect.width / gElCanvas.width) / 2
        if (pos.x > line.x - halfRectWidth && pos.x < line.x + halfRectWidth && pos.y < line.y && pos.y > line.y - (line.size / gElCanvas.height)) {
            elText.innerHTML = textContent
            setMemeSelectedLine(i)
            return line
        }
    }
    elText.innerHTML = textContent
    return false
}

function onMove(ev) {
    if (gIsDragging) {
        console.log('dragging')
        const pos = getEvPos(ev)
        var { x, y } = pos
        var line = getSelectedLine()
        if (line.align === undefined) {
            var dX = (x - gLastPos.x)
        } else {
            dX = 0;
        }
        var dX = (x - gLastPos.x)
        var dY = (y - gLastPos.y)
        line.x += dX; line.y += dY;
        drawCanvas()
        placeLineModal()
        gLastPos = pos
    }
}

function onUp() {
    if (gIsDragging) gIsDragging = false
}

// CANVAS
function showLineModal() {
    var elModal = document.querySelector('.line-modal')
    elModal.classList.remove('hidden')
}
function hideLineModal() {
    var elModal = document.querySelector('.line-modal')
    elModal.classList.add('hidden')
}
function setMemeToCanvas(id) {
    var meme = getMemeByID(id)
    setMeme(meme)
    drawCanvas()
}
function clearCanvas() {
    gCtx.clearRect(0, 0, gElCanvas.width, gElCanvas.height)
}
function resizeCanvas(ratio = 1) {
    var mediumScaling = window.matchMedia("(max-width:1280px)")
    var smallScaling = window.matchMedia("(max-width:620px)")
    if (smallScaling.matches) {
        var width = 320
    } else if (mediumScaling.matches) {
        var width = 620
    } else width = 800

    gElCanvas.width = width; gElCanvas.height = width / ratio
}
function drawCanvas() {
    var meme = getMeme()
    drawImage(meme)
    drawText(meme)
    if (meme.lines.length > 0) placeLineModal()
}
function drawImage(meme) {
    var imgObj = getImageById(meme.selectedImgId)
    var img = new Image()
    img.src = imgObj.url
    gCtx.drawImage(img, 0, 0, gElCanvas.width, gElCanvas.height);
}

// LINES
function drawText(meme) {
    meme.lines.forEach((undefined, idx) => {
        drawTextLine(meme, idx)
    });
}
function drawTextLine(meme, lineIdx) {
    var line = meme.lines[lineIdx]
    var { outlineColor, outlineWidth, color, align } = line
    gCtx.lineWidth = outlineWidth
    gCtx.strokeStyle = outlineColor
    gCtx.textAlign = 'center'
    gCtx.fillStyle = color
    var fontStr = `${line.size}px ${line.font}`
    gCtx.font = fontStr

    var { text, x, y } = line

    x = getAlignedX(line)

    x *= gElCanvas.width
    y *= gElCanvas.height
    gCtx.fillText(text, x, y)
    gCtx.strokeText(text, x, y)
}
function placeLineModal() {
    var line = getSelectedLine()
    var elModal = document.querySelector('.line-modal')
    elModal.children[0].innerHTML = line.text

    var left = gElCanvas.offsetLeft + (line.x * gElCanvas.width)
    var right = gElCanvas.offsetTop + (line.y * gElCanvas.width)


    elModal.style = ` left: ${left}px;top: calc( ${right}px); font-family:${line.font}; font-size:${line.size}px;`
}

function getAlignedX(line) {
    if (!line.align) return line.x
    if (line.align) {
        var elText = document.querySelector('.line-modal-content')
        var text = elText.innerHTML
        elText.innerHTML = line.text
        var rect = elText.getBoundingClientRect()
        var rectWidth = (rect.width / gElCanvas.width)

        switch (line.align) {
            case 'right':
                var x = 1 - rectWidth / 2
                break
            case 'left':
                x = rectWidth / 2
                break
            case 'center':
                x = 0.5
                break
        }

        elText.innerHTML = text
        line.x = x
        return x
    }
}

//HTML & RENDERING
function toggleEditor() {
    document.body.classList.toggle('editor')
}
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
    console.log("🚀 ~ file: index-controller.js ~ line 209 ~ getSavedMemeHTML ~ meme", meme)

    var strHTML = /*html*/ `<div class="saved-image" onclick="setMemeToCanvas('${meme.id}')">
    <img class="meme-img" src="${meme.imgData}" alt="saved meme">
    <div class="flex space-evenly">
    <a href="${meme.imgData}" download="meme - ${meme.id}">
         <button class="btn save-btn")">Download</button>
    </a>
         <button class="btn del-btn" onclick="onDelete(event,'${meme.id}')">Delete</button>
     </div>
    </div>`

    return strHTML
}

//OTHER
function getEvPos(ev) {
    var pos = {
        x: ev.offsetX / gElCanvas.width,
        y: ev.offsetY / gElCanvas.height
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
        resizeCanvas()
        drawCanvas()
        placeLineModal()
    })
}
function addMouseListeners() {
    gElCanvas.addEventListener('mousemove', onMove)
    gElCanvas.addEventListener('mousedown', onDown)
    gElCanvas.addEventListener('mouseup', onUp)
}
function addTouchListeners() {
    gElCanvas.addEventListener('touchmove', onMove)
    gElCanvas.addEventListener('touchstart', onDown)
    gElCanvas.addEventListener('touchend', onUp)
}
