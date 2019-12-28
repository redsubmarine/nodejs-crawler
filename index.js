const parse = require('csv-parse/lib/sync')
const fs = require('fs')
const puppeteer = require('puppeteer')
const stringify = require('csv-stringify/lib/sync')

const csv = fs.readFileSync('csv/data.csv')
const records = parse(csv.toString('utf-8'))

const crawler = async () => {
    const result = []
    const browser = await puppeteer.launch({ headless: process.env.NODE_ENV === 'production' })
    await Promise.all(records.map(async (r, i) => {
        const page = await browser.newPage()
        await page.goto(r[1])

        const text = await page.evaluate(() => {
            const score = document.querySelector('.score.score_left .star_score')
            if (score) {
                return score.textContent
            }
        })
        result[i] = [r[0], r[1], text.trim()]

        // const scoreEl = await page.$('.score.score_left .star_score')
        // if (scoreEl) {
        //     const text = await page.evaluate(tag => tag.textContent, scoreEl)
        //     result[i] = [r[0], r[1], text.trim()]
        // }

        await page.close()
    }))
    await browser.close()

    const str = stringify(result)
    fs.writeFileSync('csv/result.csv', str)

}

try {
    crawler()
} catch (e) {
    console.error(e)
}
console.log('started')