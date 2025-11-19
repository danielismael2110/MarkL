import { supabase } from '../lib/supabaseClient'

export const repairUserProfiles = async () => {
  try {
    // Obtener todos los usuarios de auth
    const { data: { users }, error: authError } = await supabase.auth.admin.listUsers()
    if (authError) throw authError

    // Para cada usuario, verificar y crear/actualizar su perfil
    for (const user of users) {
      const { data: existingProfile, error: fetchError } = await supabase
        .from('perfiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (fetchError && fetchError.code === 'PGRST116') {
        // El perfil no existe, crearlo
        const newProfile = {
          id: user.id,
          nombre_completo: user.user_metadata.nombre_completo || user.email?.split('@')[0] || 'Usuario',
          telefono: '',
          direccion: '',
          rol_id: 3,
          activo: true
        }

        const { error: insertError } = await supabase
          .from('perfiles')
          .insert(newProfile)

        if (insertError) {
          console.error(`Error creando perfil para ${user.email}:`, insertError)
        } else {
          console.log(`Perfil creado para: ${user.email}`)
        }
      } else if (existingProfile && !existingProfile.nombre_completo) {
        // El perfil existe pero no tiene nombre_completo
        const updates = {
          nombre_completo: user.user_metadata.nombre_completo || user.email?.split('@')[0] || 'Usuario'
        }

        const { error: updateError } = await supabase
          .from('perfiles')
          .update(updates)
          .eq('id', user.id)

        if (updateError) {
          console.error(`Error actualizando perfil para ${user.email}:`, updateError)
        } else {
          console.log(`Perfil actualizado para: ${user.email}`)
        }
      }
    }

    console.log('Reparación de perfiles completada')
  } catch (error) {
    console.error('Error en reparación de perfiles:', error)
  }
}