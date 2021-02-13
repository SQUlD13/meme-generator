'use strict'

const TOUCH_EVS = ['touchstart', 'touchmove', 'touchend']

var gAspectRatio = 1
var gElCanvas
var gCtx

var gIsDragging
var gLastPos

var gIsInlineEditingLine = false
var gElTextInput
var gKeyboardInputs = ''

var gKeywords
var gIsSearching = false
var gCapitalize = false
var gElSearchBarInput

function onInit() {
    createDB()
    renderImages()
    renderSavedImages()
    gElCanvas = document.getElementById('image-canvas');
    gElTextInput = document.getElementById('text-input')
    gElSearchBarInput = document.getElementById('search-bar')
    gCtx = gElCanvas.getContext('2d');
    addListeners()
    resizeCanvas()
    gKeywords = getKeywords()
}


//EDITORINPUTS
function onFontChange(elSwitch) {
    getSelectedLine().font = elSwitch.value
    drawCanvas()
}
function onFontSizeChange(elFontSlider) {
    var label = document.querySelector('label[for="font-size"] span')
    label.innerHTML = elFontSlider.value
    getSelectedLine().size = elFontSlider.value
    drawCanvas()
}
function onBorderSizeChange(elBorderSlider) {
    var label = document.querySelector('label[for="border-size"] span')
    label.innerHTML = elBorderSlider.value
    getSelectedLine().outlineWidth = elBorderSlider.value
    drawCanvas()
}
function onTextAlignment(alignmentStr) {
    alignLine(alignmentStr)
    drawCanvas()
    renderAlignmentBtns()
    placeLineModal()
}
function onToggleLine() {
    var meme = getMeme()
    var nextIdx = (meme.selectedLineIdx === meme.lines.length - 1) ? 0 : meme.selectedLineIdx + 1
    meme.selectedLineIdx = nextIdx
    drawCanvas()
    renderAlignmentBtns()
}
function onTextInput(elTextInput) {
    var text = elTextInput.value
    gKeyboardInputs = elTextInput.value
    updateMemeText(text)
    drawCanvas()
}
function updateTextInput(ev) {
    const regex = /^[a-zA-Z{1}]$/
    if (gIsInlineEditingLine) {
        console.log("🚀 ~ file: index-controller.js ~ line 84 ~ updateTextInput ~ gCapitalize", ev.keyCode)
        if (ev.keyCode === 8) {
            if (gKeyboardInputs) gKeyboardInputs = gKeyboardInputs.slice(0, gKeyboardInputs.length - 1);
            else {
                gElTextInput.value = ''
                drawCanvas()
            }
        }
        else if (ev.keyCode === 32) { ev.preventDefault(); gKeyboardInputs += ' ' }
        else if (ev.key.match(regex)) {
            if (gCapitalize) {
                console.log('adding capitalized letter')
                gKeyboardInputs += ev.key.toUpperCase()
            }
            else { gKeyboardInputs += ev.key }
        }
        else if (ev.keyCode === 16) {
            console.log('shift pressed')
            gCapitalize = true;
            return
        }
        else return
        gElTextInput.value = gKeyboardInputs
        updateMemeText(gKeyboardInputs)
        drawCanvas()
    }
}
function onTextColorChange(elColorInput) {
    var line = getSelectedLine()
    line.color = elColorInput.value
    drawCanvas()
}
function onBorderColorChange(elColorInput) {
    var line = getSelectedLine()
    line.outlineColor = elColorInput.value
    drawCanvas()
}

