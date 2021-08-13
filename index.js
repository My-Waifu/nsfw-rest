const express = require("express")
const application = express();
const port = 25565;


application.get('/api', async function (request, result) {




});


application.listen(port, () => {
    console.log(`Listening at https://localhost:${port}`)
})