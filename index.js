const xlsx = require('xlsx')
const axios = require('axios')      // ajax
const cheerio = require('cheerio')  // html parser

const workbook = xlsx.readFile('xlsx/data.xlsx')
const ws = workbook.Sheets.영화목록
ws['!ref'] = ws['!ref'].split(':')
    .map((v, i) => (i === 0) ? 'A2' : v)
    .join(':')

const records = xlsx.utils.sheet_to_json(ws, { header: 'A' })
// records.shift()


const crawler = async () => {
    await Promise.all(records.map( async (r) => {
        const response = await axios.get(r.B)
        if (response.status === 200) {
            const html = response.data

            const $ = cheerio.load(html)
            const text = $('.score.score_left .star_score').text()

            console.log(r.A, '평점', text.trim())
        }
    }))
}

crawler()
