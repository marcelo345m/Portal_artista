const express = require("express");
const { PrismaClient } = require("@prisma/client");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const cors = require("cors");
const dotenv = require("dotenv");
const { z } = require("zod"); 


dotenv.config(); 


const app = express();
const prisma = new PrismaClient();


app.use(cors({
  origin: "http://127.0.0.1:3000",
}));
app.use(express.json());


// **Função para criar o token**
const criar_token = (email) => {
  const payload = { email };
  const secret = process.env.JWT_SECRET;
  const options = { expiresIn: "1h" };


  return jwt.sign(payload, secret, options);
};


// **Esquema de validação para cadastro de artista e usuário**
const cadastroSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("E-mail inválido"),
  senha: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
  perfil: z.string().optional(),  
  area: z.string().optional(),    
  biografia: z.string().optional(),
  link: z.string().url().optional(),
  foto: z.string().optional(),
});


// **Rota de cadastro de artista e usuário**
app.post("/enviar_cadastro_de_artista", async (req, res) => {
  const { nome, email, perfil, senha, area, biografia, link, foto } = req.body;


  try {
    // Validando os dados com o Zod
    cadastroSchema.parse(req.body);


    const id_user = uuidv4();
    const senhaHash = await bcrypt.hash(senha, 10);


    // Cadastrar usuário
    await prisma.usuario.create({
      data: {
        UsuarioID: id_user,
        Nome: nome,
        Email: email,
        Senha: senhaHash,
        Perfil: perfil || "Público Geral",  
        DataCadastro: new Date().toISOString(),
        Ativo: true,
      },
    });


    // Cadastrar perfil de artista
    await prisma.perfisArtistas.create({
      data: {
        UsuarioID: id_user,
        AreaAtuacao: area, 
        Biografia: biografia,  
        LinkPortfolio: link,  
        FotoPerfil: foto,  
      },
    });


    res.status(201).json({ message: "Usuário e perfil cadastrados com sucesso" });
  } catch (error) {
    console.error(error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    res.status(500).json({ error: "Erro ao cadastrar usuário ou perfil" });
  }
});


// **Esquema de validação para login**
const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  senha: z.string().min(6, "Senha inválida"),
});


// **Rota de validação/login de usuário**
app.post("/validar", async (req, res) => {
  const { email, senha } = req.body;


  try {
    // Validando os dados com o Zod
    loginSchema.parse(req.body);


    const usuario = await prisma.usuario.findUnique({
      where: { Email: email },
    });


    if (!usuario) {
      return res.status(401).json({ error: "Credenciais inválidas" });
    }


    const senhaValida = await bcrypt.compare(senha, usuario.Senha);
    if (!senhaValida) {
      return res.status(401).json({ error: "Credenciais inválidas" });
    }


    const token = criar_token(email);
    res.status(200).json({ token, user: { id: usuario.UsuarioID, email } });
  } catch (error) {
    console.error(error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    res.status(500).json({ error: "Erro ao validar usuário" });
  }
});


// **Esquema de validação para criação de edital**
const editalSchema = z.object({
  titulo: z.string().min(1, "Título é obrigatório"),
  descricao: z.string().min(1, "Descrição é obrigatória"),
  categoria: z.string().min(1, "Categoria é obrigatória"),
  prazo: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Data do prazo é inválida",
  }),
  detalhes: z.string().optional(),
  criterios: z.string().optional(),
  processo: z.string().optional(),
  organizador: z.string().min(1, "Organizador é obrigatório"),
});


// **Rota para criar edital**
app.post("/editais", async (req, res) => {
  const { titulo, descricao, categoria, prazo, detalhes, criterios, processo, organizador } = req.body;


  try {
    // Validando os dados com o Zod
    editalSchema.parse(req.body);


    await prisma.editais.create({
      data: {
        Titulo: titulo,
        Descricao: descricao,
        CategoriaArtistica: categoria,
        PrazoInscricao: new Date(prazo).toISOString(),
        DetalhesFinanciamento: detalhes,
        CriteriosSelecao: criterios,
        ProcessoInscricao: processo,
        Organizador: organizador,
        DataPublicacao: new Date().toISOString(),
      },
    });


    res.status(201).json({ message: "Edital criado com sucesso" });
  } catch (error) {
    console.error(error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    res.status(500).json({ error: "Erro ao criar edital" });
  }
});


// **Middleware de erro**
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Ocorreu um erro no servidor" });
});


// **Inicializar o servidor**
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});


