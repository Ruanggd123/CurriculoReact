
import React, { useState } from 'react';
import { PageWrapper } from './ContentPages';
import { CreditCardIcon, CheckIcon } from '../components/icons';

const InfoCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="glass rounded-2xl shadow-lg border border-white/10 overflow-hidden bg-slate-900/40 backdrop-blur-md">
        <div className="p-6">
            <h3 className="text-lg font-bold text-white mb-4 border-b border-gray-700/50 pb-2">{title}</h3>
            <div className="text-gray-300 space-y-3 text-sm">
                {children}
            </div>
        </div>
    </div>
);

const CancellationModal: React.FC<{ isOpen: boolean; onClose: () => void; }> = ({ isOpen, onClose }) => {
    const [step, setStep] = useState(1);
    const [reason, setReason] = useState('');

    const handleConfirm = () => {
        // Here you would call an API to cancel the subscription
        setStep(3);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="glass bg-[#1A2233] rounded-2xl shadow-2xl w-full max-w-lg border border-gray-700 animate-in fade-in zoom-in duration-200">
                <div className="p-8">
                    {step === 1 && (
                        <>
                            <h2 className="text-2xl font-bold text-white">Cancelar Assinatura</h2>
                            <p className="text-gray-400 mt-2">Lamentamos ver você ir. Por favor, conte-nos o motivo do cancelamento para que possamos melhorar.</p>
                            <div className="mt-6 space-y-3">
                                {['Muito caro', 'Não preciso mais', 'Tive problemas técnicos', 'Outro'].map(r => (
                                    <button key={r} onClick={() => setReason(r)} className={`w-full text-left p-3 rounded-xl border transition-all ${reason === r ? 'bg-blue-600/20 border-blue-500 text-white' : 'border-gray-600 hover:bg-white/5 text-gray-300'}`}>
                                        {r}
                                    </button>
                                ))}
                            </div>
                             <div className="mt-8 flex justify-end gap-3">
                                <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-300 rounded-lg hover:bg-white/10 transition-colors">Voltar</button>
                                <button onClick={() => setStep(2)} disabled={!reason} className="px-6 py-2 text-sm font-bold text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors shadow-lg shadow-red-900/20">Continuar</button>
                            </div>
                        </>
                    )}
                     {step === 2 && (
                        <>
                            <h2 className="text-2xl font-bold text-white">Uma última oferta...</h2>
                            <p className="text-gray-400 mt-2">Apreciamos tê-lo como cliente. Como um incentivo para ficar, oferecemos <span className="text-green-400 font-bold">30% de desconto</span> nos seus próximos 3 meses.</p>
                            <div className="mt-6 p-6 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl text-center border border-white/5 shadow-inner">
                                <p className="text-lg text-gray-300">Continue com todos os recursos Pro por apenas</p>
                                <p className="text-5xl font-extrabold text-white mt-2 tracking-tight">R$20,30<span className="text-lg font-normal text-gray-400">/mês</span></p>
                            </div>
                            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
                                <button onClick={() => { /* API call to apply discount */ onClose(); }} className="px-6 py-3 text-sm font-bold text-white bg-green-600 rounded-xl hover:bg-green-500 shadow-lg shadow-green-900/30 transition-all">Quero o desconto!</button>
                                <button onClick={handleConfirm} className="px-6 py-3 text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors">Não, obrigado. Cancelar.</button>
                            </div>
                        </>
                    )}
                    {step === 3 && (
                        <>
                            <div className="flex flex-col items-center text-center">
                                <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mb-4">
                                    <CheckIcon className="w-8 h-8 text-gray-400" />
                                </div>
                                <h2 className="text-2xl font-bold text-white">Assinatura Cancelada</h2>
                                <p className="text-gray-400 mt-2">Sua assinatura foi cancelada com sucesso. Você ainda terá acesso a todos os recursos Pro até o final do seu ciclo de faturamento atual.</p>
                                <div className="mt-8 w-full">
                                    <button onClick={onClose} className="w-full px-4 py-3 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-500 transition-colors">Entendi</button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export const SubscriptionPage: React.FC = () => {
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const invoices = [
        { date: '24/07/2024', amount: 'R$29,00', status: 'Pago', method: '**** 1234' },
        { date: '24/06/2024', amount: 'R$29,00', status: 'Pago', method: '**** 1234' },
        { date: '24/05/2024', amount: 'R$29,00', status: 'Pago', method: '**** 1234' },
    ];
    
    return (
        <>
        <PageWrapper>
            <div className="text-center mb-16">
                <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">Minha Assinatura</h1>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-slate-400">Gerencie seu plano e faturamento com total transparência.</p>
            </div>

            <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <InfoCard title="Resumo do Plano Atual">
                        <div className="flex justify-between items-center py-1"><span className="text-gray-400">Seu plano:</span> <span className="font-bold text-blue-400 bg-blue-400/10 px-3 py-1 rounded-full">Pro Mensal</span></div>
                        <div className="flex justify-between items-center py-1"><span className="text-gray-400">Próxima cobrança:</span> <span className="font-medium text-white">15 de Agosto de 2024</span></div>
                        <div className="flex justify-between items-center py-1"><span className="text-gray-400">Valor:</span> <span className="font-medium text-white">R$29,00</span></div>
                        <div className="pt-6 mt-2 border-t border-gray-700/50 flex flex-wrap gap-3">
                            <button className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-500 shadow-lg shadow-blue-900/20 transition-all">Alterar Plano</button>
                            <button onClick={() => setIsCancelModalOpen(true)} className="px-4 py-2 text-sm font-medium text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/10 transition-colors">Cancelar Renovação</button>
                        </div>
                    </InfoCard>

                    <div className="glass rounded-2xl shadow-lg border border-white/10 overflow-hidden bg-slate-900/40">
                        <div className="p-6">
                            <h3 className="text-lg font-bold text-white mb-6">Histórico de Faturas</h3>
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-sm">
                                    <thead className="text-left text-gray-500 uppercase tracking-wider text-xs">
                                        <tr>
                                            <th className="pb-4 font-semibold">Data</th>
                                            <th className="pb-4 font-semibold">Valor</th>
                                            <th className="pb-4 font-semibold">Status</th>
                                            <th className="pb-4 text-right font-semibold">Ação</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-gray-300">
                                        {invoices.map((invoice, i) => (
                                            <tr key={i} className="border-t border-gray-700/50 group hover:bg-white/5 transition-colors">
                                                <td className="py-4">{invoice.date}</td>
                                                <td className="py-4 font-medium text-white">{invoice.amount}</td>
                                                <td className="py-4"><span className="bg-green-500/20 text-green-400 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide border border-green-500/20">{invoice.status}</span></td>
                                                <td className="py-4 text-right"><button className="text-blue-400 hover:text-blue-300 font-medium text-xs">PDF</button></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                 <div className="space-y-8">
                    <InfoCard title="Forma de Pagamento">
                        <div className="flex items-center gap-4 p-2 bg-white/5 rounded-lg border border-white/5">
                            <div className="bg-gray-800 p-2 rounded">
                                <CreditCardIcon className="w-6 h-6 text-gray-200" />
                            </div>
                            <div>
                                <p className="font-semibold text-white text-sm">Mastercard **** 1234</p>
                                <p className="text-xs text-gray-500">Expira em 12/2026</p>
                            </div>
                        </div>
                         <div className="pt-4 mt-2">
                            <button className="text-blue-400 hover:text-blue-300 text-sm font-medium hover:underline transition-all">Adicionar novo cartão</button>
                        </div>
                    </InfoCard>

                    <div className="rounded-2xl p-6 bg-gradient-to-br from-green-900/40 to-emerald-900/40 border border-green-500/30 relative overflow-hidden shadow-lg">
                         <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-green-500/20 rounded-full blur-2xl"></div>
                         <h3 className="font-bold text-white text-lg mb-2 relative z-10">Economize 20%</h3>
                         <p className="text-sm text-green-100 mb-4 relative z-10">Mude para o plano anual e ganhe 2 meses grátis.</p>
                         <button className="w-full py-2 bg-white text-green-900 font-bold text-sm rounded-lg hover:bg-green-50 transition-colors shadow-lg relative z-10">Mudar para Anual</button>
                    </div>
                </div>
            </div>
        </PageWrapper>

        <CancellationModal isOpen={isCancelModalOpen} onClose={() => setIsCancelModalOpen(false)} />
        </>
    );
};
