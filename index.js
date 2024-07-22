const pup = require('puppeteer');
const readlineSync = require('readline-sync');

const url = "https://www.netshoes.com.br/";
const pesquisar = "tenis";

let c = 1;
const list = [];

(async () => {
    const browser = await pup.launch({headless: false});
    const page = await browser.newPage();
    //console.log('iniciei');

    await page.goto(url);
    await page.waitForSelector('#search');

    await page.type('#search', pesquisar);
    //console.log('fui para a url!');

    await Promise.all([
        page.waitForNavigation(),
        page.click('.search__button')
    ]);

    
    const pageNumber = readlineSync.question('Qual numero da pagina voce deseja coletar os dados? ');

    const pageUrl = `${url}busca?nsCat=Natural&q=${pesquisar}&page=${pageNumber}`;
    await page.goto(pageUrl);
    await page.waitForSelector('.pagination__page');

    const links = await page.$$eval('.card.double-columns.full-image > a', el => el.map(link => link.href));

    for (const link of links) {
        console.log('Produto: ', c);
        await page.goto(link);
        await page.waitForSelector('.product-name');
    
        const title = await page.$eval('.product-name', element => element.innerText);
        const price = await page.$eval('.saleInCents-value', element => element.innerText);
        const image = await page.$eval('div.swiper-wrapper span.swiper-slide-active img[src]', img => img.src);
        const desc = await page.$eval('.features--description', element => element.innerText);

        const obj = {
            title: title,  
            price: price,
            image: image,
            desc: desc
        };

        list.push(obj);
        c++;
    }
    
    console.log(list);

    await new Promise(resolve => setTimeout(resolve, 2000));
    await browser.close();
})();