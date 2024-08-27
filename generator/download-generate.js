var request = require("request")

request(
    { uri: "https://www.klubschule.ch" },
    (error, response, body) => {
        console.log(body)
    }
)