const xlsx = require('xlsx')
const puppeteer = require('puppeteer')
const axios = require('axios')
const fs = require('fs')
const add_to_sheet = require('./add_to_sheet')

const workbook = xlsx.readFile('xlsx/data.xlsx')
const ws = workbook.Sheets.영화목록
const records = xlsx.utils.sheet_to_json(ws)

fs.readdir('screenshot', (err) => {
    if (err) {
        console.error(('make screenshot folder.'))
        fs.mkdirSync('screenshot')
    }
})

fs.readdir('poster', (err) => {
    if (err) {
        console.error(('make poster folder.'))
        fs.mkdirSync('poster')
    }
})

const crawler = async () => {
    const browser = await puppeteer.launch({
        headless: process.env.NODE_ENV === 'production',
        args: ['--window-size=1920,1080'],
    })
    const page = await browser.newPage()
    await page.setViewport({
        width: 1920,
        height: 1080,
    })
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_2) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.4 Safari/605.1.15')

    add_to_sheet(ws, 'C1', 's', '평점')

    for (const [i, r] of records.entries()) {
        await page.goto(r.링크)

        const result = await page.evaluate(() => {
            const scoreEl = document.querySelector('.score.score_left .star_score')
            let score = ''
            if (scoreEl) {
                score = scoreEl.textContent
            }
            const imgEl = document.querySelector('.poster img')
            let img = ''
            if (imgEl) {
                img = imgEl.src
            }
            return { score, img }
        })
        if (result.score) {
            console.log(r.제목, '평점', result.score.trim())
            const newCell = `C${i + 2}`
            add_to_sheet(ws, newCell, 'n', parseFloat(result.score.trim()))
        }
        if (result.img) {
            const buffer = await page.screenshot({
                path: `screenshot/${r.제목}.png`,
                fullPage: true,
                // clip: {
                //     x: 100,
                //     y: 100,
                //     width: 300,
                //     height: 300,
                // }
            })
            // fs.writeFileSync(`screenshot/${r.제목}.jpg`, buffer)
            const imgResult = await axios.get(result.img.replace(/\?.*$/, ''), {
                responseType: 'arraybuffer',
            })
            fs.writeFileSync(`poster/${r.제목}.jpg`, imgResult.data)
        }

        await page.waitFor(1000)
    }
    await page.close()
    await browser.close()

    xlsx.writeFile(workbook, 'xlsx/result.xlsx')
}

try {
    crawler()
} catch (e) {
    console.error(e)
}
console.log('started')