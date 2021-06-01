const Https = require("https");

module.exports = {
    
    /** Retrieves XHTML data from the given url using GET HTTPS request
    * 
    * @param {string} url String
    * @param {function} response Callback
    */
    _getNews(url, response)
    {
        //let resposne = null;

        // We setup our https request and execute it
        // First argument url is the url of the website where we are sending the https request
        Https.get(url, (resp) => {
            let data = '';

            // A chunk of data has been received and appended to the rest of already recieved data.
            resp.on('data', (chunk) => {
                data += chunk;
            });

            // The whole response has been received. Print out the result.
            resp.on('end', () => {
                response(data);
            });

            // An error has occured during our https request
        }).on("error", (err) => {
            console.log("Error: " + err.message);
        });
    }
}