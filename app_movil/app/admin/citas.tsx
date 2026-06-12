import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, RefreshControl, Modal, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Tema, Espaciado, RadioBorde } from '@/constants/tema';
import { AuthContext } from '@/src/contexto/ContextoAuth';
import { listarTodasCitas, cambiarEstadoCita, eliminarCitaAdmin } from '@/src/servicios/servicioAdmin';
import { ESTADOS_CITA } from '@/src/utilidades/constantes';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function AdminCitasScreen() {
  const router = useRouter();
  const { esAdmin } = useContext(AuthContext);

  const [citas, setCitas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [citaSeleccionada, setCitaSeleccionada] = useState(null);

  useEffect(() => {
    if (!esAdmin) {
      router.replace('/(tabs)');
      return;
    }
    cargarCitas();
  }, [esAdmin]);

  const cargarCitas = async () => {
    try {
      const data = await listarTodasCitas();
      setCitas(data);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudieron cargar las citas');
    } finally {
      setCargando(false);
    }
  };

  const onRefresh = async () => {
    setRefrescando(true);
    await cargarCitas();
    setRefrescando(false);
  };

  const abrirOpcionesEstado = (cita) => {
    setCitaSeleccionada(cita);
    setModalVisible(true);
  };

  const actualizarEstado = async (nuevoEstado) => {
    setModalVisible(false);
    if (!citaSeleccionada || citaSeleccionada.Estado_Reserva_Paquete === nuevoEstado) return;

    try {
      setCargando(true);
      await cambiarEstadoCita(citaSeleccionada.Id_Reserva_Paquete, nuevoEstado);
      await cargarCitas();
      Alert.alert('Éxito', `Estado actualizado a: ${ESTADOS_CITA[nuevoEstado].etiqueta}`);
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar el estado');
      setCargando(false);
    }
  };

  const confirmarEliminacion = (id) => {
    Alert.alert(
      'Eliminar Cita',
      '¿Estás seguro de que deseas eliminar esta cita permanentemente?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: async () => {
            try {
              setCargando(true);
              await eliminarCitaAdmin(id);
              await cargarCitas();
              Alert.alert('Éxito', 'Cita eliminada');
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar la cita');
              setCargando(false);
            }
          }
        }
      ]
    );
  };

  const formatearMoneda = (valor) => {
    if (!valor) return '$0';
    return '$' + Number(valor).toLocaleString('es-CO');
  };

  const renderCita = ({ item }) => {
    const estado = ESTADOS_CITA[item.Estado_Reserva_Paquete] || ESTADOS_CITA.pendiente;
    const fechaEvento = item.Fecha_Evento ? new Date(item.Fecha_Evento).toLocaleDateString('es-CO') : 'No especificada';
    const fechaCreacion = item.Fecha_Reserva ? new Date(item.Fecha_Reserva).toLocaleDateString('es-CO') : 'Desconocida';
    
    return (
      <View style={styles.tarjeta}>
        <View style={styles.tarjetaHeader}>
          <View style={styles.badgeId}>
            <Text style={styles.badgeIdTexto}>#{item.Id_Reserva_Paquete}</Text>
          </View>
          <Text style={styles.fechaCreacion}>Solicitado: {fechaCreacion}</Text>
          <TouchableOpacity 
            style={styles.botonEliminar}
            onPress={() => confirmarEliminacion(item.Id_Reserva_Paquete)}
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

        <View style={styles.seccionEvento}>
          <View style={styles.filaEvento}>
            <View style={styles.colEvento}>
              <Text style={styles.labelEtiqueta}>TIPO DE EVENTO</Text>
              <Text style={styles.valorEvento}>{item.Tipo_Evento}</Text>
            </View>
            <View style={styles.colEvento}>
              <Text style={styles.labelEtiqueta}>FECHA EVENTO</Text>
              <Text style={styles.valorEvento}>{fechaEvento}</Text>
            </View>
            <View style={styles.colEvento}>
              <Text style={styles.labelEtiqueta}>INVITADOS</Text>
              <Text style={styles.valorEvento}>{item.Numero_Invitados || 'N/A'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.divisor} />

        <View style={styles.seccionPaquete}>
          <Text style={styles.labelEtiqueta}>PAQUETE SOLICITADO</Text>
          <View style={styles.cajaPaquete}>
            <Text style={styles.paqueteNombre}>{item.paquete?.Nombre_Paquete || 'Paquete Desconocido'}</Text>
            <Text style={styles.paquetePrecio}>{formatearMoneda(item.paquete?.Precio_Paquete)}</Text>
          </View>
        </View>

        {item.Informacion_Adicional ? (
          <>
            <View style={styles.divisor} />
            <View style={styles.seccionNotas}>
              <Text style={styles.labelEtiqueta}>INFORMACIÓN ADICIONAL</Text>
              <Text style={styles.notasTexto}>{item.Informacion_Adicional}</Text>
            </View>
          </>
        ) : null}

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
          <Text style={styles.titulo}>Gestión de <Text style={styles.textoDorado}>Citas</Text></Text>
          <Text style={styles.subtitulo}>{citas.length} solicitudes de reservas</Text>
        </View>
      </View>

      {cargando && !refrescando ? (
        <View style={styles.cargandoContenedor}>
          <ActivityIndicator size="large" color={Tema.dark.tint} />
        </View>
      ) : (
        <FlatList
          data={citas}
          renderItem={renderCita}
          keyExtractor={(item) => item.Id_Reserva_Paquete.toString()}
          contentContainerStyle={styles.lista}
          refreshControl={
            <RefreshControl refreshing={refrescando} onRefresh={onRefresh} tintColor={Tema.dark.tint} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContenedor}>
              <Text style={styles.emptyTexto}>No hay citas registradas</Text>
            </View>
          }
        />
      )}

      {/* Modal para cambiar estado */}
      <Modal visible={modalVisible} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitulo}>Actualizar Estado</Text>
            
            {Object.entries(ESTADOS_CITA).map(([clave, valor]) => (
              <TouchableOpacity 
                key={clave}
                style={[
                  styles.opcionEstado, 
                  citaSeleccionada?.Estado_Reserva_Paquete === clave && styles.opcionEstadoActiva,
                  citaSeleccionada?.Estado_Reserva_Paquete === clave && { borderColor: valor.color }
                ]}
                onPress={() => actualizarEstado(clave)}
              >
                <View style={[styles.estadoDot, { backgroundColor: valor.color }]} />
                <Text style={[
                  styles.opcionEstadoTexto,
                  citaSeleccionada?.Estado_Reserva_Paquete === clave && { color: Tema.dark.text, fontWeight: 'bold' }
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
  seccionEvento: {
    padding: Espaciado.md,
  },
  filaEvento: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  colEvento: {
    flex: 1,
  },
  labelEtiqueta: {
    color: Tema.dark.textSecondary,
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 4,
  },
  valorEvento: {
    color: Tema.dark.text,
    fontSize: 14,
    fontWeight: '500',
  },
  seccionPaquete: {
    padding: Espaciado.md,
  },
  cajaPaquete: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Tema.dark.surface2,
    padding: Espaciado.sm,
    borderRadius: RadioBorde.md,
    marginTop: 4,
  },
  paqueteNombre: {
    color: Tema.dark.text,
    fontSize: 15,
    fontWeight: 'bold',
    flex: 1,
  },
  paquetePrecio: {
    color: Tema.dark.exito || '#22c55e',
    fontSize: 15,
    fontWeight: 'bold',
  },
  seccionNotas: {
    padding: Espaciado.md,
  },
  notasTexto: {
    color: Tema.dark.textSecondary,
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 4,
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
