
const imageForm = document.querySelector("#imageForm")
const imageInput = document.querySelector("#imageInput")

imageForm.addEventListener("submit", async event => {
    event.preventDefault()
    const file = imageInput.files[0]
    console.log(file)

    const { url } = await fetch("http://localhost:3000/s3URL").then(res => res.json())
    // console.log(url)

    await fetch(url, {
        method: 'PUT',
        headers: {
            "Content-Type": "multipart/form-data"
        },
        body: file
    })
    console.log({url})
    const imageUrl = url[0].split('?')
    console.log(`imgUrl: ${imageUrl}`)



    const img = document.createElement("img")
    img.src = imageUrl
    document.body.appendChild(img)
})




