var MongoClient = require('mongodb').MongoClient;
var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var url = "mongodb://localhost:27017/mydb";

const API_PORT = 3000;
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(logger("dev"));

function cleanStringify(object) {
  if (object && typeof object === 'object') {
      object = copyWithoutCircularReferences([object], object);
  }
  return JSON.stringify(object);

  function copyWithoutCircularReferences(references, object) {
      var cleanObject = {};
      Object.keys(object).forEach(function(key) {
          var value = object[key];
          if (value && typeof value === 'object') {
              if (references.indexOf(value) < 0) {
                  references.push(value);
                  cleanObject[key] = copyWithoutCircularReferences(references, value);
                  references.pop();
              } else {
                  cleanObject[key] = '###_Circular_###';
              }
          } else if (typeof value !== 'function') {
              cleanObject[key] = value;
          }
      });
      return cleanObject;
  }
}


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

  res = cleanStringify(res)
  console.log(res)
  return res.json({success: true, code: 200, data: res})
});

app.listen(API_PORT, () => console.log(`LISTENING ON PORT ${API_PORT}`));
