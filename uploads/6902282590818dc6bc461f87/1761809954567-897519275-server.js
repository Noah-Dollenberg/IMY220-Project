// p1 NJ (Noah) Dollenberg u24596142

const app = require('express')();
const path = require('path');

app.get('/', (req, res) => {
    return res.sendFile(path.join(__dirname, 'html/index.html'));
})

app.get('/date', (req, res) => {
    return res.json({ date: new Date() });
})

app.get('/ping', (req, res) => {
    return res.json({ message: 'pong' });
})

const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})
