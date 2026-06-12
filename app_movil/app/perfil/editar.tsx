import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Tema, Espaciado, RadioBorde } from '@/constants/tema';
import { AuthContext } from '@/src/contexto/ContextoAuth';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function EditarPerfilScreen() {
  const router = useRouter();
  const { usuario, actualizarPerfil } = useContext(AuthContext);

  const [nombre, setNombre] = useState(usuario?.Nombre || '');
  const [apellidos, setApellidos] = useState(usuario?.Apellidos || '');
  const [celular, setCelular] = useState(usuario?.Celular || '');
  const [cargando, setCargando] = useState(false);

  const manejarGuardar = async () => {
    if (!nombre.trim()) {
      Alert.alert('Error', 'El nombre es obligatorio');
      return;
    }

    try {
      setCargando(true);
      await actualizarPerfil({
        nombre,
        apellidos,
        celular
      });
      
      Alert.alert(
        '¡Éxito!', 
        'Tu perfil ha sido actualizado correctamente.',
        [{ text: 'Volver', onPress: () => router.back() }]
      );
    } catch (error) {
      Alert.alert('Error', error.message || 'No se pudo actualizar el perfil');
      setCargando(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          
          <View style={styles.header}>
            <TouchableOpacity style={styles.botonVolver} onPress={() => router.back()}>
              <IconSymbol name="chevron.left" size={24} color={Tema.dark.text} />
            </TouchableOpacity>
            <Text style={styles.titulo}>Editar <Text style={styles.textoRojo}>Perfil</Text></Text>
          </View>

          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarTexto}>{nombre?.charAt(0) || 'U'}</Text>
            </View>
            <Text style={styles.correoTexto}>{usuario?.Correo}</Text>
            <Text style={styles.infoTexto}>El correo electrónico no se puede cambiar</Text>
          </View>

          <View style={styles.formContainer}>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nombre *</Text>
              <TextInput
                style={styles.input}
                placeholder="Tu nombre"
                placeholderTextColor={Tema.dark.textSecondary}
                value={nombre}
                onChangeText={setNombre}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Apellidos</Text>
              <TextInput
                style={styles.input}
                placeholder="Tus apellidos"
                placeholderTextColor={Tema.dark.textSecondary}
                value={apellidos}
                onChangeText={setApellidos}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Celular</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej. 300 000 0000"
                placeholderTextColor={Tema.dark.textSecondary}
                value={celular}
                onChangeText={setCelular}
                keyboardType="phone-pad"
              />
            </View>

            <TouchableOpacity 
              style={[styles.boton, cargando && styles.botonDeshabilitado]} 
              onPress={manejarGuardar}
              disabled={cargando}
            >
              {cargando ? (
                <ActivityIndicator color={Tema.dark.text} />
              ) : (
                <>
                  <IconSymbol name="square.and.arrow.down.fill" size={18} color="#fff" />
                  <Text style={styles.botonTexto}>GUARDAR CAMBIOS</Text>
                </>
              )}
            </TouchableOpacity>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Tema.dark.background,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: Espaciado.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Espaciado.xl,
  },
  botonVolver: {
    padding: Espaciado.sm,
    marginRight: Espaciado.sm,
    marginLeft: -Espaciado.sm,
  },
  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Tema.dark.text,
  },
  textoRojo: {
    color: Tema.dark.tint,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: Espaciado.xl,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Tema.dark.surface2,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Tema.dark.tint,
    marginBottom: Espaciado.sm,
  },
  avatarTexto: {
    color: Tema.dark.text,
    fontSize: 32,
    fontWeight: 'bold',
  },
  correoTexto: {
    color: Tema.dark.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  infoTexto: {
    color: Tema.dark.textSecondary,
    fontSize: 12,
  },
  formContainer: {
    backgroundColor: Tema.dark.surface,
    padding: Espaciado.lg,
    borderRadius: RadioBorde.lg,
    borderWidth: 1,
    borderColor: Tema.dark.border,
  },
  inputGroup: {
    marginBottom: Espaciado.lg,
  },
  label: {
    color: Tema.dark.textSecondary,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Espaciado.xs,
    fontWeight: '600',
  },
  input: {
    backgroundColor: Tema.dark.surface2,
    borderWidth: 1,
    borderColor: Tema.dark.border,
    borderRadius: RadioBorde.md,
    color: Tema.dark.text,
    padding: Espaciado.md,
    fontSize: 16,
  },
  boton: {
    backgroundColor: Tema.dark.tint,
    flexDirection: 'row',
    padding: Espaciado.md,
    borderRadius: RadioBorde.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Espaciado.sm,
    gap: Espaciado.sm,
  },
  botonDeshabilitado: {
    opacity: 0.7,
  },
  botonTexto: {
    color: '#fff',
    fontWeight: 'bold',
    letterSpacing: 1,
    fontSize: 16,
  },
});
