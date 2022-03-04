const coinbaseId = document.querySelector("#coinbaseId")
const userForm = document.querySelector("#userForm")
const userName = document.querySelector("#userName")
const email = document.querySelector("#email")
const phoneNum = document.querySelector("#phoneNum")
const userCity = document.querySelector("#city")
const userState = document.querySelector("#state")


const localHost = "http://localhost:3000"
const heroku = "https://cryptaegis-exchange.herokuapp.com"
let id

const getUserFormInfo = () => {
    axios.get(`${heroku}/getFormData`)
    .then(async res => {
        id = await res.data.i
        userName.value = await res.data.n
        email.value = await res.data.e
        userState.value = await res.data.s
    })
}

const createUser = (e) => {
    e.preventDefault()

    if (phoneNum.value.length !== 14) {
        alert("Phone number must have 10 characters")
    } else {
        let body = {
            coinbase_id: id,
            user_name: userName.value,
            user_email: email.value.toLowerCase(),
            user_phone_number: phoneNum.value,
            user_location: `${userCity.value.toLowerCase()}, ${userState.value.toLowerCase()}`
        }
    
        axios.post(`${heroku}/createUser`, body)
            .then(() => {
                console.log("createUser-----------")
                console.log(body)
            })
            .catch(err => console.log(err))
    }

    
}


userForm.addEventListener("submit", createUser)

getUserFormInfo()