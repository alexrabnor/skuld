'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { DIRECTUS_URL } from '@/lib/directus'

export async function login(formData: FormData) {
  const email = String(formData.get('email') || '')
  const password = String(formData.get('password') || '')

  const res = await fetch(`${DIRECTUS_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, mode: 'json' }),
  })

  if (!res.ok) {
    redirect('/login?fel=1')
  }

  const { data } = await res.json()
  const c = await cookies()
  const common = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
  }
  c.set('directus_token', data.access_token, { ...common, maxAge: 60 * 60 * 24 })
  c.set('directus_refresh', data.refresh_token, { ...common, maxAge: 60 * 60 * 24 * 30 })

  redirect('/')
}

export async function logout() {
  const c = await cookies()
  c.delete('directus_token')
  c.delete('directus_refresh')
  redirect('/login')
}
