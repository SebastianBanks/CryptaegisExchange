const coinbaseId = document.querySelector("#coinbaseId")
const userForm = document.querySelector("#userForm")
const userName = document.querySelector("#userName")
const email = document.querySelector("#email")
const phoneNum = document.querySelector("#phoneNum")
const userLocation = document.querySelector("#location")
const age = document.querySelector("#age")

const localHost = "http://localhost:3000"
const heroku = "https://cryptaegis-exchange.herokuapp.com"

const getUserFormInfo = () => {
    axios.get(`${heroku}/getFormData`)
    .then(res => {
        console.log(res)
    })
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

userForm.addEventListener("submit", createUser)

getUserFormInfo()