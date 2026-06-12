import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, RefreshControl, Image, Switch, Modal, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Tema, Espaciado, RadioBorde } from '@/constants/tema';
import { AuthContext } from '@/src/contexto/ContextoAuth';
import servicioPaquetes from '@/src/servicios/servicioPaquetes';
import { crearPaquete, editarPaquete, togglePaquete, eliminarPaquete } from '@/src/servicios/servicioAdmin';
import servicioCatalogo from '@/src/servicios/servicioCatalogo';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function AdminPaquetesScreen() {
  const router = useRouter();
  const { esAdmin } = useContext(AuthContext);

  const [paquetes, setPaquetes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [guardando, setGuardando] = useState(false);

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [paqueteEditando, setPaqueteEditando] = useState(null);
  const [formData, setFormData] = useState({ nombre: '', precio: '', descripcion: '', imagen: '' });

  useEffect(() => {
    if (!esAdmin) {
      router.replace('/(tabs)');
      return;
    }
    cargarPaquetes();
  }, [esAdmin]);

  const cargarPaquetes = async () => {
    try {
      const data = await servicioPaquetes.listarPaquetes();
      setPaquetes(data);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudieron cargar los paquetes');
    } finally {
      setCargando(false);
    }
  };

  const onRefresh = async () => {
    setRefrescando(true);
    await cargarPaquetes();
    setRefrescando(false);
  };

  const abrirModal = (paquete = null) => {
    if (paquete) {
      setPaqueteEditando(paquete);
      setFormData({
        nombre: paquete.Nombre_Paquete || '',
        precio: paquete.Precio_Paquete?.toString() || '',
        descripcion: paquete.Descripcion_Paquete || '',
        imagen: paquete.Imagen_Paquete || ''
      });
    } else {
      setPaqueteEditando(null);
      setFormData({ nombre: '', precio: '', descripcion: '', imagen: '' });
    }
    setModalVisible(true);
  };

  const guardarPaquete = async () => {
    if (!formData.nombre || !formData.precio || !formData.descripcion) {
      Alert.alert('Atención', 'Por favor completa los campos requeridos (Nombre, Precio, Descripción)');
      return;
    }

    try {
      setGuardando(true);
      const datosEnvio = {
        nombre: formData.nombre,
        precio: Number(formData.precio),
        descripcion: formData.descripcion,
        imagen: formData.imagen
      };

      if (paqueteEditando) {
        await editarPaquete(paqueteEditando.Id_Paquete, datosEnvio);
        Alert.alert('Éxito', 'Paquete editado correctamente');
      } else {
        await crearPaquete(datosEnvio);
        Alert.alert('Éxito', 'Paquete creado correctamente');
      }

      setModalVisible(false);
      await cargarPaquetes();
    } catch (error) {
      Alert.alert('Error', error.message || 'No se pudo guardar el paquete');
    } finally {
      setGuardando(false);
    }
  };

  const manejarToggle = async (id, estadoActual) => {
    try {
      setPaquetes(current => 
        current.map(p => p.Id_Paquete === id ? { ...p, Activo: !estadoActual } : p)
      );
      await togglePaquete(id);
    } catch (error) {
      setPaquetes(current => 
        current.map(p => p.Id_Paquete === id ? { ...p, Activo: estadoActual } : p)
      );
      Alert.alert('Error', 'No se pudo cambiar el estado');
    }
  };

  const confirmarEliminacion = (id) => {
    Alert.alert(
      'Eliminar Paquete',
      '¿Estás seguro de que deseas eliminar este paquete? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: async () => {
            try {
              setCargando(true);
              await eliminarPaquete(id);
              await cargarPaquetes();
              Alert.alert('Éxito', 'Paquete eliminado');
            } catch (error) {
              Alert.alert('Error', error.message || 'No se pudo eliminar el paquete');
              setCargando(false);
            }
          }
        }
      ]
    );
  };

  const renderPaquete = ({ item }) => {
    const imagenUrl = servicioCatalogo.construirUrlImagen(item.Imagen_Paquete);
    const activo = item.Activo;

    return (
      <View style={[styles.tarjeta, !activo && styles.tarjetaInactiva]}>
        <Image source={{ uri: imagenUrl }} style={styles.imagen} />
        
        <View style={styles.info}>
          <Text style={styles.nombre} numberOfLines={2}>{item.Nombre_Paquete}</Text>
          <Text style={styles.precio}>${Number(item.Precio_Paquete).toLocaleString('es-CO')}</Text>
          <Text style={styles.estadoTexto}>{activo ? 'ACTIVO' : 'OCULTO'}</Text>
        </View>

        <View style={styles.acciones}>
          <Switch
            value={activo}
            onValueChange={() => manejarToggle(item.Id_Paquete, item.Activo)}
            trackColor={{ false: Tema.dark.border, true: Tema.dark.tint }}
            thumbColor={activo ? '#fff' : '#f4f3f4'}
          />
          
          <TouchableOpacity 
            style={styles.botonAccion}
            onPress={() => abrirModal(item)}
          >
            <IconSymbol name="pencil" size={20} color={Tema.dark.dorado || '#c9a060'} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.botonAccion}
            onPress={() => confirmarEliminacion(item.Id_Paquete)}
          >
            <IconSymbol name="trash" size={20} color={Tema.dark.error} />
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
        <View style={styles.headerTextContainer}>
          <Text style={styles.titulo}>Gestión de <Text style={styles.textoDorado}>Paquetes</Text></Text>
          <Text style={styles.subtitulo}>{paquetes.length} paquetes registrados</Text>
        </View>
        <TouchableOpacity 
          style={styles.botonAgregarHeader}
          onPress={() => abrirModal()}
        >
          <IconSymbol name="plus" size={24} color={Tema.dark.tint} />
        </TouchableOpacity>
      </View>

      {cargando && !refrescando ? (
        <View style={styles.cargandoContenedor}>
          <ActivityIndicator size="large" color={Tema.dark.tint} />
        </View>
      ) : (
        <FlatList
          data={paquetes}
          renderItem={renderPaquete}
          keyExtractor={(item) => item.Id_Paquete.toString()}
          contentContainerStyle={styles.lista}
          refreshControl={
            <RefreshControl refreshing={refrescando} onRefresh={onRefresh} tintColor={Tema.dark.tint} />
          }
        />
      )}

      {/* Modal Formulario */}
      <Modal visible={modalVisible} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitulo}>{paqueteEditando ? 'Editar Paquete' : 'Nuevo Paquete'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <IconSymbol name="xmark" size={24} color={Tema.dark.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Nombre *</Text>
            <TextInput
              style={styles.input}
              value={formData.nombre}
              onChangeText={(text) => setFormData({...formData, nombre: text})}
              placeholder="Ej. Paquete Básico"
              placeholderTextColor={Tema.dark.textSecondary}
            />

            <Text style={styles.label}>Precio (COP) *</Text>
            <TextInput
              style={styles.input}
              value={formData.precio}
              onChangeText={(text) => setFormData({...formData, precio: text})}
              placeholder="Ej. 150000"
              placeholderTextColor={Tema.dark.textSecondary}
              keyboardType="numeric"
            />

            <Text style={styles.label}>URL Imagen</Text>
            <TextInput
              style={styles.input}
              value={formData.imagen}
              onChangeText={(text) => setFormData({...formData, imagen: text})}
              placeholder="https://..."
              placeholderTextColor={Tema.dark.textSecondary}
            />

            <Text style={styles.label}>Descripción *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.descripcion}
              onChangeText={(text) => setFormData({...formData, descripcion: text})}
              placeholder="Detalles del paquete..."
              placeholderTextColor={Tema.dark.textSecondary}
              multiline
              numberOfLines={4}
            />

            <TouchableOpacity 
              style={[styles.botonGuardar, guardando && { opacity: 0.7 }]} 
              onPress={guardarPaquete}
              disabled={guardando}
            >
              {guardando ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.botonGuardarTexto}>GUARDAR PAQUETE</Text>
              )}
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
  headerTextContainer: {
    flex: 1,
  },
  botonVolver: {
    padding: Espaciado.sm,
    marginRight: Espaciado.sm,
    marginLeft: -Espaciado.sm,
  },
  botonAgregarHeader: {
    padding: Espaciado.sm,
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
    flexDirection: 'row',
    backgroundColor: Tema.dark.surface,
    borderRadius: RadioBorde.md,
    borderWidth: 1,
    borderColor: Tema.dark.border,
    padding: Espaciado.sm,
    alignItems: 'center',
  },
  tarjetaInactiva: {
    opacity: 0.6,
  },
  imagen: {
    width: 60,
    height: 60,
    borderRadius: RadioBorde.sm,
    backgroundColor: Tema.dark.surface2,
  },
  info: {
    flex: 1,
    marginLeft: Espaciado.md,
    justifyContent: 'center',
  },
  nombre: {
    color: Tema.dark.text,
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  precio: {
    color: Tema.dark.tint,
    fontSize: 14,
    fontWeight: '600',
  },
  estadoTexto: {
    color: Tema.dark.textSecondary,
    fontSize: 10,
    marginTop: 4,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  acciones: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Espaciado.xs,
  },
  botonAccion: {
    padding: Espaciado.sm,
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
    paddingBottom: Espaciado.xl * 2,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Espaciado.lg,
  },
  modalTitulo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Tema.dark.text,
  },
  label: {
    color: Tema.dark.textSecondary,
    fontSize: 12,
    marginBottom: 6,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: Tema.dark.surface2,
    color: Tema.dark.text,
    borderRadius: RadioBorde.md,
    padding: Espaciado.md,
    marginBottom: Espaciado.md,
    borderWidth: 1,
    borderColor: Tema.dark.border,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  botonGuardar: {
    backgroundColor: Tema.dark.tint,
    padding: Espaciado.md,
    borderRadius: RadioBorde.md,
    alignItems: 'center',
    marginTop: Espaciado.md,
  },
  botonGuardarTexto: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 1,
  },
});
