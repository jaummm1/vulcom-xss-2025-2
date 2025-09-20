const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const app = express();

const db = new sqlite3.Database(':memory:');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.set('view engine', 'ejs');

// Criar tabela de comentários vulnerável
db.serialize(() => {
    db.run("CREATE TABLE comments (id INTEGER PRIMARY KEY, content TEXT)");
    db.run("INSERT INTO comments (content) VALUES ('Bem-vindo ao desafio de XSS!')");
});

// Middleware para gerar cookie de sessão
app.use((req, res, next) => {
    // if (!req.cookies.session_id) {
    //     res.cookie('session_id', 'FLAG{XSS_SESSION_LEAK}', { httpOnly: false }); // VULNERÁVEL A XSS 🚨
    // }
    
    // // *** SOLUÇÃO XSS 3: Uso de cookie HTTPOnly = true
    if (!req.cookies.session_id) {
        res.cookie('session_id', 'FLAG{XSS_SESSION_LEAK}', { httpOnly: true }); // VULNERÁVEL A XSS 🚨
    }
    next();
});

// Rota principal
app.get('/', (req, res) => {
    db.all("SELECT * FROM comments", [], (err, rows) => {
        if (err) {
            return res.send('Erro ao carregar comentários');
        }
        res.render('comments', { comments: rows });
    });
});

// Rota para enviar comentários (VULNERÁVEL a XSS 🚨)
app.post('/comment', (req, res) => {
    const { content } = req.body;
    db.run(
        "INSERT INTO comments (content) VALUES (?)", 
        [content], 
        (err) => {
            if (err) {
                return res.send('Erro ao salvar comentário');
            }
            res.redirect('/');
        }
)   ;
});

app.listen(3000, () => {
    console.log('Servidor rodando em http://localhost:3000');
});