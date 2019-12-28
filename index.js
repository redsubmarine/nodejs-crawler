const xlsx = require('xlsx')
const puppeteer = require('puppeteer')
const add_to_sheet = require('./add_to_sheet')

const workbook = xlsx.readFile('xlsx/data.xlsx')
const ws = workbook.Sheets.영화목록
const records = xlsx.utils.sheet_to_json(ws)

const crawler = async () => {
    const browser = await puppeteer.launch({ headless: process.env.NODE_ENV === 'production' })
    const page = await browser.newPage()
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_2) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.4 Safari/605.1.15')

    add_to_sheet(ws, 'C1', 's', '평점')

    for (const [i, r] of records.entries()) {
        await page.goto(r.링크)

        const text = await page.evaluate(() => {
            const score = document.querySelector('.score.score_left .star_score')
            if (score) {
                return score.textContent
            }
        })
        if (text) {
            console.log(r.제목, '평점', text.trim())
            const newCell = `C${i + 2}`
            add_to_sheet(ws, newCell, 'n', parseFloat(text.trim()))
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