//EVENTS
function onFileUploadClick(ev) {
    console.log('clicking thing!')
    ev.preventDefault()
    ev.stopPropagation()
    var elInput = document.getElementById('file-input')
    elInput.click()
}
function onFileUpload(ev, elInput) {
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
function onDown(ev) {
    const pos = getEvPos(ev)
    if (gIsDragging) return
    var line = findClickedLine(ev)
    if (line) {
        gLastPos = pos
        gIsDragging = true
    }
}
function onMove(ev) {
    if (gIsDragging) {
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
function onImgDelete(imgId) {
    deleteImg(imgId)
    renderImages()
}
function onImgSelect(imgId) {
    setMemePicture(imgId)
    var meme = getMeme()
    if (meme.lines.length > 0) showLineModal()
    gIsInlineEditingLine = true
    drawCanvas()
    toggleEditor()
    renderAlignmentBtns()
    placeLineModal();
    window.location.href = '#header'
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
    saveDB()
    renderSavedImages()
}
function onDeleteMeme(ev, id) {
    ev.stopPropagation()
    var delMeme = deleteMemeByID(id)
    renderSavedImages()
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
    toggleEditor()
    drawCanvas()
    window.location.href = '#header'
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
    drawMeme(meme)
    drawText(meme)
    if (meme.lines.length > 0) placeLineModal()
}
function drawMeme(meme) {
    var imgObj = getImageById(meme.selectedImgId)
    var img = new Image()
    img.src = imgObj.url
    img.ratio = img.width / img.height
    resizeCanvas(img.ratio)
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
    if (outlineWidth > 0) {
        gCtx.lineWidth = outlineWidth
        gCtx.strokeText(text, x, y)
    }
}
function placeLineModal() {
    var line = getSelectedLine()
    var elModal = document.querySelector('.line-modal')
    elModal.children[0].innerHTML = line.text
    var ratio = gElCanvas.width / gElCanvas.height
    var left = gElCanvas.offsetLeft + (line.x * gElCanvas.width)
    var right = gElCanvas.offsetTop + (line.y * gElCanvas.width * (1 / ratio))


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
function renderAlignmentBtns() {
    var line = getSelectedLine()
    switch (line.align) {
        case 'left':
            var selectedAlignment = 0
            break
        case 'center':
            var selectedAlignment = 1
            break
        case 'right':
            var selectedAlignment = 2
            break
    }
    var buttons = document.querySelector('.alignment-control-group').children
    for (let i = 0; i < 3; i++) {
        if (selectedAlignment === i) buttons[i].classList.add('active')
        else buttons[i].classList.remove('active')
    }

}

function renderImages() {
    var elGallery = document.getElementById('image-gallery')
    var imgs = getImgs()
    var strHTML = ''
    imgs.forEach(img => {
        strHTML += getImageHTML(img.id)
    });
    elGallery.innerHTML = strHTML
}
function getImageHTML(idx) {
    var imgObj = getImageById(idx)
    if (imgObj.userImage) {
        var strHTML = /*html*/`<div class="img-container">
        <div class="img-modal flex column space-evenly align-center">
        <button class="btn img-btn"  onclick="onImgDelete(${idx})">Delete</button>
        <button class="btn img-btn"  onclick="onImgSelect(${idx})">Open</button>
        </div>
        <img class="meme-img" id="meme-${idx}" src="${imgObj.url}" alt="${imgObj.keywords[0]} meme">
    </div>`
    } else {
        strHTML = `<img class="meme-img" id="meme-${idx}" src="${imgObj.url}" alt="${imgObj.keywords[0]} meme" onclick="onImgSelect(${idx})"></img>`
    }
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
    <a href="${meme.imgData}" download="meme - ${meme.id}">
         <button class="btn save-btn")">Download</button>
    </a>
         <button class="btn del-btn" onclick="onDeleteMeme(event,'${meme.id}')">Delete</button>
     </div>
    </div>`

    return strHTML
}

//OTHER
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
            gElTextInput.value = line.text
            gKeyboardInputs = line.text
            gIsInlineEditingLine = true
            elText.innerHTML = textContent
            setMemeSelectedLine(i)
            return line
        }
    }
    gIsInlineEditingLine = false
    elText.innerHTML = textContent
    return false
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
    addSearchBarListeners()
    addEditorListeners()
    window.addEventListener('resize', () => {
        if (document.body.classList.contains('editor')) {
            resizeCanvas()
            drawCanvas()
            placeLineModal()
        }
    })

}
function addEditorListeners() {
    gElTextInput.addEventListener('focusin', () => gIsInlineEditingLine = false)
    window.addEventListener('keydown', updateTextInput)
    window.addEventListener('keyup', (ev) => {
        if (ev.keyCode === 16) gCapitalize = false
    })

}
function addSearchBarListeners() {
    gElSearchBarInput.addEventListener('click', toggleSearch)
    document.body.addEventListener('click', closeSearch)
}
function addMouseListeners() {
    gElCanvas.addEventListener('mousemove', onMove)
    gElCanvas.addEventListener('mousedown', onDown)
    gElCanvas.addEventListener('mouseup', onUp)
    gElCanvas.addEventListener('mouseout', () => gIsDragging = false)
}
// function addTouchListeners() {
//     gElCanvas.addEventListener('touchmove', onMove)
//     gElCanvas.addEventListener('touchstart', onDown)
//     gElCanvas.addEventListener('touchend', onUp)
// }
