var MongoClient = require('mongodb').MongoClient;
var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var url = "mongodb://localhost:27017/mydb";
var _ = require('lodash');

const API_PORT = 3000;
const app = express();
/* GET home page. */
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true, parameterLimit: 50000 }));
app.use(logger("dev"));

app.get("/summoner/name=:name", (req, res) => {
  if (req.params.name != undefined){
    MongoClient.connect(url, { useNewUrlParser: true }, (err, db) => {
      if (err) throw err;
      var dbo = db.db("lolinsight");
      var name = req.params.name;
      if (name != undefined){
        name = name.toLowerCase()
        dbo.collection("summoners").find({summonerName:name}).toArray((err, result) => {
          if (err) throw err;
          if (result.length == 0){
            return res.json({success: false, code: 404, data: "not found"})
            db.close();
          }
          let dedupeResult = _.uniqBy(result[0].matches, 'gameId');
          result[0].matches = dedupeResult
          if (dedupeResult.length >= 150){
            dedupeResult = dedupeResult.slice(dedupeResult.length - 150, dedupeResult.length)
          }
          return res.json({success: true, code: 200, data: result})
          db.close();
        });
      }
      else{
        return res.json({success: false, code: 500})
        db.close();
      }
    });
  }
  else{
    return res.json({success: false, code: 404})
  }
});

app.post("/update-summoner", (req, res) => {
  if (req.body != undefined){
    var obj = req.body
    MongoClient.connect(url, { useNewUrlParser: true }, (err, db) => {
      if (err) throw err;
      var dbo = db.db("lolinsight");
      var summoner = {
        $set:{
          "date": new Date()
        },
        $push:{
          "matches": {
            $each: obj.matches,
          }
        },
      }
      console.log(new Date())
      var insert = {
        "id":obj.accountId,
        "summonerName": obj.summonerName.toLowerCase()
      }
      console.log(insert);
      dbo.collection("summoners").updateOne(insert, summoner, {upsert:true}, (err, result) => {
        if (err) throw err;
        return res.json({success: true, code: 200, data: result})
        db.close();
      });
    });
  }
  else {
    return res.json({success: false, code: 404, data: {'result': 'not found'}})
  }
});

// router.get("/insert-summoner/id=:id", (req, res) => {
//     MongoClient.connect(url, { useNewUrlParser: true }, (err, db) => {
//       if (err) throw err;
//       var dbo = db.db("lolinsight");
//       var obj = JSON.parse(req.params.id)
//       var insert = {
//         "id":obj,
//       }
//       dbo.collection('summoners').find(insert).toArray((err, result) => {
//         if (err) throw err;
//         console.log("Result: ", result, result.length)
//         if (result.length == 0){
//           dbo.collection("summoners").insertOne(insert, (err, result) => {
//             if (err) throw err;
//             db.close();
//             return res.json({success: true, code: 200, data: result})
//           });
//         }
//         else if (result.length > 0) {
//           return res.json({success: true, code: 409, data: "Conflict Error. Summoner Already Exists"})
//         }
//         db.close()
//       })
//     });
// });

app.listen(API_PORT, () => console.log(`LISTENING ON PORT ${API_PORT}`));

// MongoClient.connect(url, function(err, db) {
//   if (err) throw err;
//   var mydb = db.db("mydb");
//   console.log("Database created!");
//   var myobj = { name: "Company Inc", address: "Highway 37" };
//   mydb.collection("customers").insertOne(myobj, function(err, res) {
//     if (err) throw err;
//     console.log("1 document inserted");
//     db.close();
//   });
// });


// module.exports = router;
