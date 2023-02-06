var express = require('express');
const fs = require("fs");
var router = express.Router();

/* GET home page. */
router.get('/:hash', function (req, res, next) {
    let hash = req.params.hash;
    console.log("params : ", req.params);
    if (!hash) {
        res.sendStatus(404);
        return;
    }
    try {
        let files = fs.readdirSync("data/blocks/");
        let fileName = files.find((value) => {
            if (value.includes(hash)) {
                return true;
            }
            return false;
        })
        let data = fs.readFileSync("./data/blocks/" + fileName);
        return res.send(data);
    } catch (e) {
        console.error(e);
        return res.sendStatus(404);
    }
    // res.render('index', {title: 'Express'});
});

module.exports = router;
