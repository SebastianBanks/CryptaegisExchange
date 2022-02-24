
const imageForm = document.querySelector("#imageForm")
const imageInput = document.querySelector("#imageInput")
const itemPrice = document.querySelector("#item_price")
const itemTitle = document.querySelector("#item_title")
const itemDesc = document.querySelector("#item_desc")
const itemSize = document.querySelector("#item_size")
const ownerId = document.querySelector("#owner_id")
const catId = document.querySelector("#cat_id")



imageForm.addEventListener("submit", async event => {
    event.preventDefault()
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

    
})




