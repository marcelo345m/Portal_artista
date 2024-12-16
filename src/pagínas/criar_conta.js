import styles from "../Assets/css/criar_conta.module.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";


export default function Criar_conta() {
    const [form, setForm] = useState({
        nome: "",
        email: "",
        perfil: "Público Geral",
        area: "",
        biografia: "",
        link: "",
        foto: "",
        senha: "",
    });


    const [erro, setErro] = useState("");
    const [carregando, setCarregando] = useState(false);
    const navigate = useNavigate();


    function dados_form(e) {
        setForm({
            ...form,
            [e.target.id]: e.target.value,
        });
    }


    // Função de validação
    function validarCadastro() {
        const erros = [];
        if (!form.nome) erros.push("O nome é obrigatório.");
        if (!form.email) erros.push("O email é obrigatório.");
        if (!/\S+@\S+\.\S+/.test(form.email)) erros.push("O email não é válido.");
        if (!form.senha || form.senha.length < 6) erros.push("A senha deve ter pelo menos 6 caracteres.");
        return erros;
    }


    // Função para envio dos dados
    async function enviar(e) {
        e.preventDefault();


        const erros = validarCadastro();
        if (erros.length) {
            setErro(erros.join(" "));
            return;
        }


        setCarregando(true);


        try {
            const resposta = await fetch("http://localhost:3001/enviar_cadastro_de_artista", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });


            const respostaData = await resposta.json();
            if (resposta.ok) {
                alert("Conta criada com sucesso!");
                navigate("/portal_artistas");
            } else {
                setErro(respostaData.error || "Erro ao criar a conta. Tente novamente.");
            }
        } catch (error) {
            console.error("Erro na requisição:", error);
            setErro("Erro ao criar a conta. Verifique os dados e tente novamente.");
        } finally {
            setCarregando(false);
        }
    }


    return (
        <div className={styles.corpo}>
            <form className={styles.formulario} onSubmit={enviar}>
                <h1 className={styles.titulo}>Abra uma conta</h1>
                <p className={styles.texto}>É gratuito</p>


                {/* Exibindo mensagem de erro, se houver */}
                {erro && (
                    <div className={styles.erro}>
                        {erro.split(" ").map((mensagem, index) => (
                            <p key={index}>{mensagem}</p>
                        ))}
                    </div>
                )}


                <input
                    className={styles.campos_form}
                    id="nome"
                    onChange={dados_form}
                    placeholder="Nome:"
                    type="text"
                    value={form.nome}
                />
                <input
                    className={styles.campos_form}
                    id="email"
                    onChange={dados_form}
                    placeholder="Seu e-mail:"
                    type="email"
                    value={form.email}
                />
                <select
                    className={styles.campos_form}
                    id="perfil"
                    onChange={dados_form}
                    value={form.perfil}
                >
                    <option value="Público Geral">Público Geral</option>
                    <option value="Público Privado">Público Privado</option>
                </select>
                <input
                    className={styles.campos_form}
                    id="area"
                    onChange={dados_form}
                    placeholder="Área de atuação:"
                    type="text"
                    value={form.area}
                />
                <textarea
                    className={styles.campos_form}
                    id="biografia"
                    onChange={dados_form}
                    placeholder="Insira sua Biografia:"
                    value={form.biografia}
                />
                <input
                    className={styles.campos_form}
                    id="link"
                    onChange={dados_form}
                    placeholder="Insira o link dos seus repositórios:"
                    type="text"
                    value={form.link}
                />
                <input
                    className={styles.campos_form}
                    id="senha"
                    onChange={dados_form}
                    placeholder="Senha:"
                    type="password"
                    value={form.senha}
                />
                <input
                    className={styles.campos_form}
                    id="foto"
                    onChange={dados_form}
                    placeholder="Link da foto de perfil:"
                    type="text"
                    value={form.foto}
                />


                <div className={styles.abrir_conta}>
                    <button className={styles.botao_abrir_conta} type="submit" disabled={carregando}>
                        {carregando ? "Carregando..." : "Abrir conta"}
                    </button>
                </div>
            </form>
        </div>
    );
}


