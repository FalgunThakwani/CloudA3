const express = require('express');

const app = express();

const http = require('http');
const bodyParser = require('body-parser');

const fs = require('fs');
const multer = require('multer');
const { Storage } = require('@google-cloud/storage');
const storage = new Storage();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));



app.get('/',(req,res) => {
  res.json('Everything is fine');
});

app.post('/store-file',async (req,res) => {
   let {file, data} = req.body;
   try{
    if(!file || file==null || file===""){
      res.json({file:file,error:"Invalid JSON input"});
    }else{
      fs.writeFileSync(fileName, data);
      const bucketName = 'csci5408a3';

      await storage.bucket(bucketName).upload(fileName, {
        destination: fileName,
      });
      const output = {	"file": "file.dat",
        "message": "Success"
      }
      console.log(`File ${fileName} uploaded to GKE persistent storage`);
      res.status(200).send(output);
    }
   }catch (err){
    console.error('Error:', error);
    res.status(500).send('Internal Server Error');
  }
  });

app.post('/calculate', (req, res) => {
  const request = {
    hostname: 'container2',
    port: 3000,
    path: '/calculateAmount',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  };
  let {file, product} = req.body;
  file=file.toLowerCase();
  const filePath = '/usr/src/data/'+ file;
  let output="";
  try{
    if(!file || file===""){
      res.json({file:file,error:"Invalid JSON input"});
    }else{
      fs.accessSync(filePath);
      const httpRequest=http.request(request,(response) =>{
        response.on('data', (data) => {
          output += data;
        });
        response.on('end', () => {
          res.send(JSON.parse(output));
        });
      });
      httpRequest.on('error', error => {
        res.send(error);
      });
      httpRequest.write(JSON.stringify({"file":file,"product":product}));
      httpRequest.end();
   
    }
  }catch (err){
    if (err.code === 'ENOENT') {
      output={"file":file,"error":"File not found."};
      statusCode=500;
      console.error('File does not exist');
    } else {
      console.error('Error occurred while accessing the file:', err);
    }
    res.send(output);
  }
});

app.listen(8080, () => {
  console.log('Server started on port 6000');
});
