
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from './Toast';
import { EyeIcon, EyeSlashIcon } from './icons';

type AuthView = 'login' | 'signup' | 'forgot-password';

export const Auth: React.FC = () => {
  const [view, setView] = useState<AuthView>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login, signup, resetPassword } = useAuth();
  const { addToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (view === 'login') {
        await login(email, password);
      } else if (view === 'signup') {
        await signup(email, password, name);
      } else if (view === 'forgot-password') {
        await resetPassword(email);
        setView('login'); // Return to login after request
      }
    } catch (error: any) {
        console.error('Auth error:', error);
        let msg = 'Ocorreu um erro. Tente novamente.';
        
        if (error.message) {
             if (error.message.includes('Invalid login')) msg = 'E-mail ou senha incorretos.';
             else if (error.message.includes('already registered')) msg = 'Este e-mail já está cadastrado.';
             else if (error.message.includes('weak password')) msg = 'A senha deve ter pelo menos 6 caracteres.';
             else if (error.message.includes('rate limit')) msg = 'Muitas tentativas. Aguarde um pouco.';
             else if (error.message.includes('Database error')) msg = 'Erro ao criar conta. Tente novamente em alguns instantes.';
             else if (error.message.includes('Failed to fetch')) msg = 'Erro de conexão. Verifique sua internet.';
             else msg = error.message;
        }
        addToast(msg, 'error');
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center py-12 sm:px-6 lg:px-8 animate-in fade-in duration-500">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">CurriculumPro Studio</h1>
        <h2 className="mt-6 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900 dark:text-gray-100">
          {view === 'login' && 'Acesse sua conta'}
          {view === 'signup' && 'Crie sua conta grátis'}
          {view === 'forgot-password' && 'Recuperar Senha'}
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
        <div className="bg-white dark:bg-gray-800 px-6 py-12 shadow-xl sm:rounded-lg sm:px-12 border border-gray-200 dark:border-gray-700">
          <form className="space-y-6" onSubmit={handleSubmit}>
            
            {view === 'signup' && (
                <div>
                  <label htmlFor="name" className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200">
                    Nome Completo
                  </label>
                  <div className="mt-2">
                    <input
                      id="name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700/50 text-gray-900 dark:text-gray-100"
                      placeholder="Seu nome"
                    />
                  </div>
                </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200">
                Endereço de e-mail
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700/50 text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>

            {view !== 'forgot-password' && (
                <div>
                  <div className="flex items-center justify-between">
                      <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200">
                        Senha
                      </label>
                      {view === 'login' && (
                          <button 
                            type="button" 
                            onClick={() => setView('forgot-password')}
                            className="text-sm font-medium text-blue-600 hover:text-blue-500"
                          >
                              Esqueceu a senha?
                          </button>
                      )}
                  </div>
                  <div className="mt-2 relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete={view === 'login' ? 'current-password' : 'new-password'}
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700/50 text-gray-900 dark:text-gray-100"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none"
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="h-5 w-5" aria-hidden="true" />
                      ) : (
                        <EyeIcon className="h-5 w-5" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-colors disabled:opacity-70 disabled:cursor-wait"
              >
                {isLoading ? 'Processando...' : 
                    view === 'login' ? 'Entrar' : 
                    view === 'signup' ? 'Criar conta' : 
                    'Enviar e-mail de recuperação'
                }
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
              {view === 'forgot-password' ? (
                  <button onClick={() => setView('login')} className="text-sm font-medium text-gray-500 hover:text-gray-400">
                      Voltar para Login
                  </button>
              ) : (
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                      {view === 'login' ? 'Não é um membro?' : 'Já tem uma conta?'}{' '}
                      <button onClick={() => setView(view === 'login' ? 'signup' : 'login')} className="font-semibold leading-6 text-blue-600 hover:text-blue-500">
                        {view === 'login' ? 'Cadastre-se' : 'Faça login'}
                      </button>
                  </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};
