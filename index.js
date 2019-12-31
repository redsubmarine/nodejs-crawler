const puppeteer = require('puppeteer')
const axios = require('axios')
const fs = require('fs')

fs.readdir('imgs', (err) => {
    if (err) {
        console.error('not found imgs folder')
        fs.mkdirSync('imgs')
    }
})

const crawler = async () => {
    try {
        const browser = await puppeteer.launch({ headless: false })
        const page = await browser.newPage()

        await page.goto('https://unsplash.com')
        let result = []
        while (result.length <= 30) {
            let srcs = await page.evaluate(() => {
                window.scrollTo(0, 0)
                let imgs = []
                const imgEls = document.querySelectorAll('figure')
                if (imgEls.length) {
                    imgEls.forEach((v) => {
                        let src = v.querySelector('img._2zEKz').src
                        imgs.push(src)
                        v.parentElement.removeChild(v)
                    })
                }
                window.scrollBy(0, 100)
                setTimeout(() => {
                    window.scrollBy(0, 200)
                }, 500)
                return imgs.filter((url) => url.length)
            })
            result = result.concat(srcs)

            await page.waitForSelector('figure')
            console.log('새이미지들 대기 완료')
        }

        console.log(result)
        await page.close()
        await browser.close()

        for (const src of result) {
            console.log(' -', src)
            const imgResult = await axios.get(src/*.replace(/\?.*$/, '')*/, {
                responseType: 'arraybuffer',
            })
            fs.writeFileSync(`imgs/${new Date().valueOf()}.jpeg`, imgResult.data)
        }

        console.log('끝')
    } catch (e) {
        console.error(e)
    }
}

crawler()

console.log('started')