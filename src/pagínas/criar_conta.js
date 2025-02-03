import styles from "../Assets/css/criar_conta.module.css";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Criar_conta() {
    const [form, setForm] = useState({
        nome: "",
        email: "",
        perfil: "Público Geral",
        area: "",
        biografia: "",
        link: "",
        senha: "",
    });
    const [foto, setFoto] = useState(null); // Para armazenar o arquivo da foto
    const [erro, setErro] = useState("");
    const navigate = useNavigate();

    function dados_form(e) {
        setForm({
            ...form,
            [e.target.id]: e.target.value,
        });
    }

    function handleFotoChange(e) {
        setFoto(e.target.files[0]); // Armazena o arquivo da foto
    }

    async function enviar(e) {
        e.preventDefault();

        if (!form.nome || !form.email || !form.area || !form.senha) {
            setErro("Por favor, preencha todos os campos obrigatórios.");
            return;
        }

        const formData = new FormData();
        Object.keys(form).forEach(key => formData.append(key, form[key]));
        if (foto) formData.append("foto", foto); // Adiciona o arquivo da foto

        try {
            let resposta = await fetch("http://localhost:3001/enviar_cadastro_de_artista", {
                method: "POST",
                body: formData, // Envia o formulário com o arquivo
            });

            if (resposta.ok) {
                alert("Conta criada com sucesso!");
                navigate("/portal_artistas");
            } else {
                const erro = await resposta.json();
                setErro(erro.message || "Erro ao criar a conta. Tente novamente.");
            }
        } catch (error) {
            console.error("Erro:", error);
            setErro("Erro ao criar a conta. Verifique os dados e tente novamente.");
        }
    }

    return (
        <div className={styles.corpo}>
            <form className={styles.formulario} onSubmit={enviar}>
                <h1 className={styles.titulo}>Abra uma conta</h1>
                <p className={styles.texto}>É gratuito</p>

                {erro && <p className={styles.erro}>{erro}</p>}

                <input className={styles.campos_form} id="nome" required onChange={dados_form} placeholder="Nome:" type="text" />
                <input className={styles.campos_form} id="email" required onChange={dados_form} placeholder="Seu e-mail:" type="email" />
                <select className={styles.campos_form} id="perfil" onChange={dados_form}>
                    <option>Público Geral</option>
                    <option>Público Privado</option>
                </select>
                <input className={styles.campos_form} id="area" required onChange={dados_form} placeholder="Área de atuação:" type="text" />
                <textarea className={styles.campos_form} id="biografia" onChange={dados_form} placeholder="Insira sua Biografia:" />
                <input className={styles.campos_form} id="link" onChange={dados_form} placeholder="Insira o link dos seus repositórios:" type="text" />
                <input className={styles.campos_form} id="senha" required onChange={dados_form} placeholder="Senha:" type="password" />

                <label>Foto de Perfil:</label>
                <input className={styles.campos_form} type="file" onChange={handleFotoChange} accept="image/*" />

                <div className={styles.abrir_conta}>
                    <input type="submit" className={styles.botao_abrir_conta} value="Abrir conta" />
                </div>
            </form>
        </div>
    );
}

