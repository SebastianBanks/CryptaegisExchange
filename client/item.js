const img = document.querySelector(".imgItemPage")
const title = document.querySelector(".itemPageTitle")
const price = document.querySelector(".itemPagePrice")
const buyBtn = document.querySelector(".buyButton")
const desc = document.querySelector(".itemPageDescription")
const editBtn = document.querySelector(".editItemButton")
const backBtn = document.querySelector("#backBtn")
const size = document.querySelector(".itemPageSize")
let itemId = localStorage.getItem("item")
console.log(`itemId: ${itemId}`)

const localHost = "http://localhost:3000"
const heroku = "https://cryptaegis-exchange.herokuapp.com"

backBtn.textContent = "< Back"

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

const getItemDesc = () => {
    axios.get(`${heroku}/itemPage/${itemId}`)
    .then(res => {
        res.data.forEach(async item => {
            console.log(await item)
            // await addItemDesc(item)

            const itemName = await item["item_title"]
            const itemDesc = await item["item_description"]
            const itemSize = await item["item_size"]
            const itemCost = await item["item_price"]

            title.textContent = await convertAlteredString(itemName)
            desc.textContent = await convertAlteredString(itemDesc)
            price.textContent = `$${itemCost}`
            size.textContent = await convertAlteredString(itemSize)

            img.src = await getImageUrl(itemId).then(res => {
                console.log(res)
                return res
            })
            
            console.log(getImageUrl(itemId))
            console.log(`imageUrl: ${imageUrl}`)
            //--------------------------
        })
    })
    .catch(err => {
        console.log(err)
    })
}

const canEditBtn = () => {
    axios.get(`${heroku}/getCurrentUser`)
    .then(res => {
        let currentUser = res.data.user
        console.log(`CurrentUser: ${currentUser}`)
        axios.get(`${heroku}/getItemOwner/${itemId}`)
        .then(res => {
            console.log(`ItemOwner: ${res.data[0]["owner_id"]}`)
            if (currentUser === res.data[0]["owner_id"]) {
                editBtn.style.display = ""
            } else {
                editBtn.style.display = "none"
            }
        })
        .catch(err => {
            console.log("error getting ownerId")
            console.log(err)
        })
    })
    .catch(err => {
        console.log("error getting current user")
        console.log(err)
    })
}

const goBackAPage = (e) => {
    window.location = "/"
}

getItemDesc()
canEditBtn()
backBtn.addEventListener("click", goBackAPage)