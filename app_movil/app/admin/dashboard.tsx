import React, { useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Tema, Espaciado, RadioBorde } from '@/constants/tema';
import { AuthContext } from '@/src/contexto/ContextoAuth';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function AdminDashboardScreen() {
  const router = useRouter();
  const { usuario, esAdmin } = useContext(AuthContext);

  if (!esAdmin) {
    return (
      <View style={styles.errorContainer}>
        <IconSymbol name="exclamationmark.triangle.fill" size={60} color={Tema.dark.error} />
        <Text style={styles.errorTexto}>Acceso Denegado</Text>
        <Text style={styles.errorSubtexto}>No tienes permisos para ver esta pantalla.</Text>
        <TouchableOpacity style={styles.botonVolver} onPress={() => router.replace('/(tabs)')}>
          <Text style={styles.botonVolverTexto}>VOLVER AL INICIO</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const ModuloAdmin = ({ icono, titulo, subtitulo, ruta }) => (
    <TouchableOpacity 
      style={styles.moduloTarjeta}
      onPress={() => router.push(ruta)}
      activeOpacity={0.8}
    >
      <View style={styles.moduloIconoContenedor}>
        <IconSymbol name={icono} size={28} color={Tema.dark.dorado || '#c9a060'} />
      </View>
      <View style={styles.moduloInfo}>
        <Text style={styles.moduloTitulo}>{titulo}</Text>
        <Text style={styles.moduloSubtitulo}>{subtitulo}</Text>
      </View>
      <IconSymbol name="chevron.right" size={20} color={Tema.dark.textSecondary} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.botonAtras} onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={24} color={Tema.dark.text} />
        </TouchableOpacity>
        <View>
          <Text style={styles.titulo}>Panel de <Text style={styles.textoDorado}>Admin</Text></Text>
          <Text style={styles.subtitulo}>Bienvenido, {usuario?.Nombre}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.resumenGrid}>
          <View style={styles.resumenTarjeta}>
            <Text style={styles.resumenNumero}>12</Text>
            <Text style={styles.resumenEtiqueta}>Pedidos Nuevos</Text>
          </View>
          <View style={styles.resumenTarjeta}>
            <Text style={styles.resumenNumero}>5</Text>
            <Text style={styles.resumenEtiqueta}>Citas Pendientes</Text>
          </View>
        </View>

        <Text style={styles.seccionTitulo}>Módulos de Gestión</Text>

        <View style={styles.listaModulos}>
          <ModuloAdmin 
            icono="shippingbox.fill" 
            titulo="Gestión de Pedidos" 
            subtitulo="Aprobar y enviar pedidos físicos"
            ruta="/admin/pedidos"
          />
          <ModuloAdmin 
            icono="calendar.badge.clock" 
            titulo="Gestión de Citas" 
            subtitulo="Aprobar y reprogramar sesiones"
            ruta="/admin/citas"
          />
          <ModuloAdmin 
            icono="camera.macro" 
            titulo="Gestión de Productos" 
            subtitulo="Inventario y catálogo de la tienda"
            ruta="/admin/productos"
          />
          <ModuloAdmin 
            icono="folder.fill" 
            titulo="Gestión de Categorías" 
            subtitulo="Administrar categorías de productos"
            ruta="/admin/categorias"
          />
          <ModuloAdmin 
            icono="cube.box.fill" 
            titulo="Gestión de Paquetes" 
            subtitulo="Administrar paquetes de servicios"
            ruta="/admin/paquetes"
          />
          <ModuloAdmin 
            icono="wand.and.stars.inverse" 
            titulo="Proyectos Personalizados" 
            subtitulo="Cotizar y gestionar ideas a medida"
            ruta="/admin/personalizado"
          />
          <ModuloAdmin 
            icono="person.2.fill" 
            titulo="Gestión de Usuarios" 
            subtitulo="Roles y permisos del sistema"
            ruta="/admin/usuarios"
          />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Tema.dark.background,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: Tema.dark.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Espaciado.xl,
  },
  errorTexto: {
    color: Tema.dark.text,
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: Espaciado.lg,
    marginBottom: Espaciado.sm,
  },
  errorSubtexto: {
    color: Tema.dark.textSecondary,
    textAlign: 'center',
    marginBottom: Espaciado.xl,
  },
  botonVolver: {
    backgroundColor: Tema.dark.tint,
    paddingHorizontal: Espaciado.xl,
    paddingVertical: Espaciado.md,
    borderRadius: RadioBorde.md,
  },
  botonVolverTexto: {
    color: '#fff',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Espaciado.lg,
  },
  botonAtras: {
    padding: Espaciado.sm,
    marginRight: Espaciado.sm,
    marginLeft: -Espaciado.sm,
  },
  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Tema.dark.text,
  },
  textoDorado: {
    color: Tema.dark.dorado || '#c9a060',
  },
  subtitulo: {
    color: Tema.dark.textSecondary,
    fontSize: 14,
    marginTop: 2,
  },
  scrollContent: {
    padding: Espaciado.lg,
    paddingTop: 0,
    paddingBottom: Espaciado.xxl,
  },
  resumenGrid: {
    flexDirection: 'row',
    gap: Espaciado.md,
    marginBottom: Espaciado.xl,
  },
  resumenTarjeta: {
    flex: 1,
    backgroundColor: Tema.dark.surface,
    padding: Espaciado.lg,
    borderRadius: RadioBorde.lg,
    borderWidth: 1,
    borderColor: 'rgba(201, 160, 96, 0.3)', // Borde dorado sutil
    alignItems: 'center',
  },
  resumenNumero: {
    color: Tema.dark.dorado || '#c9a060',
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: Espaciado.xs,
  },
  resumenEtiqueta: {
    color: Tema.dark.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  seccionTitulo: {
    color: Tema.dark.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: Espaciado.md,
  },
  listaModulos: {
    gap: Espaciado.md,
  },
  moduloTarjeta: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Tema.dark.surface,
    padding: Espaciado.md,
    borderRadius: RadioBorde.lg,
    borderWidth: 1,
    borderColor: Tema.dark.border,
  },
  moduloIconoContenedor: {
    width: 50,
    height: 50,
    borderRadius: RadioBorde.md,
    backgroundColor: 'rgba(201, 160, 96, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Espaciado.md,
  },
  moduloInfo: {
    flex: 1,
  },
  moduloTitulo: {
    color: Tema.dark.text,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  moduloSubtitulo: {
    color: Tema.dark.textSecondary,
    fontSize: 12,
  },
});
