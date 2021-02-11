'use strict'

var gImgs = [
    { id: 1, url: 'src/img/meme-square/1.jpg', keywords: ['politics', 'no', 'trump'] },
    { id: 2, url: 'src/img/meme-square/2.jpg', keywords: ['aww', 'cute', 'dog'] },
    { id: 3, url: 'src/img/meme-square/3.jpg', keywords: ['aww', 'cute', 'dog', 'baby'] },
    { id: 4, url: 'src/img/meme-square/4.jpg', keywords: ['aww', 'cute', 'cat'] },
    { id: 5, url: 'src/img/meme-square/5.jpg', keywords: ['success', 'baby'] },
    { id: 6, url: 'src/img/meme-square/6.jpg', keywords: ['aliens', 'history'] },
    { id: 7, url: 'src/img/meme-square/7.jpg', keywords: ['aww', 'cute', 'surprised', 'baby'] },
    { id: 8, url: 'src/img/meme-square/8.jpg', keywords: ['willy', 'wonka', 'chocolate', 'factory', 'you', 'dont', 'say'] },
    { id: 9, url: 'src/img/meme-square/9.jpg', keywords: ['aww', 'cute', 'plotting', 'baby'] },
    { id: 10, url: 'src/img/meme-square/10.jpg', keywords: ['politics', 'laughing', , 'obama'] },
    { id: 11, url: 'src/img/meme-square/11.jpg', keywords: ['suddenly', 'gay'] },
    { id: 12, url: 'src/img/meme-square/12.jpg', keywords: ['what', 'would', 'you', 'do'] },
    { id: 13, url: 'src/img/meme-square/13.jpg', keywords: ['leonardo', 'dicaprio', 'di', 'caprio', 'salut', 'cheer'] },
    { id: 14, url: 'src/img/meme-square/14.jpg', keywords: ['matrix', 'morpheus'] },
    { id: 15, url: 'src/img/meme-square/15.jpg', keywords: ['one', 'does', 'not', 'simply', 'lord', 'of', 'the', 'rings'] },
    { id: 16, url: 'src/img/meme-square/16.jpg', keywords: ['piccard', 'star', 'trek', 'laugning'] },
    { id: 17, url: 'src/img/meme-square/17.jpg', keywords: ['politics', 'putin'] },
    { id: 18, url: 'src/img/meme-square/18.jpg', keywords: ['everywhere', 'buzz', 'woody', 'toy', 'story'] },
]

const DEFAULT_LINES = [{
    text: 'Enter text here',
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
    text: 'Enter text here',
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
const STORAGE_KEY = 'memesDB'

// IMAGES
function getImageById(id) {
    return gImgs.find(img => img.id === id)
}
function getImgs() {
    return gImgs
}
// MEMES

var gMeme = createMeme()
var gMemes

function updateMemeText(text) {
    gMeme.lines[gMeme.selectedLineIdx].text = text
}
function alignLine(alignment) {
    gMeme.lines[gMeme.selectedLineIdx].align = alignment
}
function updateLineLocation(lineIdx, x, y) {
    gMeme.lines[lineIdx].x = x; gMeme.lines[lineIdx].y = y;
}
function getSelectedLine() {
    return gMeme.lines[gMeme.selectedLineIdx]
}
function deleteSelectedLine() {
    gMeme.lines.splice(gMeme.selectedLineIdx, 1)
}

function setMemeSelectedLine(lineIdx) {
    gMeme.selectedLineIdx = lineIdx
}
function setMemePicture(id) {
    gMeme.selectedImgId = id
    gMeme.selectedLineIdx = 0
}
function setMeme(meme) {
    gMeme = meme
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


function deleteMemeByID(id) {
    var deletedMeme = gMemes.splice(gMemes.findIndex(meme => meme.id === id), 1)
    saveMemes()
    return deletedMeme
}
function addMeme(data) {
    if (gMeme.selectedLineIdx >= 0 && gMeme.selectedImgId >= 0) {
        var meme = createMeme()
        meme.selectedImgId = gMeme.selectedImgId
        meme.selectedLineIdx = gMeme.selectedLineIdx
        meme.imgData = data
        gMemes.push(meme)
    }
}
function createMemes() {
    var memes = loadFromStorage(STORAGE_KEY)
    if (!memes || memes.length == 0) {
        gMeme = createMeme()
        gMemes = []
    } else gMemes = memes
    saveMemes()
}
function createMeme(lines = []) {
    var meme = {
        id: createId(),
        selectedLineIdx: -1,
        selectedImgId: 0,
        lines: DEFAULT_LINES.slice(0)
    }
    return meme
}


function saveMemes() {
    saveToStorage(STORAGE_KEY, gMemes)
}