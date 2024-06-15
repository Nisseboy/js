const express = require('express');
const app = express();
const port = 8080;

const path = require('path');
const fs = require('fs');

app.get('/dir', (req, res) => {
  fs.readdir(path.join(__dirname, '..'), (err, files) => {
    res.send(
      files.filter(file => path.extname(file) == "")
    );
  });
});

app.use('/', express.static(path.join(__dirname, '../')));

app.listen(port, () => {
  console.log(`listening on port ${port}`);
})
