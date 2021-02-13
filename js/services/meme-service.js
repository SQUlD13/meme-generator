'use strict'

var gFilter = ''
var gImgs
var gUserImgs = []

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

var gMeme = createMeme()
var gMemes

// IMAGES
function getImageById(id) {
    return gImgs.find(img => img.id === id)
}
function getImgs() {
    if (!gFilter) return gImgs.concat(gUserImgs)
    else {
        var filtered = gImgs.filter(img => img.keywords.includes(gFilter))
        if (filtered.length > 0) return filtered
        return gImgs
    }
}
function getKeywords() {
    var words = []
    gImgs.forEach(img => {
        img.keywords.forEach(keyword => { if (!words.includes(keyword)) words.push(keyword) })
    });
    return words
}
function setFilter(filter) {
    console.log('setting filter to', filter)
    gFilter = filter.toLowerCase()
}
// MEMES
function updateMemeText(text) {
    gMeme.lines[gMeme.selectedLineIdx].text = text
}
function alignLine(alignment) {
    var currentAlignment = gMeme.lines[gMeme.selectedLineIdx].align
    if (currentAlignment === undefined) gMeme.lines[gMeme.selectedLineIdx].align = alignment
    else {
        console.log('currentAlignment', currentAlignment, 'alignment', alignment);
        if (currentAlignment === alignment) gMeme.lines[gMeme.selectedLineIdx].align = undefined
        else gMeme.lines[gMeme.selectedLineIdx].align = alignment
    }
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
function deleteMemeByID(id) {
    var deletedMeme = gMemes.splice(gMemes.findIndex(meme => meme.id === id), 1)
    saveDB()
    return deletedMeme
}
function getMeme() {
    return gMeme
}
function getMemes() {
    return gMemes
}

function createDB() {
    createMemes()
    createImgs()
    saveDB()
}
function saveDB() {
    saveToStorage(STORAGE_KEY, { memes: gMemes, imgs: gImgs })
}

function createMemes() {
    var db = loadFromStorage(STORAGE_KEY)
    var memes = (!db) ? [] : db.memes
    if (!memes || memes.length == 0) {
        gMeme = createMeme()
        gMemes = []
    } else gMemes = memes
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
function addMeme(data) {
    if (gMeme.selectedLineIdx >= 0 && gMeme.selectedImgId >= 0) {
        var meme = createMeme()
        meme.selectedImgId = gMeme.selectedImgId
        meme.selectedLineIdx = gMeme.selectedLineIdx
        meme.imgData = data
        gMemes.push(meme)
    }
}



function deleteImg(id) {
    var idx = gImgs.findIndex(img => img.id === id)
    gImgs.splice(idx, 1)
    saveDB()
}
function createImgs() {
    var db = loadFromStorage(STORAGE_KEY)
    var imgs = (!db) ? [] : db.imgs
    if (!imgs || imgs.length == 0) {
        gImgs = [
            { id: 1, url: 'src/img/meme/1.jpg', keywords: ['politics', 'no', 'trump'] },
            { id: 2, url: 'src/img/meme/2.jpg', keywords: ['aww', 'cute', 'dog'] },
            { id: 3, url: 'src/img/meme/3.jpg', keywords: ['aww', 'cute', 'dog', 'baby'] },
            { id: 4, url: 'src/img/meme/4.jpg', keywords: ['aww', 'cute', 'cat'] },
            { id: 5, url: 'src/img/meme/5.jpg', keywords: ['success', 'baby'] },
            { id: 6, url: 'src/img/meme/6.jpg', keywords: ['aliens', 'history'] },
            { id: 7, url: 'src/img/meme/7.jpg', keywords: ['aww', 'cute', 'surprised', 'baby'] },
            { id: 8, url: 'src/img/meme/8.jpg', keywords: ['willy wonka', 'chocolate factory', 'you dont say'] },
            { id: 9, url: 'src/img/meme/9.jpg', keywords: ['aww', 'cute', 'plotting', 'baby'] },
            { id: 10, url: 'src/img/meme/10.jpg', keywords: ['politics', 'laughing', 'obama'] },
            { id: 11, url: 'src/img/meme/11.jpg', keywords: ['suddenly gay'] },
            { id: 12, url: 'src/img/meme/12.jpg', keywords: ['what would you do'] },
            { id: 13, url: 'src/img/meme/13.jpg', keywords: ['leonardo dicaprio', 'salut', 'cheer'] },
            { id: 14, url: 'src/img/meme/14.jpg', keywords: ['matrix', 'morpheus'] },
            { id: 15, url: 'src/img/meme/15.jpg', keywords: ['one does not simply', 'lord of the rings'] },
            { id: 16, url: 'src/img/meme/16.jpg', keywords: ['piccard', 'star trek', 'laugning'] },
            { id: 17, url: 'src/img/meme/17.jpg', keywords: ['politics', 'putin'] },
            { id: 18, url: 'src/img/meme/18.jpg', keywords: ['everywhere', 'buzz', 'woody', 'toy story'] },
            { id: 19, url: 'src/img/meme/19.jpg', keywords: ['jersey shore', 'shock'] },
            { id: 20, url: 'src/img/meme/20.jpg', keywords: ['supposedly', 'austin powers'] },
            { id: 21, url: 'src/img/meme/21.jpg', keywords: ['dog', 'yoga', 'cute', 'stretching'] },
            { id: 22, url: 'src/img/meme/22.jpg', keywords: ['oprah', 'you get'] },
            { id: 23, url: 'src/img/meme/23.jpg', keywords: ['dancing', 'kid'] },
            { id: 24, url: 'src/img/meme/24.jpg', keywords: ['politics', 'trump'] },
        ]
    } else {
        gImgs = imgs
    }
}


function addUserImage(img, keywords = ['user created']) {
    var imgObj = {
        id: gImgs.length + 1,
        url: img.src,
        keywords: keywords,
        userImage: true
    }
    gImgs.push(imgObj)
    saveDB()
}

function loadImageFromInput(ev, addUserImage) {
    var reader = new FileReader()
    reader.onload = function (event) {
        var img = new Image()
        var addImageFunc = addUserImage.bind(null, img)
        img.onload = function () { addImageFunc(); renderImages() }
        img.src = event.target.result
        img.ratio = img.width / img.height
    }
    reader.readAsDataURL(ev.target.files[0])
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