import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, RefreshControl, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Tema, Espaciado, RadioBorde } from '@/constants/tema';
import { AuthContext } from '@/src/contexto/ContextoAuth';
import { listarTodasSolicitudes, cambiarEstadoSolicitud, eliminarSolicitudAdmin } from '@/src/servicios/servicioAdmin';
import { ESTADOS_PERSONALIZADO } from '@/src/utilidades/constantes';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function AdminPersonalizadoScreen() {
  const router = useRouter();
  const { esAdmin } = useContext(AuthContext);

  const [solicitudes, setSolicitudes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);

  useEffect(() => {
    if (!esAdmin) {
      router.replace('/(tabs)');
      return;
    }
    cargarSolicitudes();
  }, [esAdmin]);

  const cargarSolicitudes = async () => {
    try {
      const data = await listarTodasSolicitudes();
      setSolicitudes(data);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudieron cargar las solicitudes');
    } finally {
      setCargando(false);
    }
  };

  const onRefresh = async () => {
    setRefrescando(true);
    await cargarSolicitudes();
    setRefrescando(false);
  };

  const abrirOpcionesEstado = (solicitud) => {
    setSolicitudSeleccionada(solicitud);
    setModalVisible(true);
  };

  const actualizarEstado = async (nuevoEstado) => {
    setModalVisible(false);
    if (!solicitudSeleccionada || solicitudSeleccionada.Estado_Personalizado === nuevoEstado) return;

    try {
      setCargando(true);
      await cambiarEstadoSolicitud(solicitudSeleccionada.Id_Personalizado, nuevoEstado);
      await cargarSolicitudes();
      Alert.alert('Éxito', `Estado actualizado correctamente`);
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar el estado');
      setCargando(false);
    }
  };

  const confirmarEliminacion = (id) => {
    Alert.alert(
      'Eliminar Solicitud',
      '¿Estás seguro de que deseas eliminar esta solicitud permanentemente?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: async () => {
            try {
              setCargando(true);
              await eliminarSolicitudAdmin(id);
              await cargarSolicitudes();
              Alert.alert('Éxito', 'Solicitud eliminada');
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar la solicitud');
              setCargando(false);
            }
          }
        }
      ]
    );
  };

  // Agregar los nuevos estados si no están en constantes.js
  const estadosCompletos = {
    ...ESTADOS_PERSONALIZADO,
    'en-revision': { etiqueta: 'En revisión', color: Tema.dark.dorado || '#c9a060' },
    'aprobado': { etiqueta: 'Aprobado', color: Tema.dark.info || '#3b82f6' },
    'rechazado': { etiqueta: 'Rechazado', color: Tema.dark.error || '#ef4444' },
  };

  const renderSolicitud = ({ item }) => {
    const estado = estadosCompletos[item.Estado_Personalizado] || estadosCompletos.pendiente;
    const fechaCreacion = item.Fecha_Solicitud ? new Date(item.Fecha_Solicitud).toLocaleDateString('es-CO') : 'Desconocida';
    
    return (
      <View style={styles.tarjeta}>
        <View style={styles.tarjetaHeader}>
          <View style={styles.badgeId}>
            <Text style={styles.badgeIdTexto}>#{item.Id_Personalizado}</Text>
          </View>
          <Text style={styles.fechaCreacion}>{fechaCreacion}</Text>
          <TouchableOpacity 
            style={styles.botonEliminar}
            onPress={() => confirmarEliminacion(item.Id_Personalizado)}
          >
            <IconSymbol name="trash" size={18} color={Tema.dark.error} />
          </TouchableOpacity>
        </View>

        <View style={styles.seccionCliente}>
          <Text style={styles.clienteNombre}>{item.Nombre_Completo}</Text>
          <View style={styles.filaInfo}>
            <IconSymbol name="envelope.fill" size={14} color={Tema.dark.textSecondary} />
            <Text style={styles.clienteContacto}>{item.Correo}</Text>
          </View>
          <View style={styles.filaInfo}>
            <IconSymbol name="phone.fill" size={14} color={Tema.dark.textSecondary} />
            <Text style={styles.clienteContacto}>{item.Numero_Telefono}</Text>
          </View>
        </View>

        <View style={styles.divisor} />

        <View style={styles.seccionDetalle}>
          <Text style={styles.labelEtiqueta}>DESTINATARIO</Text>
          <Text style={styles.valorTexto}>{item.Destinatario || 'No especificado'}</Text>
          
          <Text style={[styles.labelEtiqueta, { marginTop: Espaciado.md }]}>IDEA PRINCIPAL</Text>
          <Text style={styles.valorTextoBase}>{item.Descripcion_Idea}</Text>

          {item.Elementos_Esenciales ? (
            <>
              <Text style={[styles.labelEtiqueta, { marginTop: Espaciado.md }]}>ELEMENTOS ESENCIALES</Text>
              <Text style={styles.valorTextoBase}>{item.Elementos_Esenciales}</Text>
            </>
          ) : null}

          <View style={styles.filaPrioridad}>
            <Text style={styles.labelEtiqueta}>PRIORIDAD:</Text>
            <Text style={styles.valorPrioridad}>{item.Prioridad_Cliente || 'Normal'}</Text>
          </View>

          {item.Comentarios_Adicionales ? (
            <View style={styles.seccionNotas}>
              <Text style={styles.labelEtiqueta}>COMENTARIOS ADICIONALES</Text>
              <Text style={styles.notasTexto}>{item.Comentarios_Adicionales}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.tarjetaFooter}>
          <Text style={styles.labelEstado}>ESTADO ACTUAL:</Text>
          <TouchableOpacity 
            style={[styles.botonEstado, { backgroundColor: estado.color + '15', borderColor: estado.color }]}
            onPress={() => abrirOpcionesEstado(item)}
          >
            <Text style={[styles.estadoTexto, { color: estado.color }]}>{estado.etiqueta}</Text>
            <IconSymbol name="chevron.down" size={14} color={estado.color} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.botonVolver} onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={24} color={Tema.dark.text} />
        </TouchableOpacity>
        <View>
          <Text style={styles.titulo}>Proyectos <Text style={styles.textoDorado}>Personalizados</Text></Text>
          <Text style={styles.subtitulo}>{solicitudes.length} solicitudes de ideas</Text>
        </View>
      </View>

      {cargando && !refrescando ? (
        <View style={styles.cargandoContenedor}>
          <ActivityIndicator size="large" color={Tema.dark.tint} />
        </View>
      ) : (
        <FlatList
          data={solicitudes}
          renderItem={renderSolicitud}
          keyExtractor={(item) => item.Id_Personalizado.toString()}
          contentContainerStyle={styles.lista}
          refreshControl={
            <RefreshControl refreshing={refrescando} onRefresh={onRefresh} tintColor={Tema.dark.tint} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContenedor}>
              <Text style={styles.emptyTexto}>No hay solicitudes personalizadas</Text>
            </View>
          }
        />
      )}

      {/* Modal para cambiar estado */}
      <Modal visible={modalVisible} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitulo}>Actualizar Estado</Text>
            
            {Object.entries(estadosCompletos).map(([clave, valor]) => (
              <TouchableOpacity 
                key={clave}
                style={[
                  styles.opcionEstado, 
                  solicitudSeleccionada?.Estado_Personalizado === clave && styles.opcionEstadoActiva,
                  solicitudSeleccionada?.Estado_Personalizado === clave && { borderColor: valor.color }
                ]}
                onPress={() => actualizarEstado(clave)}
              >
                <View style={[styles.estadoDot, { backgroundColor: valor.color }]} />
                <Text style={[
                  styles.opcionEstadoTexto,
                  solicitudSeleccionada?.Estado_Personalizado === clave && { color: Tema.dark.text, fontWeight: 'bold' }
                ]}>
                  {valor.etiqueta}
                </Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity 
              style={styles.botonCancelar} 
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.botonCancelarTexto}>CANCELAR</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Tema.dark.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Espaciado.lg,
    borderBottomWidth: 1,
    borderBottomColor: Tema.dark.border,
  },
  botonVolver: {
    padding: Espaciado.sm,
    marginRight: Espaciado.sm,
    marginLeft: -Espaciado.sm,
  },
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Tema.dark.text,
  },
  textoDorado: {
    color: Tema.dark.dorado || '#c9a060',
  },
  subtitulo: {
    color: Tema.dark.textSecondary,
    fontSize: 13,
  },
  cargandoContenedor: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lista: {
    padding: Espaciado.lg,
    gap: Espaciado.md,
  },
  emptyContenedor: {
    padding: Espaciado.xl,
    alignItems: 'center',
  },
  emptyTexto: {
    color: Tema.dark.textSecondary,
    fontSize: 16,
  },
  tarjeta: {
    backgroundColor: Tema.dark.surface,
    borderRadius: RadioBorde.lg,
    borderWidth: 1,
    borderColor: Tema.dark.border,
    padding: 0,
    overflow: 'hidden',
    marginBottom: Espaciado.md,
  },
  tarjetaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Tema.dark.surface2,
    paddingHorizontal: Espaciado.md,
    paddingVertical: Espaciado.sm,
    borderBottomWidth: 1,
    borderBottomColor: Tema.dark.border,
  },
  badgeId: {
    backgroundColor: 'rgba(201, 160, 96, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RadioBorde.sm,
  },
  badgeIdTexto: {
    color: Tema.dark.dorado || '#c9a060',
    fontWeight: 'bold',
    fontSize: 12,
  },
  fechaCreacion: {
    color: Tema.dark.textSecondary,
    fontSize: 12,
  },
  botonEliminar: {
    padding: 4,
  },
  seccionCliente: {
    padding: Espaciado.md,
  },
  clienteNombre: {
    color: Tema.dark.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  filaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  clienteContacto: {
    color: Tema.dark.textSecondary,
    fontSize: 14,
  },
  divisor: {
    height: 1,
    backgroundColor: Tema.dark.border,
    marginHorizontal: Espaciado.md,
  },
  seccionDetalle: {
    padding: Espaciado.md,
  },
  labelEtiqueta: {
    color: Tema.dark.textSecondary,
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 4,
  },
  valorTexto: {
    color: Tema.dark.text,
    fontSize: 15,
    fontWeight: '500',
  },
  valorTextoBase: {
    color: Tema.dark.text,
    fontSize: 14,
    lineHeight: 20,
  },
  filaPrioridad: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: Espaciado.md,
  },
  valorPrioridad: {
    color: Tema.dark.dorado || '#c9a060',
    fontSize: 13,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  seccionNotas: {
    marginTop: Espaciado.md,
    padding: Espaciado.sm,
    backgroundColor: Tema.dark.surface2,
    borderRadius: RadioBorde.md,
  },
  notasTexto: {
    color: Tema.dark.textSecondary,
    fontSize: 13,
    fontStyle: 'italic',
  },
  tarjetaFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Tema.dark.surface2,
    padding: Espaciado.md,
    borderTopWidth: 1,
    borderTopColor: Tema.dark.border,
  },
  labelEstado: {
    color: Tema.dark.text,
    fontSize: 12,
    fontWeight: 'bold',
  },
  botonEstado: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Espaciado.md,
    paddingVertical: 8,
    borderRadius: RadioBorde.md,
    borderWidth: 1,
    gap: 6,
  },
  estadoTexto: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Tema.dark.surface,
    borderTopLeftRadius: RadioBorde.lg,
    borderTopRightRadius: RadioBorde.lg,
    padding: Espaciado.lg,
    borderTopWidth: 1,
    borderColor: Tema.dark.border,
  },
  modalTitulo: {
    color: Tema.dark.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: Espaciado.lg,
    textAlign: 'center',
  },
  opcionEstado: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Espaciado.md,
    borderRadius: RadioBorde.md,
    marginBottom: Espaciado.sm,
    backgroundColor: Tema.dark.surface2,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  opcionEstadoActiva: {
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  estadoDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: Espaciado.md,
  },
  opcionEstadoTexto: {
    color: Tema.dark.textSecondary,
    fontSize: 16,
  },
  botonCancelar: {
    marginTop: Espaciado.md,
    padding: Espaciado.md,
    alignItems: 'center',
  },
  botonCancelarTexto: {
    color: Tema.dark.error,
    fontWeight: 'bold',
    fontSize: 16,
  },
});
