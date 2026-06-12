import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator, RefreshControl, Alert, Modal, TextInput, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import servicioCatalogo from '@/src/servicios/servicioCatalogo';
import { CarritoContext } from '@/src/contexto/ContextoCarrito';
import { Tema, Espaciado, RadioBorde } from '@/constants/tema';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function TiendaScreen() {
  const router = useRouter();
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [categoriaActiva, setCategoriaActiva] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  
  const [modalVisible, setModalVisible] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    correo: '',
    destinatario: ''
  });

  const { agregarAlCarrito } = useContext(CarritoContext);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      const [cats, prods] = await Promise.all([
        servicioCatalogo.obtenerCategorias(),
        servicioCatalogo.obtenerProductos()
      ]);
      setCategorias([{ Id_Categoria: null, Nombre_Categoria: 'Todos' }, ...cats]);
      setProductos(prods);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudieron cargar los productos');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const onRefresh = async () => {
    setRefrescando(true);
    await cargarDatos();
    setCategoriaActiva(null);
    setRefrescando(false);
  };

  const filtrarPorCategoria = async (idCat) => {
    setCategoriaActiva(idCat);
    try {
      setCargando(true);
      const prods = await servicioCatalogo.obtenerProductos(idCat);
      setProductos(prods);
    } catch (error) {
      console.error(error);
    } finally {
      setCargando(false);
    }
  };

  const handleAbrirModal = (producto) => {
    setProductoSeleccionado(producto);
    setFormData({ nombre: '', telefono: '', correo: '', destinatario: '' });
    setModalVisible(true);
  };

  const handleConfirmarPedido = () => {
    if (!formData.nombre.trim() || !formData.telefono.trim()) {
      Alert.alert('Error', 'Por favor completa los campos obligatorios (*)');
      return;
    }
    
    // Agregar el producto al carrito contextually
    agregarAlCarrito(productoSeleccionado, 1);
    setModalVisible(false);
    
    // Navegar al carrito
    router.push('/carrito');
  };

  const renderCategoria = ({ item }) => {
    const isActiva = categoriaActiva === item.Id_Categoria;
    return (
      <TouchableOpacity 
        style={[styles.categoriaBtn, isActiva && styles.categoriaBtnActiva]}
        onPress={() => filtrarPorCategoria(item.Id_Categoria)}
      >
        <Text style={[styles.categoriaTexto, isActiva && styles.categoriaTextoActiva]}>
          {item.Nombre_Categoria}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderProducto = ({ item }) => {
    const imagenUrl = servicioCatalogo.construirUrlImagen(item.Imagen_Producto);
    const precio = Number(item.Precio_Producto).toLocaleString('es-CO');

    return (
      <View style={styles.productoCard}>
        <Image source={{ uri: imagenUrl }} style={styles.productoImagen} resizeMode="cover" />
        <View style={styles.productoInfo}>
          <Text style={styles.productoNombre} numberOfLines={2}>{item.Nombre_Producto}</Text>
          <Text style={styles.productoPrecio}>${precio}</Text>
          
          <TouchableOpacity 
            style={styles.botonAgregar}
            onPress={() => handleAbrirModal(item)}
            disabled={item.Stock === 0}
          >
            <IconSymbol name="cart.badge.plus" size={18} color="#fff" />
            <Text style={styles.botonAgregarTexto}>
              {item.Stock === 0 ? 'AGOTADO' : 'AGREGAR'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.titulo}>Nuestros <Text style={styles.tituloDestacado}>Productos</Text></Text>
        <Text style={styles.subtitulo}>Encuentra el detalle perfecto</Text>
      </View>

      <View style={styles.categoriasContenedor}>
        <FlatList
          data={categorias}
          renderItem={renderCategoria}
          keyExtractor={(item) => item.Id_Categoria?.toString() || 'todos'}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriasLista}
        />
      </View>

      {cargando && !refrescando ? (
        <View style={styles.cargandoContenedor}>
          <ActivityIndicator size="large" color={Tema.dark.tint} />
        </View>
      ) : (
        <FlatList
          data={productos}
          renderItem={renderProducto}
          keyExtractor={(item) => item.Id_Producto.toString()}
          numColumns={2}
          contentContainerStyle={styles.productosLista}
          columnWrapperStyle={styles.productosFila}
          refreshControl={
            <RefreshControl refreshing={refrescando} onRefresh={onRefresh} tintColor={Tema.dark.tint} />
          }
          ListEmptyComponent={
            <View style={styles.vacioContenedor}>
              <Text style={styles.vacioTexto}>No hay productos en esta categoría</Text>
            </View>
          }
        />
      )}

      {/* Modal de Pedido */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContainer}>
            <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
              <IconSymbol name="xmark" size={16} color="#fff" />
            </TouchableOpacity>

            <ScrollView contentContainerStyle={styles.modalScroll} bounces={false}>
              <Text style={styles.modalTitle}>Formulario de Pedido</Text>
              <Text style={styles.modalSubtitle}>
                {productoSeleccionado?.Nombre_Producto} — ${productoSeleccionado ? Number(productoSeleccionado.Precio_Producto).toLocaleString('es-CO') : 0}
              </Text>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>NOMBRE COMPLETO *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ej: Juan Pérez"
                  placeholderTextColor={Tema.dark.textSecondary}
                  value={formData.nombre}
                  onChangeText={(text) => setFormData({ ...formData, nombre: text })}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>TELÉFONO *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="+57 300 000 0000"
                  placeholderTextColor={Tema.dark.textSecondary}
                  keyboardType="phone-pad"
                  value={formData.telefono}
                  onChangeText={(text) => setFormData({ ...formData, telefono: text })}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>CORREO ELECTRÓNICO</Text>
                <TextInput
                  style={styles.input}
                  placeholder="tu@correo.com"
                  placeholderTextColor={Tema.dark.textSecondary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={formData.correo}
                  onChangeText={(text) => setFormData({ ...formData, correo: text })}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>NOMBRE DEL DESTINATARIO</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Si es un regalo, ¿para quién?"
                  placeholderTextColor={Tema.dark.textSecondary}
                  value={formData.destinatario}
                  onChangeText={(text) => setFormData({ ...formData, destinatario: text })}
                />
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.btnCancelar} onPress={() => setModalVisible(false)}>
                  <Text style={styles.btnCancelarTexto}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.btnAgregarModal} onPress={handleConfirmarPedido}>
                  <IconSymbol name="cart.fill" size={18} color="#fff" />
                  <Text style={styles.btnAgregarModalTexto}>Agregar al Carrito</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
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
    padding: Espaciado.lg,
    paddingBottom: Espaciado.sm,
  },
  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Tema.dark.text,
  },
  tituloDestacado: {
    color: Tema.dark.tint,
  },
  subtitulo: {
    color: Tema.dark.textSecondary,
    fontSize: 14,
    marginTop: Espaciado.xs,
  },
  categoriasContenedor: {
    marginBottom: Espaciado.md,
  },
  categoriasLista: {
    paddingHorizontal: Espaciado.lg,
    gap: Espaciado.sm,
  },
  categoriaBtn: {
    paddingHorizontal: Espaciado.lg,
    paddingVertical: Espaciado.sm,
    borderRadius: RadioBorde.redondo,
    borderWidth: 1,
    borderColor: Tema.dark.border,
    backgroundColor: Tema.dark.surface,
  },
  categoriaBtnActiva: {
    backgroundColor: Tema.dark.tint,
    borderColor: Tema.dark.tint,
  },
  categoriaTexto: {
    color: Tema.dark.textSecondary,
    fontWeight: '600',
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  categoriaTextoActiva: {
    color: '#fff',
  },
  cargandoContenedor: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productosLista: {
    padding: Espaciado.lg,
    paddingTop: 0,
    paddingBottom: Espaciado.xxl,
  },
  productosFila: {
    justifyContent: 'space-between',
    marginBottom: Espaciado.lg,
  },
  productoCard: {
    width: '48%',
    backgroundColor: Tema.dark.surface,
    borderRadius: RadioBorde.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Tema.dark.border,
  },
  productoImagen: {
    width: '100%',
    height: 150,
    backgroundColor: Tema.dark.surface2,
  },
  productoInfo: {
    padding: Espaciado.md,
  },
  productoNombre: {
    color: Tema.dark.text,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: Espaciado.xs,
    height: 40,
  },
  productoPrecio: {
    color: Tema.dark.tint,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: Espaciado.md,
  },
  botonAgregar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Tema.dark.surface2,
    paddingVertical: Espaciado.sm,
    borderRadius: RadioBorde.md,
    gap: Espaciado.xs,
  },
  botonAgregarTexto: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  vacioContenedor: {
    padding: Espaciado.xl,
    alignItems: 'center',
  },
  vacioTexto: {
    color: Tema.dark.textSecondary,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 5, 10, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Espaciado.lg,
  },
  modalContainer: {
    width: '100%',
    backgroundColor: '#0F0F14',
    borderRadius: RadioBorde.lg,
    borderWidth: 1,
    borderColor: '#2A2A35',
    overflow: 'hidden',
    position: 'relative',
    shadowColor: Tema.dark.tint,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 15,
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Tema.dark.tint,
    backgroundColor: 'rgba(211, 47, 47, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  modalScroll: {
    padding: Espaciado.xl,
    paddingTop: Espaciado.xxl + 10,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: Espaciado.xs,
  },
  modalSubtitle: {
    color: Tema.dark.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: Espaciado.xl,
  },
  inputGroup: {
    marginBottom: Espaciado.lg,
  },
  label: {
    color: Tema.dark.textSecondary,
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: Espaciado.sm,
    letterSpacing: 1,
  },
  input: {
    backgroundColor: '#16161E',
    borderWidth: 1,
    borderColor: '#2A2A35',
    borderRadius: RadioBorde.md,
    padding: Espaciado.md,
    color: '#fff',
    fontSize: 15,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Espaciado.md,
    gap: Espaciado.md,
  },
  btnCancelar: {
    flex: 1,
    paddingVertical: Espaciado.md,
    borderRadius: RadioBorde.md,
    borderWidth: 1,
    borderColor: '#2A2A35',
    backgroundColor: '#16161E',
    alignItems: 'center',
  },
  btnCancelarTexto: {
    color: Tema.dark.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  btnAgregarModal: {
    flex: 2,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Espaciado.md,
    borderRadius: RadioBorde.md,
    backgroundColor: Tema.dark.tint,
    gap: Espaciado.sm,
  },
  btnAgregarModalTexto: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});