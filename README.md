# 🚫 Não Pode!

Bem-vindo ao **Não Pode!**, uma versão digital moderna e divertida do clássico jogo de adivinhação "Tabu". O objetivo é simples: faça sua equipe adivinhar a palavra secreta sem dizer nenhuma das palavras proibidas!

![Status do Projeto](https://img.shields.io/badge/Status-Em_Desenvolvimento-yellow)
![AI Engineered](https://img.shields.io/badge/AI-Encoded_by_Google_Gemini-blue)

## 🤖 Jogo Desenvolvido por IA

Este projeto foi **inteiramente arquitetado e codificado com a assistência de Inteligência Artificial**. 
Utilizando modelos avançados de IA (Google Gemini), desde a concepção da interface até a lógica de estado global e persistência de dados.


## 🎮 Como Jogar

1.  **Forme Equipes**: Divida os jogadores em 2 ou mais equipes.
2.  **Configure**: Escolha o tempo da rodada, número de cartas e se deseja ativar o modo "Prendas".
3.  **Jogue**:
    *   Um jogador (o "Dador de Dicas") vê a carta no celular/computador.
    *   Ele deve descrever a **Palavra Chave** (no topo) para sua equipe.
    *   **NÃO PODE** dizer nenhuma das 5 palavras proibidas listadas abaixo.
4.  **Pontue**:
    *   ✅ **Acertou**: Se a equipe adivinhar, ganha 1 ponto.
    *   🚫 **Tabu**: Se o jogador disser uma palavra proibida, a carta é anulada. Se o modo "Prendas" estiver ativo, ele deve cumprir um desafio!
    *   ⏩ **Pular**: Pode-se pular cartas (configurável), sem pontuar.
    *   **Penalidade de Prenda**: Se um jogador se recusar ou falhar em cumprir a prenda, a equipe perde **1 ponto**!

## 🚀 Tecnologias Utilizadas

*   **Frontend**: React (Vite)
*   **Linguagem**: TypeScript
*   **Estilização**: Tailwind CSS (Design System responsivo e animações)
*   **Gerenciamento de Estado**: Zustand
*   **Roteamento**: React Router
*   **Ícones**: Lucide React
*   **Persistência**: Offline-first com JSON estático e LocalStorage

## 🛠️ Como Rodar Localmente

1.  Clone o repositório:
    ```bash
    git clone https://github.com/seu-usuario/nao-pode.git
    cd nao-pode
    ```

2.  Instale as dependências:
    ```bash
    npm install
    ```

3.  Rode o servidor de desenvolvimento:
    ```bash
    npm run dev
    ```

4.  Abra no seu navegador (geralmente em `http://localhost:5173`).

---

<div align="center">
  <p>Feito com 💜 e muita IA.</p>
</div>
