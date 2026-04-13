'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { LogIn, AlertCircle, Eye, EyeOff } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Logo } from '@/components/layout/logo'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
    if (authError) {
      const msg = authError.message?.toLowerCase() ?? ''
      if (msg.includes('invalid') || msg.includes('credentials')) {
        setError('Email ou senha incorretos.')
      } else if (msg.includes('email not confirmed')) {
        setError('Email ainda nao verificado. Verifique sua caixa de entrada.')
      } else if (msg.includes('rate') || msg.includes('too many')) {
        setError('Muitas tentativas. Aguarde alguns minutos.')
      } else if (msg.includes('fetch') || msg.includes('network')) {
        setError('Erro de conexao. Verifique sua internet.')
      } else {
        setError('Erro ao fazer login. Tente novamente.')
      }
      setLoading(false)
      return
    }
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(0, 191, 255, 0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 191, 255, 0.04) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(0, 191, 255, 0.06) 0%, transparent 70%)' }} />
      </div>
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: 'easeOut' }} className="w-full max-w-md relative z-10">
        <div className="card-glass p-8">
          <div className="flex flex-col items-center mb-8"><Logo /><p className="text-sm text-text-secondary mt-3">Acesse o Painel do CTO</p></div>
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" /></div>
            <div className="space-y-2"><Label htmlFor="password">Senha</Label><div className="relative"><Input id="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div></div>
            {error && (<motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 text-sm text-status-negative bg-status-negative/10 px-3 py-2 rounded-lg"><AlertCircle className="h-4 w-4 shrink-0" />{error}</motion.div>)}
            <Button type="submit" className="w-full" disabled={loading}><LogIn className="h-4 w-4" />{loading ? 'Entrando...' : 'Entrar'}</Button>
          </form>
          <p className="text-xs text-text-muted text-center mt-6">Gradios Ecosystem · Confidencial</p>
        </div>
      </motion.div>
    </div>
  )
}
