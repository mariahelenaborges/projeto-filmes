const express = require('express');
const exphbs = require('express-handlebars');
const methodOverride = require('method-override');

const sequelize = require('./config/bd');
const Filme = require('./models/filme.model');
const Diretor = require('./models/diretor.model');
const Artista = require('./models/artista.model');
const FichaTecnica = require('./models/fichaTecnica.model');
require('./models/relacionamentosModels');

const app = express();

app.use(methodOverride('_method'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// defaultLayout 'main' = usa o arquivo views/layouts/main.handlebars
app.engine('handlebars', exphbs.engine({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');


app.get('/', (req, res) => {
  res.render('home', { titulo: 'Catálogo de Filmes' });
});


app.get('/filmes', async (req, res) => {
  const filmes = await Filme.findAll({ raw: true });
  res.render('filmes', { filmes });
});

app.get('/filmes/cadastrar', async (req, res) => {
  const diretores = await Diretor.findAll({ raw: true });
  const artistas = await Artista.findAll({ raw: true });
  res.render('cadastrarFilme', { diretores, artistas });
});

app.post('/filmes', async (req, res) => {
  const nome = req.body.nome;
  const ano = req.body.ano;
  const diretorId = req.body.diretorId;
  const artistas = req.body.artistas; // ids marcados no select multiple

  const filme = await Filme.create({
    nome: nome,
    ano: ano,
    diretorId: diretorId || null
  });

  if (artistas) {
    await filme.setArtistas(artistas);
  }

  res.redirect('/filmes');
});

app.get('/filmes/:id', async (req, res) => {
  const id = req.params.id;

  const filme = await Filme.findByPk(id, {
    include: [
      { model: Diretor, as: 'diretor' },
      { model: Artista, as: 'artistas' },
      { model: FichaTecnica, as: 'fichaTecnica' }
    ]
  });

  res.render('detalharFilme', { filme: filme.toJSON() });
});

app.get('/filmes/:id/editar', async (req, res) => {
  const id = req.params.id;
  const filme = await Filme.findByPk(id, { raw: true });
  res.render('editarFilme', { filme });
});

app.put('/filmes/:id', async (req, res) => {
  const id = req.params.id;
  const filme = await Filme.findByPk(id);

  filme.nome = req.body.nome;
  filme.ano = req.body.ano;
  await filme.save();

  res.redirect('/filmes');
});

app.delete('/filmes/:id', async (req, res) => {
  const id = req.params.id;
  const filme = await Filme.findByPk(id);
  await filme.destroy();
  res.redirect('/filmes');
});

app.get('/diretores', async (req, res) => {
  const diretores = await Diretor.findAll({ raw: true });
  res.render('diretores', { diretores });
});

app.get('/diretores/cadastrar', (req, res) => {
  res.render('cadastrarDiretor');
});

app.post('/diretores', async (req, res) => {
  await Diretor.create({
    nome: req.body.nome,
    dataNascimento: req.body.dataNascimento,
    nacionalidade: req.body.nacionalidade
  });
  res.redirect('/diretores');
});

app.get('/diretores/:id', async (req, res) => {
  const id = req.params.id;

  const diretor = await Diretor.findByPk(id, {
    include: [{ model: Filme, as: 'filmes' }]
  });

  res.render('detalharDiretor', { diretor: diretor.toJSON() });
});


app.get('/artistas', async (req, res) => {
  const artistas = await Artista.findAll({ raw: true });
  res.render('artistas', { artistas });
});

app.get('/artistas/cadastrar', (req, res) => {
  res.render('cadastrarArtista');
});

app.post('/artistas', async (req, res) => {
  await Artista.create({
    nome: req.body.nome,
    dataNascimento: req.body.dataNascimento,
    nomeArtistico: req.body.nomeArtistico
  });
  res.redirect('/artistas');
});

app.get('/artistas/:id', async (req, res) => {
  const id = req.params.id;

  const artista = await Artista.findByPk(id, {
    include: [{ model: Filme, as: 'filmes' }]
  });

  res.render('detalharArtista', { artista: artista.toJSON() });
});

app.get('/fichas-tecnicas', async (req, res) => {
  const resultado = await FichaTecnica.findAll({
    include: [{ model: Filme, as: 'filme' }]
  });

  const fichas = resultado.map(ficha => ficha.toJSON());

  res.render('fichasTecnicas', { fichas });
});

app.get('/filmes/:id/ficha-tecnica/cadastrar', async (req, res) => {
  const id = req.params.id;
  const filme = await Filme.findByPk(id, { raw: true });
  res.render('cadastrarFichaTecnica', { filme });
});

app.post('/filmes/:id/ficha-tecnica', async (req, res) => {
  const id = req.params.id;
  const filme = await Filme.findByPk(id);

  await filme.createFichaTecnica({
    duracaoMinutos: req.body.duracaoMinutos,
    orcamento: req.body.orcamento,
    bilheteria: req.body.bilheteria
  });

  res.redirect(`/filmes/${id}`);
});

app.get('/fichas-tecnicas/:id', async (req, res) => {
  const id = req.params.id;

  const ficha = await FichaTecnica.findByPk(id, {
    include: [{ model: Filme, as: 'filme' }]
  });

  res.render('detalharFichaTecnica', { ficha: ficha.toJSON() });
});


async function conectarBD() {
  try {
    await sequelize.sync();
    console.log('Conexão com o banco de dados estabelecida com sucesso!');
  } catch (erro) {
    console.error('Erro ao conectar:', erro);
  }
}

conectarBD();

app.listen(3000, () => {
  console.log('Servidor executando em http://localhost:3000');
});