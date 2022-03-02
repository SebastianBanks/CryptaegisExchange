
const imageForm = document.querySelector("#imageForm")
const imageInput = document.querySelector("#imageInput")
const itemPrice = document.querySelector("#item_price")
const itemTitle = document.querySelector("#item_title")
const itemDesc = document.querySelector("#item_desc")
const itemSize = document.querySelector("#item_size")
const ownerId = document.querySelector("#owner_id")
const catId = document.querySelector("#cat_id")

const coinbaseId = document.querySelector("#coinbaseId")
const userForm = document.querySelector("#userForm")
const userName = document.querySelector("#userName")
const email = document.querySelector("#email")
const phoneNum = document.querySelector("#phoneNum")
const userLocation = document.querySelector("#location")
const age = document.querySelector("#age")

const searchField = document.querySelector("#searchField")
const searchPrice = document.querySelector('#searchPrice')
const searchLocation = document.querySelector('#searchLocation')
const searchCat = document.querySelector('#searchCat')
const searchBtn = document.querySelector('#search')

const coinbaseBtn = document.querySelector(".coinbaseBtn")

const itemSection = document.querySelector(".items")

const localHost = "http://localhost:3000"
const heroku = "https://cryptaegis-exchange.herokuapp.com"

const getCoinbaseHREF = () => {
    axios.get(`${heroku}/getLink`)
        .then(res => {
            console.log(`https://www.coinbase.com/oauth/authorize?response_type=code&client_id=${res.data.client}&redirect_uri=${res.data.url}&state=${res.data.sec}&scope=${res.data.scope}`)
            coinbaseBtn.href = href=`https://www.coinbase.com/oauth/authorize?response_type=code&client_id=${res.data.client}&redirect_uri=${res.data.url}&state=${res.data.sec}&scope=${res.data.scope}`
        })
}

const getImageUrl = async (itemId) => {
    let promise = ""
    try {
        const {data:res} = await axios.get(`${heroku}/getItemImage/${itemId}`)
        promise = res[0]["image_url_path"]
        return promise
    }
    catch (err) {
        console.log(err)
    }
    // const promise = axios.get(`${localHost}/getItemImage/${itemId}`)
    // const dataPromise = promise.then(res => res.data[0]["image_url_path"])
    // return dataPromise
}

const createItemCard = async (item) => {
    const itemName = item["item_title"]
    const itemCost = item["item_price"]
    const itemId = item["item_id"]

    let imageUrl = await getImageUrl(itemId).then(res => {
        console.log(res)
        return res
    })
    console.log(getImageUrl(itemId))
    

    console.log(`imageUrl: ${imageUrl}`)
    const itemCard = 
        `
            <div class="item" id="${itemId}">
                <img id="itemImage" src="${imageUrl}"/>
                <h2 class="itemTextTitle">${itemName}<h2>
                <h3 class="itemTextPrice">$${itemCost}<h3>
            </div>
        `
    return itemCard
}

const getAllItems = () => {
    axios.get(`${heroku}/items`)
        .then(res => {
            itemSection.innerHTML = ''
            res.data.forEach( async item => {
                const itemCard = await createItemCard(item);
                console.log(`itemCard: ${itemCard}`)
                itemSection.innerHTML += itemCard
            })
        })
        .catch(err => console.log(err))
}


const createUser = (e) => {
    e.preventDefault()

    let body = {
        coinbase_id: coinbaseId.value,
        user_name: userName.value,
        user_email: email.value,
        user_phone_number: phoneNum.value,
        user_location: userLocation.value,
        user_age: age.value
    }

    axios.post(`${heroku}/createUser`, body)
        .then(() => {
            console.log("createUser-----------")
            console.log(body)
        })
        .catch(err => console.log(err))
}

const createItem = async (e) => {
     e.preventDefault()

        let photos = []
    for(let i = 0; i < imageInput.files.length; i++) {
        console.log(imageInput.files[i])
        const file = imageInput.files[i]

        const { url } = await fetch(`${heroku}/s3URL`).then(res => res.json())
        console.log(url)

        await fetch(url, {
            method: 'PUT',
            headers: {
                "Content-Type": "multipart/form-data", 
            },
            body: file
        })
        console.log({url})
        const imageUrl = url.split('?')[0]
        console.log(`imgUrl: ${imageUrl}`)
        photos.push(imageUrl)
    }

    let body = {
        item_price: itemPrice.value,
        item_title: itemTitle.value,
        item_desc: itemDesc.value,
        item_size: itemSize.value,
        owner_id: ownerId.value,
        category_id: catId.value,
        item_images: photos
    }
    
    axios.post(`${heroku}/createItem`, body)
        .then(() => {
            imageForm.reset()
            getAllItems()
            console.log("createItem-----------")
            console.log(`photos: ${photos}`)
            console.log(body)
        })
        .catch(err => console.log(err))
        
    
    console.log(photos)
}

const getFilteredItems = (e) => {
    e.preventDefault()
    console.log(`Search ---------------------------------`)
    let searchValue = searchField.value
    let priceValue = searchPrice.value
    let locationValue = searchLocation.value
    let categoryValue = searchCat.value

    if (priceValue === undefined) {
        console.log('hi')
    } else if (priceValue === "") {
        console.log("hello")
    } else {
        console.log("yo")
    }
    itemSection.innerHTML = ''
    console.log(searchValue)
    console.log(priceValue)
    console.log(locationValue)
    console.log(categoryValue)

    axios.get(`${heroku}/getFilteredItems?searchBar=${searchValue}&price=${priceValue}&location=${locationValue}&category=${categoryValue}`)
    .then(res => {
        console.log(`res: ${res.data}`)
        
        res.data.forEach( async item => {
            const itemCard = await createItemCard(item);
            console.log(`itemCard: ${itemCard}`)
            itemSection.innerHTML += itemCard
        })
    })
    .catch(err => console.log(err))
    console.log(`----- ---------------------------------`)
}


imageForm.addEventListener("submit", createItem)
userForm.addEventListener("submit", createUser)
searchBtn.addEventListener("click", getFilteredItems)

getCoinbaseHREF()
getAllItems()

    


    





