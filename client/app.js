

const imageInput = document.querySelector("#imageInput")
const itemPrice = document.querySelector("#item_price")
const itemTitle = document.querySelector("#item_title")
const itemDesc = document.querySelector("#item_desc")
const itemSize = document.querySelector("#item_size")
const ownerId = document.querySelector("#owner_id")
const catId = document.querySelector("#cat_id")



const searchField = document.querySelector("#searchField")
const searchPrice = document.querySelector('#searchPrice')
const searchLocation = document.querySelector('#searchLocation')
const searchCat = document.querySelector('#searchCat')
const searchBtn = document.querySelector('#submit')

const coinbaseBtn = document.querySelector(".coinbaseBtn")
const addItemBtn = document.querySelector(".addItemBtn")

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

const convertAlteredString = async string => {
    const singleQuote = "()"
    const doubleQuote = "^*"
    const backTick = "@!"

    let returnString = ``

    for (let i = 0; i < string.length; i++) {
        if (string[i] === singleQuote[0] && string[i + 1] === singleQuote[1]) {
            returnString += `'`
            i++
        } else if (string[i] === doubleQuote[0] && string[i + 1] === doubleQuote[1]) {
            returnString += `"`
            i++
        } else if (string[i] === backTick[0] && string[i + 1] === backTick[1]) {
            returnString += "`"
            i++
        } else {
            returnString += string[i]
        }
    }

    return returnString
}

const createItemCard = async (item) => {
    
    const itemName = await convertAlteredString(item["item_title"])
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

    const title = document.querySelector("#titleEdit").value
    const price = document.querySelector('#priceEdit').value
    const desc = document.querySelector('#descEdit').value
    const size = document.querySelector(`#sizeEdit`).value
    const categ = document.querySelector('#catEdit').value

    let body = {
        item_price: price,
        item_title: title,
        item_desc: desc,
        item_size: size,
        category_id: categ,
        item_images: photos
    }
    
    axios.post(`${heroku}/createItem`, body)
        .then(() => {
            imageForm.reset()
            document.querySelector(".editItems").style.display = "none"
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

const getUserIsSignedIn = () => {
    axios.get(`${heroku}/isSignedIn`)
    .then(res => {
        console.log(res.data)
        if (res.data === false) {
            coinbaseBtn.style.display = ""
            addItemBtn.style.display = "none"
        } else if (res.data === true) {
            coinbaseBtn.style.display = "none"
            addItemBtn.style.display = ""
        }
    })
}

const createItemForm = (e) => {
    const editDiv = 
        `
            <div class="editItem">
                <div class="editForm">
                    <form class="editFormProperties">
                        <input id="imageEdit" type="file" accept="image/*" multiple required>
                        <p class="editPropTitle">Title:</p>
                        <input id="titleEdit" type="text" placeholder="Item title" required>
                        <p class="editPropTitle">Price:</p>
                        <input id="priceEdit" type="number" placeholder="Item price" step=0.01 required>
                        <p class="editPropTitle">Description:</p>
                        <textarea id="descEdit" rows="4" cols="20" style="color: black;" required></textarea> 
                        <p class="editPropTitle">Size:</p>
                        <input id="sizeEdit" type="text" placeholder="Item Size" required>
                        <select id="catEdit" placeholder="Category" required>
                            <option value="0" disabled selected>Select a Category</option>
                            <option value="1">Appliances</option>
                            <option value="2">Art</option>
                            <option value="3">Auto Parts & Accessories</option>
                            <option value="4">Baby</option>
                            <option value="5">Books & Media</option>
                            <option value="6">Clothings & Appareal</option>
                            <option value="19">Cookware</option>
                            <option value="7">Cycling</option>
                            <option value="8">Electronics</option>
                            <option value="9">Fitness Equipment</option>
                            <option value="10">Furniture</option>
                            <option value="11">General</option>
                            <option value="12">Home & Garden</option>
                            <option value="13">Hunting & Fishing</option>
                            <option value="14">Musical Instruments</option>
                            <option value="15">Outdoors & Sporting</option>
                            <option value="16">Pets</option>
                            <option value="17">Recreational Vehicles</option>
                            <option value="18">Toys</option>  
                        </select>
                    
                    </form>
                    <div class="editButtons">
                        <button class="editFormBtn" id="updateBtn">Add Item</button>
                        <button class="editFormBtn" id="cancelBtn">Cancel</button>
                    </div>
                </div>
            </div>
        `
        main.innerHTML += editDiv
}


 itemSection.addEventListener('click', function(e) {
     let itemId
     if (e.target && e.target.className === 'item') {
        itemId = e.target.id
     } else if (e.target && e.target.id === 'itemImage') {
         itemId = e.target.parentNode.id
     }
     localStorage.setItem("item", itemId)
     window.location = "/itemPage"
 })

 main.addEventListener('click', function(e) {
     if (e.target && e.target.id === "updateBtn") {
         createItem
     } else if (e.target && e.target.id === "cancelBtn") {
        document.querySelector(".editItems").style.display = "none"
     } else {
         console.log("missed target")
     }
 })


imageForm.addEventListener("submit", createItem)
searchBtn.addEventListener("click", getFilteredItems)
addItemBtn.addEventListener("click", createItemForm)
getUserIsSignedIn()
getCoinbaseHREF()
getAllItems()


    


    





