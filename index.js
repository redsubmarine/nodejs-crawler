const puppeteer = require('puppeteer')
const dotenv = require('dotenv')
dotenv.config()

const crawler = async () => {
    try {
        let browser = await puppeteer.launch({ headless: false,
            args: ['--window-size=1920,1080', '--disable-notifications'] })
        let page = await browser.newPage()

        await page.setViewport({
            width: 1080,
            height: 1080,
        })

        await page.goto('http://spys.one/free-proxy-list/KR')
        const proxies = await page.evaluate(() => {

            const ips = Array.from(document.querySelectorAll('tr > td:first-of-type > .spy14'))
                .map(v => v.textContent.replace(/document\.write\(.+\)/, ''))
            const types = Array.from(document.querySelectorAll('tr > td:nth-of-type(2)')).slice(5).map((v) => v.textContent)
            const latencies = Array.from(document.querySelectorAll('tr > td:nth-of-type(6) .spy1')).slice(5).map((v) => v.textContent)

            return ips.map((v, i) => {
                return {
                    ip: v,
                    type: types[i],
                    latency: latencies[i],
                }
            })
        })

        console.log(proxies)

        const filtered = proxies.filter(v => v.type.toLowerCase().startsWith('http')).sort((p, c) => p.latency - c.latency)
        console.log(filtered)

        await page.close()
        await browser.close()

        browser = await puppeteer.launch({
            headless: false,
            args: ['--window-size=1920,1080', '--disable-notifications', `--proxy-server=${filtered[0].ip}`],
        })
        page = await browser.newPage()
    } catch (e) {
        console.error(e)
    }
}

crawler()

console.log('started')