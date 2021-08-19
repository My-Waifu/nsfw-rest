const express = require("express")
const uuid = require('node-uuid');
const httpContext = require('express-http-context');
const mysqlQuery = require("./mysql/fast-query");

const application = express();
const port = 25565;
const sqlRequest = `SELECT bytes FROM data WHERE file_type=? AND category=? AND tag=? AND nsfw=? ORDER BY RAND() LIMIT 1;`;
let debugMode = false;

application.listen(port, () => {
    let args = process.argv.slice(2);
    if (args.includes("debug=true")) debugMode = true;
    console.log(`Listening at https://localhost:${port}`)
})

application.use(httpContext.middleware);
application.use(async function (request, response, next) {
    httpContext.set('requestId', uuid.v1());
    next();
});

application.get('/api/', async function (request, response) {

    const fileType = request.query.filetype;
    const category = request.query.category;
    const tag = request.query.tags;
    const nsfw = request.query.nsfw;
    const ip = request.headers['x-forwarded-for'] || request.socket.remoteAddress

    if (debugMode) debug("Client -> Server : A request was received. [INFO]", ip);

    if (isUndefined(fileType) || isUndefined(category) || isUndefined(tag) || isUndefined(nsfw)) {

        if (debugMode) debug("Client <- Server : Oh... It seems that there is a problem with your request, please check this one (code 400) [ERROR]", ip)

        response.json({
            error: "Oh... It seems that there is a problem with your request, please check this one",
            errorCode: 400
        })
        return;
    }

    mysqlQuery.query(sqlRequest, [fileType, category, tag, nsfw], async function (rows, error) {

        if (error || !rows.length || !rows[0].bytes) {
            if (debugMode) debug("Client <- Server : Oh... It seems we couldn't find a result to your request ! (Code 404) [ERROR]", ip)

            return response.json({
                error: "Oh... It seems we couldn't find a result to your request! :c",
                errorCode: 404
            }) && console.log(error);
        }

        if(debugMode) debug("Client <- Server : The response to the request has been sent! [INFO] ", ip);
        return response.json({fileType: fileType, category: category, tag: tag, nsfw: nsfw, image: rows[0].bytes})
    });
});


function debug(message, ip) {
    const date = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
    const requestId = httpContext.get("requestId");
    console.log(` Date - [ ${date} ], RequestId - { ${requestId} }, RequestIp - ( ${ip} )  ${message}`)
}

function isUndefined(variable) {
    return typeof (variable) === "undefined";
}

