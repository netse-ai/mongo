var MongoClient = require('mongodb').MongoClient;
var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var url = "mongodb://localhost:27017/mydb";

const API_PORT = 3000;
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(logger("dev"));

app.get("/summoner/id=:id", (req, res) => {
    MongoClient.connect(url, { useNewUrlParser: true }, (err, db) => {
      if (err) throw err;
      var dbo = db.db("lolinsight");
      var id = req.params.id;
      console.log(id);
      dbo.collection("summoners").find({id:id}).toArray((err, result) => {
        if (err) throw err;
        if (result.length == 0){
          return res.json({success: false, code: 404, data: "not found"})
        }
        return res.json({success: true, code: 200, data: result})
        db.close();
      });
    });
});

app.post("/update-summoner", (req, res) => {
  console.log(res);
  return res.json({success: true, code: 200, data: res})
});

app.listen(API_PORT, () => console.log(`LISTENING ON PORT ${API_PORT}`));
