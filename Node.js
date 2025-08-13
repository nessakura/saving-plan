// server.js
const express = require('express');
const fetch = require('node-fetch');
const app = express();
app.use(express.json());

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = 'nessakura';
const REPO_NAME = 'saving-plan';
const FILE_PATH = 'savings.csv';

app.post('/update-csv', async (req, res) => {
    const { date, amount } = req.body;
    try {
        const response = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`, {
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        const data = await response.json();
        let content = data.content ? atob(data.content) : 'date,amount\n';
        content += `${date},${amount}\n`;
        const updateResponse = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: `Update savings.csv with new entry: ${date}`,
                content: Buffer.from(content).toString('base64'),
                sha: data.sha
            })
        });
        if (!updateResponse.ok) throw new Error('Failed to update CSV');
        res.status(200).send('CSV updated');
    } catch (error) {
        res.status(500).send('Error updating CSV: ' + error.message);
    }
});

app.listen(process.env.PORT || 3000, () => console.log('Server running'));
