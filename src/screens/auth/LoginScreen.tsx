import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuthContext } from '../../contexts/AuthContext';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { BrandMark } from '../../components/layout/BrandMark';

export function LoginScreen() {
  const navigate = useNavigate();
  const { signIn } = useAuthContext();
  const [email, setEmail] = useState('admin@healthsys.local');
  const [password, setPassword] = useState('Admin@123');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setError('');
    setIsSubmitting(true);

    try {
      await signIn({ email, password });
      navigate('/dashboard');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Nao foi possivel autenticar');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-sand">
      {/* Mobile hero strip (< lg) */}
      <div className="lg:hidden bg-ember px-5 py-6">
        <BrandMark />
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Badge label="Sprint 1-4" tone="soft" />
          <span className="text-sm text-white/80">admin@healthsys.local / Admin@123</span>
        </div>
      </div>

      {/* Main layout */}
      <div className="flex min-h-[calc(100vh-88px)] flex-col lg:min-h-screen lg:flex-row">
        {/* Hero panel – desktop only */}
        <section className="relative hidden flex-1 overflow-hidden rounded-none border-r border-stone bg-ember px-8 py-10 shadow-soft lg:flex lg:flex-col">
          <div className="absolute -left-8 -top-8 h-40 w-40 rounded-full bg-white/12" />
          <div className="absolute -bottom-12 right-0 h-44 w-44 rounded-full bg-cocoa/20" />

          <BrandMark />

          <div className="mt-10 max-w-xl">
            <Badge label="Sprint 1-4" tone="soft" />
            <h2 className="mt-4 text-4xl font-black leading-tight text-white xl:text-5xl">
              Plataforma hospitalar distribuida com entrada rapida, cadastro e controle administrativo.
            </h2>
            <p className="mt-4 text-base leading-7 text-white/90">
              Esta base entrega o front web do HealthSys SaaS com login, dashboard, usuarios e pacientes,
              usando uma camada de API configuravel e fallback local para demonstracao sem backend.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <span className="rounded-full bg-white/15 px-4 py-2 text-sm font-bold text-white">
              React + TypeScript
            </span>
            <span className="rounded-full bg-white/15 px-4 py-2 text-sm font-bold text-white">
              Tailwind CSS
            </span>
            <span className="rounded-full bg-white/15 px-4 py-2 text-sm font-bold text-white">
              API configuravel
            </span>
          </div>

          <div className="mt-auto pt-10 rounded-3xl border border-white/20 bg-white/10 p-4">
            <div className="text-xs font-bold uppercase tracking-[0.28em] text-white/80">
              Credenciais demo
            </div>
            <div className="mt-2 text-sm text-white">admin@healthsys.local / Admin@123</div>
          </div>
        </section>

        {/* Form */}
        <div className="flex flex-1 items-center justify-center px-4 py-8 sm:px-6 lg:px-10 lg:py-0">
          <Card className="w-full max-w-md justify-center bg-white/95">
            <div className="grid gap-6">
              <div className="grid gap-2">
                <div className="text-xs font-bold uppercase tracking-[0.3em] text-clay">
                  Acesso restrito
                </div>
                <h1 className="text-3xl font-black text-ink">Entrar no painel</h1>
                <p className="text-sm leading-6 text-cocoa">
                  O fluxo local autentica com a mesma estrutura de contrato que o backend real vai expor.
                </p>
              </div>

              <Input
                label="E-mail"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="admin@healthsys.local"
                type="email"
              />
              <Input
                label="Senha"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Sua senha"
                type="password"
              />

              {error ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {error}
                </div>
              ) : null}

              <Button
                label={isSubmitting ? 'Entrando' : 'Acessar sistema'}
                onClick={handleSubmit}
                disabled={isSubmitting}
                fullWidth
              />

              <div className="rounded-3xl border border-stone bg-panelSoft px-4 py-4">
                <div className="text-xs font-bold uppercase tracking-[0.28em] text-clay">
                  Objetivo da entrega
                </div>
                <p className="mt-2 text-sm leading-6 text-cocoa">
                  Login, dashboard, cadastro de usuarios e gerenciamento de pacientes prontos para evoluir
                  na integracao real.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
