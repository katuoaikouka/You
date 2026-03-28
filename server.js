const express = require('express');
const axios = require('axios');
const cookieParser = require('cookie-parser');
const path = require('path');

const app = express();
const PORT = 3000;

// Invidious APIのベースURL (不安定な場合は https://api.invidious.io/ で別のURLを探せます)
const API_BASE = "https://iv.ggtyler.dev/api/v1";

app.set('view engine', 'ejs');
app.use(cookieParser());
app.use(express.static('public'));

// 1. トップページ
app.get('/', (req, res) => {
    res.render('index');
});

// 2. 検索結果ページ
app.get('/search', async (req, res) => {
    const query = req.query.q || "";
    const page = parseInt(req.query.p) || 1;

    if (!query) return res.redirect('/');

    try {
        const response = await axios.get(`${API_BASE}/search`, {
            params: { q: query, page: page, type: "video" }
        });
        res.render('search', { 
            query: query, 
            results: response.data, 
            page: page 
        });
    } catch (error) {
        console.error("Search Error:", error.message);
        res.status(500).send("検索結果の取得に失敗しました。時間をおいて試してください。");
    }
});

// 3. 再生ページ
app.get('/w/:id', async (req, res) => {
    const videoId = req.params.id;
    const playbackMode = req.cookies.playbackMode || 'normal';

    try {
        const response = await axios.get(`${API_BASE}/videos/${videoId}`);
        res.render('watch', { 
            video: response.data, 
            playbackMode: playbackMode 
        });
    } catch (error) {
        console.error("Watch Error:", error.message);
        res.status(404).send("動画が見つかりませんでした。");
    }
});

app.listen(PORT, () => {
    console.log(`Server started at http://localhost:${PORT}`);
});
