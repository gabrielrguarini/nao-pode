import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Ban, Check, AlertTriangle, AlertCircle } from 'lucide-react';
import { Button } from '../common/Button';

export const RulesScreen = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-purple-900 text-white p-6 overflow-y-auto">
            <header className="max-w-3xl mx-auto flex items-center mb-8">
                <button 
                    onClick={() => navigate(-1)} 
                    className="p-2 hover:bg-white/10 rounded-full transition-colors mr-4"
                >
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-3xl font-bold">Regras do Jogo</h1>
            </header>

            <div className="max-w-3xl mx-auto space-y-8 pb-12">
                <section className="bg-white/5 p-6 rounded-2xl border border-white/10">
                    <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-yellow-400">
                        <AlertCircle /> Objetivo
                    </h2>
                    <p className="text-lg opacity-90 leading-relaxed">
                        O objetivo é fazer sua equipe adivinhar a <strong>Palavra Chave</strong> no topo da carta, sem dizer nenhuma das <strong>Palavras Proibidas</strong> listadas abaixo dela.
                    </p>
                </section>

                <section className="grid md:grid-cols-2 gap-6">
                    <div className="bg-green-500/10 p-6 rounded-xl border border-green-500/30">
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-green-400">
                            <Check /> Pode
                        </h3>
                        <ul className="list-disc list-inside space-y-2 opacity-90">
                            <li>Fazer mímicas (se combinado antes)</li>
                            <li>Cantar ou tararolar</li>
                            <li>Usar sinônimos (que não estejam proíbidos)</li>
                            <li>Usar frases completas</li>
                        </ul>
                    </div>

                    <div className="bg-red-500/10 p-6 rounded-xl border border-red-500/30">
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-red-400">
                            <Ban /> Não Pode
                        </h3>
                        <ul className="list-disc list-inside space-y-2 opacity-90">
                            <li>Dizer a palavra chave</li>
                            <li>Dizer qualquer parte das palavras proibidas</li>
                            <li>Dizer a palavra traduzida em outra língua</li>
                            <li>Dizer "rima com..."</li>
                            <li>Soletrar a palavra</li>
                        </ul>
                    </div>
                </section>

                <section className="bg-white/5 p-6 rounded-2xl border border-white/10">
                    <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-red-400">
                        <AlertTriangle /> Penalidades e Prendas
                    </h2>
                    <div className="space-y-4 text-lg">
                        <p>
                            Se o jogador disser uma palavra proibida, um membro da equipe adversária deve apertar o botão <strong>TABU</strong> imediatamente.
                        </p>
                        <p>
                            <strong>Consequência:</strong>
                        </p>
                        <ul className="list-disc list-inside pl-4 space-y-2 opacity-90">
                            <li>A carta atual é descartada sem pontuar.</li>
                            <li>Se o modo <strong>Prendas</strong> estiver ativado, o jogador deve cumprir um desafio engraçado.</li>
                        </ul>
                        <div className="bg-red-900/40 p-4 rounded-lg border border-red-500/30 mt-4">
                            <h4 className="font-bold text-red-300 mb-2">⚠ Falha na Prenda</h4>
                            <p>
                                Quem não cumprir a prenda perde <strong>1 ponto</strong> para sua equipe!
                            </p>
                        </div>
                    </div>
                </section>

                <section className="bg-white/5 p-6 rounded-2xl border border-white/10">
                    <h2 className="text-2xl font-bold mb-4 text-purple-300">
                        Pontuação
                    </h2>
                    <ul className="space-y-3 opacity-90">
                        <li className="flex items-center gap-3">
                            <div className="bg-green-500 w-8 h-8 rounded-full flex items-center justify-center font-bold">+1</div>
                            <span>Para cada palavra adivinhada corretamente.</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <div className="bg-gray-500 w-8 h-8 rounded-full flex items-center justify-center font-bold">0</div>
                            <span>Se a carta for pulada (sem penalidade, se permitido).</span>
                        </li>
                         <li className="flex items-center gap-3">
                            <div className="bg-red-500 w-8 h-8 rounded-full flex items-center justify-center font-bold">-1</div>
                            <span>Se o jogador falhar em cumprir uma prenda.</span>
                        </li>
                    </ul>
                </section>
                
                <div className="text-center pt-8">
                    <Button onClick={() => navigate(-1)} size="lg">
                        Voltar
                    </Button>
                </div>
            </div>
        </div>
    );
};
