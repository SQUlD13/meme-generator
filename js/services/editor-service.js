'use strict'

var gAspectRatio = 1

var gIsDragging
var gLastPos


const DEFAULT_LINES = [{
    text: 'Enter Text Here',
    size: 40,
    align: undefined,
    color: 'white',
    outline: true,
    outlineWidth: 2,
    outlineColor: 'black',
    font: 'Impact',
    x: 0.5,
    y: 0.2,
},
{
    text: 'Enter Text Here',
    size: 40,
    align: undefined,
    color: 'white',
    outline: true,
    outlineWidth: 2,
    outlineColor: 'black',
    font: 'Impact',
    x: 0.5,
    y: 0.9,
}]

var gMeme = createMeme()
var gMemes

var gPadding = 15

function getEvPos(ev) {
    var pos = {
        x: ev.offsetX / gElCanvas.width,
        y: ev.offsetY / gElCanvas.height
    }
    if (TOUCH_EVS.includes(ev.type)) {
        ev.preventDefault()
        ev = ev.changedTouches[0]
        var rect = gElCanvas.getBoundingClientRect()
        pos = {
            x: (ev.pageX - rect.x) / gElCanvas.width,
            y: (ev.pageY - rect.y) / gElCanvas.height
        }
    }
    return pos
}
function getSelectedLine() {
    return gMeme.lines[gMeme.selectedLineIdx]
}
function findClickedLine(pos, ctx) {
    var meme = getMeme()
    for (let i = 0; i < meme.lines.length; i++) {
        var line = meme.lines[i]
        ctx.font = `${line.size}px ${line.font}`
        var textMetrics = ctx.measureText(line.text).width
        var width = (textMetrics + gPadding * 2) / gElCanvas.width
        var startY = line.y - (line.size + gPadding) / gElCanvas.height
        var endY = line.y + (gPadding) / gElCanvas.height
        if (pos.x > line.x - (width / 2) && pos.x < line.x + (width / 2) && pos.y > startY && pos.y < endY) {
            gMeme.selectedLineIdx = i
            return line
        }
    }
    return false
}
function getAlignedX(line, ctx) {
    if (!line.align) return line.x
    if (line.align) {
        var width = (ctx.measureText(line.text, line.font, line.size).width) / gElCanvas.width
        switch (line.align) {
            case 'right':
                var x = 1 - width / 2
                break
            case 'left':
                x = width / 2
                break
            case 'center':
                x = 0.5
                break
        }
        line.x = x
        return x
    }
}
function getMemeByID(id) {
    return gMemes.find(meme => meme.id === id)
}
function getMeme() {
    return gMeme
}
function getMemes() {
    return gMemes
}
function alignLine(alignment) {
    var currentAlignment = gMeme.lines[gMeme.selectedLineIdx].align
    if (currentAlignment === undefined) gMeme.lines[gMeme.selectedLineIdx].align = alignment
    else {
        if (currentAlignment === alignment) gMeme.lines[gMeme.selectedLineIdx].align = undefined
        else gMeme.lines[gMeme.selectedLineIdx].align = alignment
    }
}
function updateMemeText(text, ctx) {
    var selectedLine = gMeme.lines[gMeme.selectedLineIdx]
    selectedLine.text = text
    if (selectedLine.align === 'left' || selectedLine.align === 'right') { selectedLine.x = getAlignedX(selectedLine, ctx) }
}
function updateLineLocation(lineIdx, x, y) {
    gMeme.lines[lineIdx].x = x; gMeme.lines[lineIdx].y = y;
}
function deleteSelectedLine() {
    gMeme.lines.splice(gMeme.selectedLineIdx, 1)
}
function setMemePicture(id) {
    gMeme.selectedImgId = id
    gMeme.selectedLineIdx = 0
}
function setMemeSelectedLine(lineIdx) {
    gMeme.selectedLineIdx = lineIdx
}
function setMeme(meme) {
    gMeme = meme
}
function deleteMemeByID(id) {
    var deletedMeme = gMemes.splice(gMemes.findIndex(meme => meme.id === id), 1)
    saveDB()
    return deletedMeme
}
function createMemes() {
    var db = loadFromStorage(STORAGE_KEY)
    var memes = (!db) ? [] : db.memes
    if (!memes || memes.length == 0) {
        gMeme = createMeme()
        gMemes = []
    } else gMemes = memes
}
function createMeme() {
    var lines = []
    DEFAULT_LINES.forEach(line => {
        lines.push(Object.create(line))
    });
    var meme = {
        id: createId(),
        selectedLineIdx: -1,
        selectedImgId: 0,
        lines: lines
    }
    gMeme = meme
    return meme
}
function addMeme(data) {
    if (gMeme.selectedLineIdx >= 0 && gMeme.selectedImgId >= 0) {
        gMeme.imgData = data
        gMemes.push(gMeme)
    }
}
