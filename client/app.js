
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
const location = document.querySelector("#location")
const age = document.querySelector("#age")


const createUser = (e) => {
    e.preventDefault()

    let body = {
        coinbase_id: coinbaseId.value,
        user_Name: userName.value,
        user_email: email.value,
        user_phone_number: phoneNum.value,
        user_location: location.value,
        user_age: age.value
    }

    

}

const createItem = async (e) => {
     e.preventDefault()

        let images = []
    for(let i = 0; i < imageInput.files.length; i++) {
        console.log(imageInput.files[i])
        const file = imageInput.files[i]

        const { url } = await fetch("http://localhost:3000/s3URL").then(res => res.json())
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
    images.push(imageUrl)

    const img = document.createElement("img")
    img.src = imageUrl
    img.width = "250px"
    img.height = "250px"
    document.body.appendChild(img)
    }

    let body = {
        item_price: itemPrice.value,
        item_title: itemTitle.value,
        item_desc: itemDesc.value,
        item_size: itemSize.value,
        owner_id: ownerId.value,
        category_id: catId.value,
        images: images
    }
    
    axios.post('http://localhost:3000/createItem',body)
        .then(() => {
            console.log("then")
            console.log(body)
        })
        
    console.log(images)
}

imageForm.addEventListener("submirt", createItem)

    


    





