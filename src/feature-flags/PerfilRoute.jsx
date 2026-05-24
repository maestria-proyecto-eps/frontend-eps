import { useFeatureFlagEnabled } from 'posthog-js/react'
import { usePostHog } from 'posthog-js/react'
import Profile from '../pages/patient/Profile'
import Maintenance from '../pages/Maintenance'

export default function PerfilRoute() {
  const posthog = usePostHog()
  const verPerfil = useFeatureFlagEnabled('mi-perfil')

  console.log('Flag valor:', verPerfil)
  console.log('Usuario actual:', posthog?.get_distinct_id()) // 👈 qué ID tiene PostHog ahora
  
  if (verPerfil === undefined) return <p>Cargando...</p>
  return verPerfil ? <Profile /> : <Maintenance />
}