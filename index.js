const express = require("express")
const mysqlQuery = require("./mysql/fast-query");
const application = express();
const port = 25565;
const sqlRequest = "SELECT bytes FROM data WHERE file_type=? AND category=? AND tag=? AND nsfw=? ORDER BY RAND() LIMIT 1;";

application.get('/api/', async function (request, response) {

    let fileType = request.query.filetype;
    let category = request.query.category;
    let tag = request.query.tags;
    let nsfw = request.query.nsfw;

    if (isUndefined(fileType) || isUndefined(category) || isUndefined(tag) || isUndefined(nsfw)) {
        response.json({error: "Oh... It seems that there is a problem with your request, please check this one", errorCode: 400})
        return;
    }


    mysqlQuery.query(sqlRequest, [fileType, category, tag, nsfw], async function (rows, error) {

        if(error) return console.log(error);
        if(!rows.length || !rows[0].bytes) return response.json({error: "Oh... It seems we couldn't find a result to your request! :c", errorCode: 404})

        return response.json({ fileType: fileType, category: category, tag: tag, nsfw: nsfw, image: rows[0].bytes })
    });
});


application.listen(port, () => {
    console.log(`Listening at https://localhost:${port}`)
})

function isUndefined(variable) {
    return typeof (variable) === "undefined";
}

