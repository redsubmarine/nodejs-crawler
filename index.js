const puppeteer = require('puppeteer')
const axios = require('axios')
const fs = require('fs')

const crawler = async () => {
    try {
        const browser = await puppeteer.launch({ headless: false })
        const page = await browser.newPage()

        await page.goto('https://unsplash.com')
        const result = await page.evaluate(() => {
            let imgs = []
            const imgEls = document.querySelectorAll('.nDTlD')
            if (imgEls.length) {
                imgEls.forEach((v) => {
                    let src = v.querySelector('img._2zEKz').src
                    imgs.push(src)
                    v.parentElement.removeChild(v)
                })
            }
            window.scrollBy(0, 300)
            return imgs.filter((url) => url.length)
        })
        console.log(result)

        await page.waitForSelector('.nDTlD')
        console.log('새이미지들 대기 완료')
    } catch (e) {
        console.error(e)
    }
}

crawler()

console.log('started')