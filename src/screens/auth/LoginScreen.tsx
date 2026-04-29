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
      <div className="bg-ember px-5 py-6 lg:hidden">
        <BrandMark />
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Badge label="HealthSys Distribuido" tone="soft" />
          <span className="text-sm text-white/80">admin@healthsys.local / Admin@123</span>
        </div>
      </div>

      <div className="flex min-h-[calc(100vh-88px)] flex-col lg:min-h-screen lg:flex-row">
        <section className="relative hidden flex-1 flex-col overflow-hidden border-r border-stone bg-ember px-8 py-10 shadow-soft lg:flex">
          <div className="absolute -left-8 -top-8 h-40 w-40 rounded-full bg-white/12" />
          <div className="absolute -bottom-12 right-0 h-44 w-44 rounded-full bg-cocoa/20" />

          <BrandMark />

          <div className="mt-10 max-w-2xl">
            <Badge label="HealthSys Distribuido" tone="soft" />
            <h2 className="mt-4 text-4xl font-black leading-tight text-white xl:text-5xl">
              Plataforma hospitalar para coordenar pacientes, acessos, triagens e comunicacoes clinicas.
            </h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-white/90">
              Acompanhe a operacao assistencial com autenticacao segura, perfis de acesso e integracao com os servicos distribuidos do
              HealthSys.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <span className="rounded-full bg-white/15 px-4 py-2 text-sm font-bold text-white">React + TypeScript</span>
            <span className="rounded-full bg-white/15 px-4 py-2 text-sm font-bold text-white">Tailwind CSS</span>
            <span className="rounded-full bg-white/15 px-4 py-2 text-sm font-bold text-white">API integrada</span>
          </div>

          <div className="mt-auto rounded-3xl border border-white/20 bg-white/10 p-4 pt-4">
            <div className="text-xs font-bold uppercase tracking-[0.28em] text-white/80">Acesso inicial</div>
            <div className="mt-2 text-sm text-white">admin@healthsys.local / Admin@123</div>
          </div>
        </section>

        <div className="flex flex-1 items-center justify-center px-4 py-8 sm:px-6 lg:px-10 lg:py-0">
          <Card className="w-full max-w-md justify-center bg-white/95">
            <div className="grid gap-6">
              <div className="grid gap-2">
                <div className="text-xs font-bold uppercase tracking-[0.3em] text-clay">Acesso restrito</div>
                <h1 className="text-3xl font-black text-ink">Entrar no painel</h1>
                <p className="text-sm leading-6 text-cocoa">Use uma conta cadastrada para acessar os modulos operacionais do HealthSys.</p>
              </div>

              <Input label="E-mail" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="admin@healthsys.local" type="email" />
              <Input label="Senha" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Sua senha" type="password" />

              {error ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div> : null}

              <Button label={isSubmitting ? 'Entrando' : 'Acessar sistema'} onClick={handleSubmit} disabled={isSubmitting} fullWidth />

              <div className="rounded-3xl border border-stone bg-panelSoft px-4 py-4">
                <div className="text-xs font-bold uppercase tracking-[0.28em] text-clay">Seguranca</div>
                <p className="mt-2 text-sm leading-6 text-cocoa">
                  A sessao usa token JWT, logout com revogacao e restricao de recursos conforme o perfil do usuario autenticado.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
