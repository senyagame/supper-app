const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'database', 'data.json');

app.use(express.json());
app.use(express.static('public'));

app.post('/save-post', (req, res) => {
    const newPost = req.body;
    fs.readFile(DATA_FILE, (err, data) => {
        if (err) throw err;
        const posts = JSON.parse(data);
        posts.push(newPost);
        fs.writeFile(DATA_FILE, JSON.stringify(posts), (err) => {
            if (err) throw err;
            res.status(200).send('Post saved');
        });
    });
});

app.get('/load-posts', (req, res) => {
    fs.readFile(DATA_FILE, (err, data) => {
        if (err) throw err;
        const posts = JSON.parse(data);
        res.json(posts);
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});