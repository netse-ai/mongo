var MongoClient = require('mongodb').MongoClient;
var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var url = "mongodb://localhost:27017/mydb";

const API_PORT = 3000;
const app = express();
const router = express.Router();
/* GET home page. */
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(logger("dev"));

app.use(function(req, res, next) {
    res.setHeader('Connection', 'close');
    next();
});

router.get("/summoner/id=:id", (req, res) => {
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


router.get("/update-summoner/data=:data", (req, res) => {
    MongoClient.connect(url, { useNewUrlParser: true }, (err, db) => {
      if (err) throw err;
      var dbo = db.db("lolinsight");
      var obj = JSON.parse(req.params.data)
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
      var insert = {
        "id":obj.accountId,
      }
      dbo.collection("summoners").updateOne({id: obj.accountId}, summoner, {upsert:true}, (err, result) => {
        if (err) throw err;
        return res.json({success: true, code: 200, data: result})
        db.close();
      });
    });
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


app.use("/api", router);
// app.listen(API_PORT, () => console.log(`LISTENING ON PORT ${API_PORT}`));

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


module.exports = router;
