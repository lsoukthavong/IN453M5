import mysql from 'mysql';
import bodyParser from 'body-parser';
import express from 'express';
import cors from 'cors';


//==============================================
//Data Access layer
//==============================================
let app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

let con;

app.post('/connect', function (req, res) {
  const { server, database, user, password } = req.body;
  con = mysql.createConnection({
    server: server,
    database: database,
    user: user,
    password: password
    
  });

  con.connect(function(err) {
    if (err) {
      //Unauthorized Error
      if(err.code==='ER_ACCESS_DENIED_ERROR'){
        res.status(401).send({ message: 'Invalid user or password. Please try again.' });//Send generic message for unathorized access
      }else {
      //Internal Server Error
      console.log('Connection failed: ',err.message);//log error internally
      res.status(500).send({ message: 'Connection failed. Please try again.' });//Send generic error message
    }
   } else {
      //OK
      res.status(200).send({ message: 'Connected successfully!' });
    }
  });
});



//==============================================
//BUSINESS LAYER
//==============================================
//Function to get row count from IN453A
function getRowCount(tableName) {
  return new Promise((resolve, reject) => {
   // con.query(`SELECT COUNT(*) as count FROM ${tableName}`, function (err, result) {
    const query =`SELECT COUNT(*) as count FROM ??`;
      con.query(query, [tableName], function(err,result) {
      if (err) {
        console.error('Error fetching row count: ', err.message);//log error internally
        return reject(err);
      }
      resolve(result[0].count);
    });
  });
}


//Function to concatenate first and last names from IN453B
function getFullNames(tableName) {
return new Promise((resolve, reject) => {
  //con.query(`SELECT CONCAT(first_name, ' ', last_name) as full_name FROM ${tableName}`, function (err, result) {
  const query =`SELECT CONCAT(first_name, ' ', last_name) as full_name FROM ??`;
  con.query(query, [tableName], function (err,result) {
    if (err) {
      console.error('Error fetching full names: ', err.message);//log error internally
      return reject(err);
    }
    resolve(result.map(row => row.full_name));
  });
});
}

//==============================================
//Web App
//==============================================
app.use(cors());

//Row Count
app.get('/rowcount/:tableName', async function (req, res) {
  try {

    let count = await getRowCount(req.params.tableName);
    console.log(count);
    res.status(200).send({response:`Table ${req.params.tableName} has ${count} rows.`});    
  } catch (err) {
    console.error('Error in /rowcount route: ', err.message);//log erro internally
    res.status(500).send({ message: 'Error fetching row count. Please try again!'});
  }
});


//FullNames
app.get('/fullnames/:tableName', async function (req, res) {
  try {
    let fullNames = await getFullNames(req.params.tableName);
    console.log(fullNames);
    res.status(200).send({response: fullNames});
  } catch (err) {
    console.error('Error in /fullnames route: ', err.message);//log error internally
    res.status(500).send({ message: 'Error fetching full names. Please try again!'});
  }
});



//Server Listening
app.listen(5503, function () {
  console.log('App listening on port 5503!');
});
