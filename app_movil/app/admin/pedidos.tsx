import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, RefreshControl, Modal, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Tema, Espaciado, RadioBorde } from '@/constants/tema';
import { AuthContext } from '@/src/contexto/ContextoAuth';
import { listarTodosPedidos, cambiarEstadoPedido } from '@/src/servicios/servicioAdmin';
import { ESTADOS_PEDIDO } from '@/src/utilidades/constantes';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function AdminPedidosScreen() {
  const router = useRouter();
  const { esAdmin } = useContext(AuthContext);

  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  
  const [detalleVisible, setDetalleVisible] = useState(false);
  const [pedidoDetalle, setPedidoDetalle] = useState(null);

  useEffect(() => {
    if (!esAdmin) {
      router.replace('/(tabs)');
      return;
    }
    cargarPedidos();
  }, [esAdmin]);

  const cargarPedidos = async () => {
    try {
      const data = await listarTodosPedidos();
      setPedidos(data);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudieron cargar los pedidos');
    } finally {
      setCargando(false);
    }
  };

  const onRefresh = async () => {
    setRefrescando(true);
    await cargarPedidos();
    setRefrescando(false);
  };

  const abrirOpcionesEstado = (pedido) => {
    setPedidoSeleccionado(pedido);
    setModalVisible(true);
  };

  const actualizarEstado = async (nuevoEstado) => {
    setModalVisible(false);
    if (!pedidoSeleccionado || pedidoSeleccionado.Estado_Pedido === nuevoEstado) return;

    try {
      setCargando(true);
      await cambiarEstadoPedido(pedidoSeleccionado.id, nuevoEstado);
      await cargarPedidos();
      Alert.alert('Éxito', `Estado actualizado a: ${ESTADOS_PEDIDO[nuevoEstado].etiqueta}`);
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar el estado');
      setCargando(false);
    }
  };

  const abrirDetalle = (pedido) => {
    setPedidoDetalle(pedido);
    setDetalleVisible(true);
  };

  const renderPedido = ({ item }) => {
    const estadoKey = (item.estado || 'pendiente').toLowerCase();
    const estado = ESTADOS_PEDIDO[estadoKey] || ESTADOS_PEDIDO.pendiente;
    const fecha = item.createdAt ? new Date(item.createdAt).toLocaleDateString('es-CO') : 'Sin fecha';

    return (
      <View style={styles.tarjeta}>
        <View style={styles.tarjetaHeader}>
          <Text style={styles.pedidoId}>ID: #{item.id}</Text>
          <Text style={styles.fecha}>{fecha}</Text>
        </View>

        <View style={styles.tarjetaBody}>
          <View style={styles.clienteInfo}>
            <IconSymbol name="person.fill" size={16} color={Tema.dark.textSecondary} />
            <Text style={styles.clienteTexto}>{item.usuario?.Nombre || 'Usuario Desconocido'}</Text>
          </View>
          <Text style={styles.totalTexto}>Total: ${Number(item.total || 0).toLocaleString('es-CO')}</Text>
        </View>

        <View style={styles.tarjetaFooter}>
          <TouchableOpacity 
            style={[styles.botonEstado, { backgroundColor: estado.color + '20', borderColor: estado.color }]}
            onPress={() => abrirOpcionesEstado(item)}
          >
            <Text style={[styles.estadoTexto, { color: estado.color }]}>{estado.etiqueta}</Text>
            <IconSymbol name="chevron.down" size={14} color={estado.color} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.botonDetalle}
            onPress={() => abrirDetalle(item)}
          >
            <Text style={styles.botonDetalleTexto}>Ver Detalles</Text>
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
          <Text style={styles.titulo}>Gestión de <Text style={styles.textoDorado}>Pedidos</Text></Text>
          <Text style={styles.subtitulo}>{pedidos.length} pedidos registrados</Text>
        </View>
      </View>

      {cargando && !refrescando ? (
        <View style={styles.cargandoContenedor}>
          <ActivityIndicator size="large" color={Tema.dark.tint} />
        </View>
      ) : (
        <FlatList
          data={pedidos}
          renderItem={renderPedido}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.lista}
          refreshControl={
            <RefreshControl refreshing={refrescando} onRefresh={onRefresh} tintColor={Tema.dark.tint} />
          }
        />
      )}

      {/* Modal para cambiar estado */}
      <Modal visible={modalVisible} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitulo}>Cambiar Estado (Pedido #{pedidoSeleccionado?.id})</Text>
            
            {Object.entries(ESTADOS_PEDIDO).map(([clave, valor]) => (
              <TouchableOpacity 
                key={clave}
                style={[
                  styles.opcionEstado, 
                  pedidoSeleccionado?.estado === clave && styles.opcionEstadoActiva
                ]}
                onPress={() => actualizarEstado(clave)}
              >
                <View style={[styles.estadoDot, { backgroundColor: valor.color }]} />
                <Text style={[
                  styles.opcionEstadoTexto,
                  pedidoSeleccionado?.estado === clave && { color: Tema.dark.text, fontWeight: 'bold' }
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

      {/* Modal para ver detalles */}
      <Modal visible={detalleVisible} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '85%' }]}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitulo}>Detalle de Pedido #{pedidoDetalle?.id}</Text>
              <TouchableOpacity onPress={() => setDetalleVisible(false)}>
                <IconSymbol name="xmark" size={24} color={Tema.dark.textSecondary} />
              </TouchableOpacity>
            </View>
            
            {pedidoDetalle && (
              <ScrollView style={{ marginTop: Espaciado.md }} showsVerticalScrollIndicator={false}>
                <Text style={styles.seccionTitulo}>Información del Cliente</Text>
                <Text style={styles.textoDetalle}>Nombre: {pedidoDetalle.usuario?.Nombre}</Text>
                <Text style={styles.textoDetalle}>Correo: {pedidoDetalle.usuario?.Correo}</Text>
                <Text style={styles.textoDetalle}>Teléfono: {pedidoDetalle.telefono || pedidoDetalle.usuario?.Celular || 'No especificado'}</Text>
                <Text style={styles.textoDetalle}>Dirección: {pedidoDetalle.direccionEnvio || 'No especificada'}</Text>
                {pedidoDetalle.notas ? <Text style={styles.textoDetalle}>Notas: {pedidoDetalle.notas}</Text> : null}
                
                <Text style={[styles.seccionTitulo, { marginTop: Espaciado.lg }]}>Productos ({pedidoDetalle.detalles?.length || 0})</Text>
                {pedidoDetalle.detalles?.map((det, index) => (
                  <View key={index} style={styles.detalleItem}>
                    <Text style={styles.detalleProductoTexto}>{det.cantidad}x {det.producto?.Nombre_Producto || 'Producto eliminado'}</Text>
                    <Text style={styles.detallePrecioTexto}>${Number(det.subtotal).toLocaleString('es-CO')}</Text>
                  </View>
                ))}
                
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>TOTAL</Text>
                  <Text style={styles.totalValue}>${Number(pedidoDetalle.total).toLocaleString('es-CO')}</Text>
                </View>
              </ScrollView>
            )}
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
  tarjeta: {
    backgroundColor: Tema.dark.surface,
    borderRadius: RadioBorde.md,
    borderWidth: 1,
    borderColor: Tema.dark.border,
    padding: Espaciado.md,
  },
  tarjetaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Espaciado.sm,
  },
  pedidoId: {
    color: Tema.dark.text,
    fontSize: 14,
    fontWeight: 'bold',
  },
  fecha: {
    color: Tema.dark.textSecondary,
    fontSize: 12,
  },
  tarjetaBody: {
    marginBottom: Espaciado.md,
  },
  clienteInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Espaciado.xs,
    marginBottom: 4,
  },
  clienteTexto: {
    color: Tema.dark.text,
    fontSize: 14,
  },
  totalTexto: {
    color: Tema.dark.tint,
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: Espaciado.xs,
  },
  tarjetaFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Tema.dark.border,
    paddingTop: Espaciado.md,
  },
  botonEstado: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Espaciado.sm,
    paddingVertical: 6,
    borderRadius: RadioBorde.sm,
    borderWidth: 1,
    gap: 4,
  },
  estadoTexto: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  botonDetalle: {
    padding: Espaciado.xs,
  },
  botonDetalleTexto: {
    color: Tema.dark.dorado || '#c9a060',
    fontSize: 13,
    fontWeight: 'bold',
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
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
  },
  opcionEstadoActiva: {
    borderWidth: 1,
    borderColor: Tema.dark.dorado || '#c9a060',
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
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Espaciado.sm,
  },
  seccionTitulo: {
    color: Tema.dark.tint,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: Espaciado.sm,
  },
  textoDetalle: {
    color: Tema.dark.text,
    fontSize: 14,
    marginBottom: 4,
  },
  detalleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Espaciado.sm,
    borderBottomWidth: 1,
    borderBottomColor: Tema.dark.border,
  },
  detalleProductoTexto: {
    color: Tema.dark.text,
    fontSize: 14,
    flex: 1,
  },
  detallePrecioTexto: {
    color: Tema.dark.textSecondary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Espaciado.md,
    paddingTop: Espaciado.sm,
    borderTopWidth: 2,
    borderTopColor: Tema.dark.border,
  },
  totalLabel: {
    color: Tema.dark.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalValue: {
    color: Tema.dark.tint,
    fontSize: 18,
    fontWeight: 'bold',
  },
});
