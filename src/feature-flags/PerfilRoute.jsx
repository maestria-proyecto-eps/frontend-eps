import { useFeatureFlagEnabled } from 'posthog-js/react'
import Profile from '../pages/patient/Profile'
import Maintenance from '../pages/Maintenance'

export default function PerfilRoute() {
  const verPerfil = useFeatureFlagEnabled('mi-perfil')

  console.log(verPerfil)

  if (verPerfil === undefined) return <p>Cargando...</p>
  return verPerfil ? <Profile /> : <Maintenance />
}