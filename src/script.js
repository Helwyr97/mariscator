const {axios, shell} = window.require

const mariscos = [
    'Almeja Babosa',
    'Almeja Fina',
    'Almeja Japónica',
    'Berberecho',
    'Bogavante',
    'Buey',
    'Camarón',
    'Centolla',
    'Cigala',
    'Erizo',
    'Escupiña',
    'Langosta',
    'Mejillón',
    'Navaja',
    'Ostra',
    'Percebe',
    'Vieira',
    'Volandeira'
];

const pages = [
    {
        name: 'O Percebeiro', 
        img: "https://opercebeiro.com/image/cache/Logos/O-percebeiro-de-galicia-a-tu-mesa-web-164x100.png",
        url: "https://opercebeiro.com",
        search_url: 'https://opercebeiro.com/productos?limit=100'
    },
    {
        name: 'Sal y Laurel', 
        img: "https://cdn.shopify.com/s/files/1/0893/5548/t/10/assets/header_logo.png?v=12696013601386166186",
        url: "https://salylaurel.es",
        search_url: 'https://salylaurel.es/collections/marisco'
    }
];

const data = [];
let selectedData = [];

let searchs = 0;

const main = document.querySelector("main");
const loader = document.querySelector(".loader");
const resultsTable = document.querySelector("div#resultsTable");

function alpha(a,b) {
    return a.toLowerCase().localeCompare(b.toLowerCase());
}

function fillMariscos() {
    let select = document.querySelector('#selectMariscos');
    select.append(new Option("Marisco",null));

    for (const el of mariscos) {
        let option = new Option(el, el);
        select.append(option);
    }
}

function processData(name,html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html,'text/html');
    switch (name) {
        case 'O Percebeiro':
            processDataPer(doc);
            break;
        case 'Sal y Laurel':
            processDataSal(doc);
            break;
        default:
            break;
    }
}

function processDataPer(doc) {
    const nodes = doc.querySelectorAll(".product-details");
    for (const node of nodes) {
        let name = node.querySelector(".caption .name a").innerText.split("El Kg")[0].toLowerCase().trim();
        let price;
        let link = node.querySelector(".caption .name a").href;
        if (node.querySelector(".caption .price .price-new")) {
            price = node.querySelector(".caption .price .price-new").innerText;
        } else {
            price = node.querySelector(".caption .price").innerText;
        }
        price = price.split(" Sin Iva")[0].replace("\n","");
        data.push({name,price,link,page: 0});
    }
}

function processDataSal(doc) {
    const nodes = doc.querySelectorAll("section.product-item-info");
    for (const node of nodes) {
        let name = node.querySelector("a").innerText.toLowerCase();
        let units = node.querySelector(".product-unit").innerText.replace(/\n/g, '').replace('            ','');
        name += units;
        let link = "https://salylaurel.com"+node.querySelector("a").href.replace("file://","");
        let price;
        if (node.querySelector(".price.new-price.money")) {
            price = node.querySelector(".price.new-price.money").innerText;
        } else {
            price = node.querySelector(".price.money").innerText;
        }
        data.push({name,price,link,page: 1})
    }
}


async function searchData() {
    searchs = 0;
    for (const page of pages) {
        try {
            const html = (await axios.get(page.search_url)).data;
            searchs++;
            processData(page.name,html);
        } catch(err) {
            alert("Network Error");
            break;
        }
    }
    if (searchs==2)
        showMain()
    else
        setTimeout(searchData,1000)
}

function showMain() {
        main.style.display='block';
        hideLoader();
}

function showLoader() {
    loader.style.display='block';
}

function hideLoader() {
    loader.style.display='none';
}

function selectShellfish(value) {
    if (!value) return;
    showLoader();
    const shellfish = value.toLowerCase();
    const results = data.filter((el) => el.name.includes(shellfish));
    selectedData = results;
    printData();
}

function printData() {
    resultsTable.innerHTML = "";
    for(const el of selectedData) {
        const item = document.createElement("div");
        const linkImg = document.createElement("a");
        const img = document.createElement("img");
        const name = document.createElement("div");
        const linkName = document.createElement("a");
        const price = document.createElement("div");

        item.classList.add('item');
        linkImg.classList.add('item-img');
        name.classList.add('item-name');
        price.classList.add('item-price');

        linkImg.href = pages[el.page].url;
        img.src = pages[el.page].img;
        linkName.href=el.link;
        linkName.innerText = el.name;
        price.innerText = el.price;

        linkImg.appendChild(img);
        name.appendChild(linkName);

        item.appendChild(linkImg);
        item.appendChild(name);
        item.appendChild(price);

        resultsTable.appendChild(item);

    }
    hideLoader();
}

function initApp() {
    fillMariscos();
    searchData();
}

initApp();
