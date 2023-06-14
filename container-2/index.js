const express = require('express');
const app = express();
const bodyParser = require('body-parser');

const fs = require('fs');

const csv = require('csv-parser');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.get('/', (req, res) => {

});

app.post('/calculateAmount', (req, res) => {
  console.log(req.body);
  let {file, product} = req.body;
  const filePath = '/usr/src/data/'+ file;
  let sum = 0;
  let isCSV = true;
  let output = {};
  let statusCode = 200;
///https://www.digitalocean.com/community/tutorials/how-to-read-and-write-csv-files-in-node-js-using-node-csv
///https://www.npmjs.com/package/csv-parser    
///https://stackoverflow.com/a/35008327 
  try {
    fs.accessSync(filePath);
    const readableStream = fs.createReadStream(filePath);
    let headerCount=0;
    // Process each row of data
    const csvStream= readableStream.pipe(csv())
    .on('headers',(headers) => {
      headerCount=headers.length;
    })
      .on('data', (row) => {
        if(headerCount!=2){    //Condition 1: Headers
          isCSV=false;
          csvStream.end();
        } else if(row.product==undefined && row.amount==undefined){ //Condition 2: No null or undefined elements
          isCSV=false;
          csvStream.end();
        }else{
          const row_product = row.product; //Condition 3: Header name should be exact
          const row_amount = row.amount;
          if(row_product==product){
            sum+=parseInt(row_amount);
          }
          console.log('Product:', row_product);
          console.log('Amount:', row_amount);
        }
      })
      .on('end', () => {
        // Parsing finished
        if(isCSV && sum!=" " && sum!=NaN){
          output= {"file":file,"sum":sum};
          console.log('CSV parsing complete.');
        }else{
          output={"file":file,"error":"Input file not in CSV format."};
          statusCode=500;
        }
       res.status(statusCode).send(output);
      })
      .on('error', (err) => {
        // Handle any errors that occurred during parsing
        output={"file":file,"error":"Input file not in CSV format."};
        statusCode=500;
        res.status(statusCode).send(output);
      });
  } catch (err) {
    if (err.code === 'ENOENT') {
      output={"file":file,"error":"File not found."};
      statusCode=500;
      console.error('File does not exist');
    } else {
      console.error('Error occurred while accessing the file:', err);
    }
    res.status(statusCode).send(output);
  }
});

app.listen(3000, () => {
  console.log('Container 2 started on port 3000');
});
