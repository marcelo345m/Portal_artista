import styles from "../Assets/css/login.module.css";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import imagem from "../Assets/img/img login/Mensagem.png";
import { z } from "zod";


// Esquema de validação do Zod
const loginSchema = z.object({
    email: z.string().email("O e-mail deve ser válido"),
    senha: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
});


export default function Login() {
    const [dados, setDados] = useState({
        email: "",
        senha: "",
    });


    const [erro, setErro] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();


    function pegar_dados(e) {
        setDados({
            ...dados,
            [e.target.id]: e.target.value,
        });
    }


    // Função de login
    const login = async (e) => {
        e.preventDefault();


        // Validando os dados com Zod
        try {
            loginSchema.parse(dados);
        } catch (err) {
            setErro(err.errors[0].message);
            return;
        }


        // Resetando erro
        setErro("");
        setLoading(true);


        try {
            const response = await fetch("http://localhost:3001/validar", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: dados.email,
                    senha: dados.senha,
                }),
            });


            const dados2 = await response.json();


            if (dados2.token) {
                localStorage.setItem("token", dados2.token);
                navigate("/dashboard");
            } else {
                setErro("Email ou senha estão incorretos.");
            }
        } catch (error) {
            console.error("Erro ao fazer login:", error);
            setErro("Ocorreu um erro. Tente novamente mais tarde.");
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className={styles.corpo}>
            <div className={styles.parte1}>
                <h1 className={styles.titulo}>Bem-Vindo</h1>
                <p className={styles.texto}>Nosso Site? Registre-se</p>


                {erro && <p className={styles.erro}>{erro}</p>}


                <form className={styles.box1} onSubmit={login}>
                    <input
                        className={styles.campos_form}
                        id="email"
                        onChange={pegar_dados}
                        placeholder="Email:"
                        type="text"
                    />
                    <input
                        className={styles.campos_form}
                        id="senha"
                        onChange={pegar_dados}
                        placeholder="Senha:"
                        type="password"
                    />
                    <input
                        className={`${styles.campos_form} ${styles.botao_enviar}`}
                        type="submit"
                        value={loading ? "Carregando..." : "Entrar"}
                        disabled={loading}
                    />


                    <Link to="/recuperar_senha">
                        <p className={styles.esquece_senha}>Esqueceu a Senha?</p>
                    </Link>


                    <hr className={styles.divisao} />


                    <Link to="/criar_conta">
                        <input
                            className={`${styles.campos_form} ${styles.botao_azul}`}
                            type="button"
                            value="Criar uma conta"
                        />
                    </Link>
                </form>
            </div>


            <div className={styles.container_img}>
                <img className={styles.mensagem} src={imagem} alt="Desperte sua criatividade" />
            </div>
        </div>
    );
}
