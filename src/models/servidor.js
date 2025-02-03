import dotenv from "dotenv";
import express from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import cors from "cors";
import nodemailer from "nodemailer"; // Importando o Nodemailer
import { validacao, criar_token } from "./authMiddleware.js";
import { z } from "zod";

dotenv.config(); // Carregar variáveis de ambiente

const app = express();
const prisma = new PrismaClient();

app.use(cors({
  origin: "*", 
  methods: "GET, POST"
}));
app.use(express.json());

// Configuração do Nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// **Rota de cadastro de artista e usuário**
app.post("/enviar_cadastro_de_artista", 
  validacao(
    z.object({
      body: z.object({
        nome: z.string().min(1),
        email: z.string().email(),
        senha: z.string().min(6),
        perfil: z.string().optional(),
        area: z.string().min(1),
        biografia: z.string().optional(),
        link: z.string().url().optional(),
        foto: z.string().optional(),
    })
  })),  
  async (req, res) => {
  const { nome, email, perfil, senha, area, biografia, link, foto } = req.body;

  try {
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

    // Enviar e-mail de confirmação
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Cadastro realizado com sucesso!",
      text: `Olá ${nome}, seu cadastro no portal foi realizado com sucesso!`,
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

// **Rota para recuperação de senha**
app.post("/recuperar-senha", async (req, res) => {
  const { email } = req.body;

  try {
    // Verificar se o usuário existe
    const usuario = await prisma.usuario.findUnique({
      where: { Email: email },
    });

    if (!usuario) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    // Gerar um token para redefinir a senha (usando uuid ou jwt)
    const tokenRedefinicao = uuidv4(); // ou use jwt.sign() se preferir
    const linkDeRedefinicao = `http://localhost:3000/redefinir-senha/${tokenRedefinicao}`;

    // Armazenar o token no banco de dados (relacionado ao usuário) para validação posterior
    await prisma.redefinicaoSenha.create({
      data: {
        UsuarioID: usuario.UsuarioID,
        Token: tokenRedefinicao,
        Valido: true,
        Expiracao: new Date(Date.now() + 3600000), // O token expira em 1 hora
      },
    });

    // Enviar o e-mail com o link para redefinir a senha
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Redefinir senha - Portal Artista",
      text: `Olá ${usuario.Nome}, clique no link abaixo para redefinir sua senha:\n\n${linkDeRedefinicao}`,
    });

    res.status(200).json({ message: "E-mail de recuperação enviado com sucesso!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao tentar recuperar a senha" });
  }
});

// **Rota para redefinir a senha**
app.post("/redefinir-senha", async (req, res) => {
  const { token, novaSenha } = req.body;

  try {
    // Verificar se o token é válido e não expirou
    const redefinicao = await prisma.redefinicaoSenha.findUnique({
      where: { Token: token },
    });

    if (!redefinicao || !redefinicao.Valido || new Date() > redefinicao.Expiracao) {
      return res.status(400).json({ error: "Token inválido ou expirado" });
    }

    // Atualizar a senha do usuário
    const senhaHash = await bcrypt.hash(novaSenha, 10);

    await prisma.usuario.update({
      where: { UsuarioID: redefinicao.UsuarioID },
      data: { Senha: senhaHash },
    });

    // Invalidar o token após o uso
    await prisma.redefinicaoSenha.update({
      where: { Token: token },
      data: { Valido: false },
    });

    res.status(200).json({ message: "Senha redefinida com sucesso!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao redefinir a senha" });
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
