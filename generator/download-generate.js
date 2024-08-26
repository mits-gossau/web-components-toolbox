var request = require("request");

request(
    { uri: "https://www.klubschule.ch" },
    function(error, response, body) {
        console.log(body);
    }
);