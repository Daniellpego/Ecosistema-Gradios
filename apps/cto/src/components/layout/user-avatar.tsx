'use client'

import { useRef, useState, useCallback } from 'react'
import { Camera } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useCurrentUser } from '@/hooks/use-current-user'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface UserAvatarProps {
  size?: 'sm' | 'md' | 'lg'
  editable?: boolean
  className?: string
}

export function UserAvatar({ size = 'md', editable = false, className }: UserAvatarProps) {
  const { user } = useCurrentUser()
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const initials = user.nome
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'U'

  const sizeClasses = {
    sm: 'h-8 w-8 text-[10px]',
    md: 'h-10 w-10 text-[11px]',
    lg: 'h-14 w-14 text-sm',
  }

  const handleUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user.id) return

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Imagem muito grande. Máximo 2MB.')
      return
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Arquivo inválido. Selecione uma imagem.')
      return
    }

    setUploading(true)
    try {
      const supabase = createClient()
      const ext = file.name.split('.').pop()
      const path = `avatars/${user.id}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(path)

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl } as Record<string, unknown>)
        .eq('user_id', user.id)

      if (updateError) throw updateError

      await queryClient.invalidateQueries({ queryKey: ['current-user'] })
      toast.success('Foto atualizada!')
    } catch {
      toast.error('Erro ao atualizar foto. Tente novamente.')
    } finally {
      setUploading(false)
    }
  }, [user.id, queryClient])

  return (
    <div className={cn('relative group', className)}>
      <div
        className={cn(
          'rounded-full flex items-center justify-center font-bold overflow-hidden border-2 border-brand-cyan/20 transition-opacity',
          sizeClasses[size],
          uploading && 'opacity-50'
        )}
        style={{
          background: user.avatar_url ? undefined : 'linear-gradient(135deg, #00BFFF, #1A6AAA)',
          color: user.avatar_url ? undefined : '#FFFFFF',
        }}
      >
        {user.avatar_url ? (
          <img
            src={user.avatar_url}
            alt={user.nome}
            className="h-full w-full object-cover"
          />
        ) : (
          initials
        )}
      </div>

      {editable && (
        <>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="absolute -bottom-0.5 -right-0.5 h-6 w-6 rounded-full bg-brand-cyan text-white flex items-center justify-center shadow-md active:scale-90 transition-transform"
            aria-label="Trocar foto de perfil"
          >
            <Camera className="h-3 w-3" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleUpload}
            className="hidden"
          />
        </>
      )}
    </div>
  )
}
