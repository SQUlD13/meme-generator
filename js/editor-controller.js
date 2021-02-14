'use strict'


var gElCanvas
var gElTextInput
var gCtx

function onInitEditor() {
    gElCanvas = document.getElementById('image-canvas')
    gElTextInput = document.getElementById('text-input')
    gCtx = gElCanvas.getContext('2d');
    resizeCanvas()
    addMouseListeners()
    addTouchListeners()
}




//EDITORINPUTS
function onTextInput(elTextInput) {
    var text = elTextInput.value
    document.querySelector('.line-modal').children[0].innerHTML = elTextInput.value
    updateMemeText(text, gCtx)
    drawCanvas()
}
function onToggleLine() {
    var meme = getMeme()
    var nextIdx = (meme.selectedLineIdx === meme.lines.length - 1) ? 0 : meme.selectedLineIdx + 1
    meme.selectedLineIdx = nextIdx
    drawCanvas()
    renderEditor()
    gElTextInput.focus()
}
function onAddLine() {
    var line = {
        x: 0.5,
        y: 0.5,
        text: 'Enter Text Here',
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
function onDeleteLine() {
    deleteSelectedLine()
    var meme = getMeme()
    if (meme.lines.length > 0) setMemeSelectedLine(0)
    else hideLineModal()
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
function onFontChange(elSwitch) {
    getSelectedLine().font = elSwitch.value
    drawCanvas()
}



//DOWNLOAD/SAVE
function onEditorDownload(elDownloadLink) {
    var meme = getMeme()
    elDownloadLink.href = gElCanvas.toDataURL()
    elDownloadLink.download = `meme - ${meme.id}`
}
function onSave() {
    var imgData = gElCanvas.toDataURL("image/jpeg")
    addMeme(imgData)
    document.body.classList.add('saved-memes')
    saveDB()
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
    text = (text === '') ? 'Enter text here' : text
    x = getAlignedX(line, gCtx)

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
    var top = gElCanvas.offsetTop + (line.y * gElCanvas.width * (1 / ratio))
    elModal.style = ` left: ${left}px; top:${top}px; font-family:${line.font}; font-size:${line.size}px;`
}

//MOUSE\TOUCH EVENTS
function onDown(ev) {
    gElTextInput.focus()

    var pos = getEvPos(ev)
    if (gIsDragging) return
    var line = findClickedLine(pos, gCtx)

    if (line) {
        gLastPos = pos
        gIsDragging = true
        placeLineModal()
        renderEditor()
        gElTextInput.value = line.text
    }
    ev.preventDefault()

    //setTimeout(() => gElTextInput.focus(), 0)
}
function onMove(ev) {
    var pos = getEvPos(ev)
    if (gIsDragging) {
        gElTextInput.focus()
        var { x, y } = pos
        var line = getSelectedLine()
        if (line.align === undefined) {
            var dX = (x - gLastPos.x)
        } else {
            dX = 0;
        }
        var dX = (x - gLastPos.x)
        var dY = (y - gLastPos.y)
        if (line.x + dX > 0 && line.x + dX < 1 && line.y + dY > 0 && line.y + dY < 1) {
            line.x += dX; line.y += dY;
            drawCanvas()
            placeLineModal()
            gLastPos = pos
        }

    }
}
function onUp() {
    if (gIsDragging) gIsDragging = false
}
//RENDERING
function renderEditor() {
    var line = getSelectedLine()
    gElTextInput.value = line.text
    document.getElementById('font-size').value = line.size
    document.querySelector('[for="font-size"] span').innerHTML = line.size
    document.querySelector('[for="border-size"] span').innerHTML = line.outlineWidth
    document.getElementById('font-family').value = line.font
    renderAlignmentBtns()
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


function addMouseListeners() {
    gElCanvas.addEventListener('mousemove', onMove)
    gElCanvas.addEventListener('mousedown', onDown)
    gElCanvas.addEventListener('mouseup', onUp)
}
function addTouchListeners() {
    gElCanvas.addEventListener('touchmove', onMove)
    gElCanvas.addEventListener('touchstart', onDown)
    gElCanvas.addEventListener('touchend', onUp)
    gElCanvas.addEventListener('touchcancel', () => gIsDragging = false)
}

//SHADOW REALM - DONT LOOKEY HERE EH?

// function updateTextInput(ev) {
//     const regex = /^[a-zA-Z{1}]$/
//     if (gIsInlineEditingLine) {
//         if (ev.keyCode === 8) {
//             if (gKeyboardInputs) gKeyboardInputs = gKeyboardInputs.slice(0, gKeyboardInputs.length - 1);
//             else {
//                 gElTextInput.value = ''
//                 drawCanvas()
//             }
//         }
//         else if (ev.keyCode === 32) { ev.preventDefault(); gKeyboardInputs += ' ' }
//         else if (ev.key.match(regex)) {
//             if (gCapitalize) {
//                 gKeyboardInputs += ev.key.toUpperCase()
//             }
//             else { gKeyboardInputs += ev.key }
//         }
//         else if (ev.keyCode === 16) {
//             gCapitalize = true;
//             return
//         }
//         else return
//         gElTextInput.value = gKeyboardInputs
//         updateMemeText(gKeyboardInputs)
//         drawCanvas()
//     }
// }


