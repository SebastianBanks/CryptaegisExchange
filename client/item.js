const img = document.querySelector(".imgItemPage")
const title = document.querySelector(".itemPageTitle")
const price = document.querySelector(".itemPagePrice")
const buyBtn = document.querySelector(".buyButton")
const desc = document.querySelector(".itemPageDescription")
const editBtn = document.querySelector(".editItemButton")
const backBtn = document.querySelector("#backBtn")
const size = document.querySelector(".itemPageSize")
const main = document.querySelector("main")
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

const createEditDiv = async (item) => {
    const itemName = await convertAlteredString(item["item_title"])
    const itemCost = item["item_price"]
    const itemId = item["item_id"]
    const itemCat = String(item["category_id"])
    const itemDesc = await convertAlteredString(item["item_description"])
    const itemSize = await convertAlteredString(item["item_size"])
    const isAvailable = item["item_is_available"]

    console.log(itemName)
    console.log(itemCost)
    console.log(itemId)
    console.log(itemCat)
    console.log(itemDesc)
    console.log(itemSize)
    console.log(isAvailable)
    

    let imageUrl = await getImageUrl(itemId).then(res => {
        console.log(res)
        return res
    })
    console.log(getImageUrl(itemId))

    const editDiv = 
        `
            <div class="editItem" id="${itemId}">
                <img id="editImageForm" src="${imageUrl}"/>
                <div class="editForm">
                    <form class="editFormProperties">
                    <input id="imageEdit" type="file" accept="image/*" multiple>
                    <p class="editPropTitle">Title:</p>
                    <input id="titleEdit" type="text" placeholder="Item title" value="${itemName}" required>
                    <p class="editPropTitle">Price:</p>
                    <input id="priceEdit" type="number" placeholder="Item price" step=0.01 value="${itemCost}" required>
                    <p class="editPropTitle">Description:</p>
                    <textarea id="descEdit" rows="4" cols="20" style="color: black;" required>${itemDesc}</textarea> 
                    <p class="editPropTitle">Size:</p>
                    <input id="sizeEdit" type="text" placeholder="Item Size" value="${itemSize}" required>
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
                    <p class="editPropTitle">Is available:</p>
                    <input id="checkEdit" type="checkbox" value="Item is available">
                    
                    </form>
                    <div class="editButtons">
                        <button class="editFormBtn" id="updateBtn">Update</button>
                        <button class="editFormBtn" id="cancelBtn">Cancel</button>
                        <button class="editFormBtn" id="deleteBtn">Delete</button>
                    </div>
                </div>
            </div>
        `
    return editDiv
}

const editItem = (e) => {
    console.log("inside edit item")
    axios.get(`${heroku}/itemPage/${itemId}`)
    .then(res => {
        res.data.forEach(async item => {
            console.log(document.querySelector(".editItem"))
            if (main.contains(document.querySelector(".editItem"))) {
                console.log("it exists")
                document.querySelector(".editItem").style.display = "flex"
            } else {
                console.log(await item)
                const editForm = await createEditDiv(item)
                main.innerHTML += editForm
                const select = document.querySelector("#catEdit")
                select.value = String(item["category_id"])
                const checked = document.querySelector("#checkEdit")
                checked.checked = item["item_is_available"]
            }

            
        })
    })
}

main.addEventListener("click", function(e) {
    if (e.target && e.target.id === "updateBtn") {
        console.log("update")

        

        const title = document.querySelector("#titleEdit").value
        const price = document.querySelector('#priceEdit').value
        const desc = document.querySelector('#descEdit').value
        const size = document.querySelector(`#sizeEdit`).value
        const categ = document.querySelector('#catEdit').value
        let isChecked = document.querySelector("#checkEdit").checked

        const body = {
            id: itemId,
            price: price,
            description: desc,
            is_available: isChecked,
            item_name: title,
            product_size: size,
            category_id: categ
        }
        updateItem(body)
        
    } else if (e.target && e.target.id === "cancelBtn") {
        console.log("cancel")
        let popup = document.querySelector(".editItem")
        popup.style.display = "none"
    } else if (e.target && e.target.id === "deleteBtn") {
        console.log("delete")
        deleteItem(itemId)
    }
})

const updateItem = (body) => {
    axios.put(`${heroku}/editItem`, body)
        .then(res => {

            res.data.forEach(async item => {
                console.log(item)
            })

            getItemDesc()
            let popup = document.querySelector(".editItem")
            popup.style.display = "none"
        })
}

const deleteItem = (id) => {
    axios.delete(`${heroku}/deleteItem/${id}`)
        .then(res => {
            console.log(res)
            window.location = "/"
        })
}

getItemDesc()
canEditBtn()
backBtn.addEventListener("click", goBackAPage)
console.log("edit item 2")
editBtn.addEventListener("click", editItem)