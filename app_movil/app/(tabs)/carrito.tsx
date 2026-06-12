import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Alert, ActivityIndicator, Modal, TextInput, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CarritoContext } from '@/src/contexto/ContextoCarrito';
import { AuthContext } from '@/src/contexto/ContextoAuth';
import servicioCatalogo from '@/src/servicios/servicioCatalogo';
import servicioPedido from '@/src/servicios/servicioPedido';
import { Tema, Espaciado, RadioBorde } from '@/constants/tema';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function CarritoScreen() {
  const router = useRouter();
  const { items, totalPrecio, totalItems, cargando, eliminarItem, vaciarCarrito } = useContext(CarritoContext);
  const { estaAutenticado } = useContext(AuthContext);

  const [modalCheckoutVisible, setModalCheckoutVisible] = useState(false);
  const [pasoCheckout, setPasoCheckout] = useState(1);
  const [orderIdFactura, setOrderIdFactura] = useState('');
  const [datosCheckout, setDatosCheckout] = useState({
    direccion: '',
    telefono: '',
    notas: ''
  });
  const [datosPago, setDatosPago] = useState({
    metodo: 'tarjeta',
    numero: '',
    titular: '',
    expiracion: '',
    cvv: ''
  });

  const formatPrecio = (precio) => {
    return Number(precio).toLocaleString('es-CO');
  };

  const confirmarVaciado = () => {
    Alert.alert(
      'Vaciar Carrito',
      '¿Estás seguro de que deseas eliminar todos los productos?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Vaciar', style: 'destructive', onPress: () => vaciarCarrito() }
      ]
    );
  };

  const confirmarEliminacionItem = (item) => {
    Alert.alert(
      'Cancelar Solicitud',
      `¿Estás seguro que deseas eliminar "${item.nombre}" del carrito?`,
      [
        { text: 'No', style: 'cancel' },
        { text: 'Sí, cancelar', style: 'destructive', onPress: () => eliminarItem(item.id) }
      ]
    );
  };

  const procesarCompra = () => {
    if (!estaAutenticado) {
      Alert.alert(
        'Inicia Sesión',
        'Necesitas iniciar sesión para completar tu compra.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Iniciar Sesión', onPress: () => router.push('/auth/login') }
        ]
      );
      return;
    }
    
    setDatosCheckout({ direccion: '', telefono: '', notas: '' });
    setDatosPago({ metodo: 'tarjeta', numero: '', titular: '', expiracion: '', cvv: '' });
    setPasoCheckout(1);
    setModalCheckoutVisible(true);
  };

  const handleContinuarPago = () => {
    if (!datosCheckout.direccion.trim() || !datosCheckout.telefono.trim()) {
      Alert.alert('Error', 'Por favor completa los campos obligatorios (*)');
      return;
    }
    setPasoCheckout(2);
  };

  const handleConfirmarPedidoCheckout = async () => {
    if (datosPago.metodo === 'tarjeta') {
      if (!datosPago.numero.trim() || !datosPago.titular.trim() || !datosPago.expiracion.trim() || !datosPago.cvv.trim()) {
        Alert.alert('Error', 'Por favor completa los datos de la tarjeta.');
        return;
      }
    }

    try {
      await servicioPedido.crearPedido({
        direccionEnvio: datosCheckout.direccion,
        telefono: datosCheckout.telefono,
        notas: datosCheckout.notas || 'Pedido desde la app móvil',
        metodoPago: datosPago.metodo
      });
      setOrderIdFactura(`CDL-${Math.floor(10000000 + Math.random() * 90000000)}`);
      setPasoCheckout(3);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo procesar el pago.');
    }
  };

  const renderItem = ({ item }) => {
    const imagenUrl = servicioCatalogo.construirUrlImagen(item.imagen);

    return (
      <View style={styles.itemCarrito}>
        <View style={styles.imagenPlaceholder}>
          {item.imagen ? <Image source={{ uri: imagenUrl }} style={styles.imagen} /> : null}
        </View>
        <View style={styles.itemInfoContenedor}>
          <View style={styles.itemInfo}>
            <Text style={styles.nombre} numberOfLines={2}>{item.nombre}</Text>
            <Text style={styles.precio}>${formatPrecio(item.precioUnitario)} c/u</Text>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Text style={styles.subtotalEtiqueta}>Subtotal: </Text>
              <Text style={styles.subtotalMonto}>${formatPrecio(item.subtotal)}</Text>
            </View>
          </View>

          <View style={styles.controlesContenedor}>
            <TouchableOpacity
              style={styles.botonCancelarSolicitud}
              onPress={() => confirmarEliminacionItem(item)}
            >
              <Text style={styles.textoCancelarSolicitud}>Cancelar Solicitud</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.titulo}>Tu <Text style={styles.tituloDestacado}>Carrito</Text></Text>
          <Text style={styles.subtitulo}>{totalItems} {totalItems === 1 ? 'artículo' : 'artículos'}</Text>
        </View>

        {items.length > 0 && (
          <TouchableOpacity onPress={confirmarVaciado} style={styles.botonVaciar}>
            <IconSymbol name="trash" size={18} color={Tema.dark.error} />
            <Text style={styles.textoVaciar}>Vaciar</Text>
          </TouchableOpacity>
        )}
      </View>

      {cargando ? (
        <View style={styles.cargandoContenedor}>
          <ActivityIndicator size="large" color={Tema.dark.tint} />
        </View>
      ) : items.length === 0 ? (
        <View style={styles.vacioContenedor}>
          <IconSymbol name="cart" size={80} color={Tema.dark.borderRed} />
          <Text style={styles.vacioTitulo}>Tu carrito está vacío</Text>
          <Text style={styles.vacioSubtitulo}>¡Explora nuestros productos y encuentra el detalle perfecto!</Text>
          <TouchableOpacity
            style={styles.botonExplorar}
            onPress={() => router.push('/(tabs)')}
          >
            <Text style={styles.botonExplorarTexto}>IR A LA TIENDA</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={items}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.lista}
          />
          <View style={styles.footer}>
            <View style={styles.totalContenedor}>
              <Text style={styles.totalTexto}>Total:</Text>
              <Text style={styles.totalMonto}>${formatPrecio(totalPrecio)}</Text>
            </View>
            <TouchableOpacity
              style={styles.botonComprar}
              onPress={procesarCompra}
            >
              <Text style={styles.botonComprarTexto}>CONTINUAR COMPRA  →</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* Modal de Checkout */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalCheckoutVisible}
        onRequestClose={() => setModalCheckoutVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContainer}>
            <TouchableOpacity style={styles.closeButton} onPress={() => setModalCheckoutVisible(false)}>
              <IconSymbol name="xmark" size={16} color="#fff" />
            </TouchableOpacity>

            <ScrollView contentContainerStyle={styles.modalScroll} bounces={false}>
              {pasoCheckout === 3 ? (
                <View style={styles.facturaContenedorPrincipal}>
                  <View style={styles.facturaNotificacion}>
                    <IconSymbol name="checkmark.circle.fill" size={36} color="#00E676" />
                    <Text style={styles.facturaNotiTitulo}>¡Pedido Confirmado!</Text>
                    <Text style={styles.facturaNotiSub}>Tu pedido ha sido procesado exitosamente</Text>
                  </View>

                  <View style={styles.facturaCard}>
                    <View style={styles.facturaHeaderRow}>
                      <View style={{flex: 1}}>
                        <Text style={styles.facturaLogoTexto}>Communicating Design</Text>
                        <Text style={styles.facturaLogoTexto}>Lion</Text>
                        <Text style={styles.facturaInfoEmpresa}>📍 Bogotá D.C., Colombia</Text>
                        <Text style={styles.facturaInfoEmpresa}>🏢 NIT: 9012355862-2</Text>
                        <Text style={styles.facturaInfoEmpresa}>✉️ c.designlion025@gmail.com</Text>
                        <Text style={styles.facturaInfoEmpresa}>📞 +57 313 274 1001</Text>
                      </View>
                      <View style={styles.facturaHeaderDerecha}>
                        <View style={styles.badgePagado}><Text style={styles.badgePagadoTexto}>PAGADO</Text></View>
                        <Text style={styles.facturaNumeroTexto}>Factura #{orderIdFactura}</Text>
                        <View style={styles.badgeConfirmado}><Text style={styles.badgeConfirmadoTexto}>✓ CONFIRMADO</Text></View>
                      </View>
                    </View>

                    <View style={styles.facturaSeccion}>
                      <Text style={styles.facturaSeccionTitulo}>👤 Datos del Cliente</Text>
                      <View style={styles.facturaFila}>
                        <Text style={styles.facturaLabel}>NOMBRE:</Text>
                        <Text style={styles.facturaValor}>{datosPago.titular || 'Cliente'}</Text>
                      </View>
                      <View style={styles.facturaFila}>
                        <Text style={styles.facturaLabel}>TELÉFONO:</Text>
                        <Text style={styles.facturaValor}>{datosCheckout.telefono}</Text>
                      </View>
                      <View style={styles.facturaFila}>
                        <Text style={styles.facturaLabel}>DESTINATARIO:</Text>
                        <Text style={styles.facturaValor}>{datosCheckout.notas || (datosPago.titular || 'Mismo cliente')}</Text>
                      </View>
                    </View>

                    <View style={styles.facturaSeccion}>
                      <Text style={styles.facturaSeccionTitulo}>🚚 Dirección de Entrega</Text>
                      <View style={styles.facturaFila}>
                        <Text style={styles.facturaLabel}>DIRECCIÓN:</Text>
                        <Text style={styles.facturaValor}>{datosCheckout.direccion}</Text>
                      </View>
                      <View style={styles.facturaFila}>
                        <Text style={styles.facturaLabel}>CIUDAD:</Text>
                        <Text style={styles.facturaValor}>Bogotá</Text>
                      </View>
                      <View style={styles.facturaFila}>
                        <Text style={styles.facturaLabel}>TELÉFONO:</Text>
                        <Text style={styles.facturaValor}>{datosCheckout.telefono}</Text>
                      </View>
                    </View>

                    <View style={styles.facturaSeccion}>
                      <Text style={styles.facturaSeccionTitulo}>🛍️ Detalle del Pedido</Text>
                      <View style={styles.facturaTablaHeader}>
                        <Text style={styles.facturaTablaHeaderTexto}>PRODUCTO</Text>
                        <Text style={styles.facturaTablaHeaderTexto}>PRECIO</Text>
                      </View>
                      {items.map(item => (
                        <View key={item.id} style={styles.facturaTablaFila}>
                          <Text style={styles.facturaTablaProducto}>■ {item.nombre}</Text>
                          <Text style={styles.facturaTablaPrecio}>${formatPrecio(item.subtotal)}</Text>
                        </View>
                      ))}
                      
                      <View style={styles.facturaTotalesBox}>
                        <View style={styles.facturaFilaSubtotal}>
                          <Text style={styles.facturaSubtotalLabel}>Subtotal</Text>
                          <Text style={styles.facturaSubtotalValor}>${formatPrecio(totalPrecio)}</Text>
                        </View>
                        <View style={styles.facturaFilaSubtotal}>
                          <Text style={styles.facturaSubtotalLabel}>IVA (10%)</Text>
                          <Text style={styles.facturaSubtotalValor}>${formatPrecio(totalPrecio * 0.1)}</Text>
                        </View>
                        <View style={styles.facturaTotalLinea} />
                        <View style={styles.facturaFilaSubtotal}>
                          <Text style={styles.facturaTotalLabel}>TOTAL</Text>
                          <Text style={styles.facturaTotalValor}>${formatPrecio(totalPrecio * 1.1)}</Text>
                        </View>
                      </View>
                    </View>

                    <View style={styles.facturaFilaMetodo}>
                      <Text style={styles.facturaMetodoLabel}>💳 Método de Pago:</Text>
                      <Text style={styles.facturaMetodoValor}>{datosPago.metodo.toUpperCase()} ({datosPago.numero || '...' })</Text>
                    </View>

                    <View style={styles.facturaBotones}>
                      <TouchableOpacity style={styles.facturaBtnImprimir}>
                        <IconSymbol name="bag.fill" size={16} color="#fff" />
                        <Text style={styles.facturaBtnImprimirTexto}>Imprimir Factura</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={styles.facturaBtnNueva}
                        onPress={() => {
                          setModalCheckoutVisible(false);
                          vaciarCarrito();
                          router.push('/(tabs)');
                        }}
                      >
                        <IconSymbol name="cart.fill" size={16} color={Tema.dark.tint} />
                        <Text style={styles.facturaBtnNuevaTexto}>Nueva Compra</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ) : pasoCheckout === 1 ? (
                <>
                  <Text style={styles.modalTitle}>Detalles de Entrega</Text>
                  <Text style={styles.modalSubtitle}>
                    Paso 1 de 2: Completa tus datos
                  </Text>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>DIRECCIÓN DE ENVÍO *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Ej: Calle 123 #45-67, Barrio..."
                      placeholderTextColor={Tema.dark.textSecondary}
                      value={datosCheckout.direccion}
                      onChangeText={(text) => setDatosCheckout({ ...datosCheckout, direccion: text })}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>TELÉFONO *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="+57 300 000 0000"
                      placeholderTextColor={Tema.dark.textSecondary}
                      keyboardType="phone-pad"
                      value={datosCheckout.telefono}
                      onChangeText={(text) => setDatosCheckout({ ...datosCheckout, telefono: text })}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>NOTAS ADICIONALES</Text>
                    <TextInput
                      style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                      placeholder="Instrucciones especiales para la entrega..."
                      placeholderTextColor={Tema.dark.textSecondary}
                      multiline
                      numberOfLines={3}
                      value={datosCheckout.notas}
                      onChangeText={(text) => setDatosCheckout({ ...datosCheckout, notas: text })}
                    />
                  </View>

                  <View style={styles.modalActions}>
                    <TouchableOpacity style={styles.btnCancelarModal} onPress={() => setModalCheckoutVisible(false)}>
                      <Text style={styles.btnCancelarModalTexto}>Cancelar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.btnConfirmarModal} onPress={handleContinuarPago}>
                      <Text style={styles.btnConfirmarModalTexto}>Continuar Pago</Text>
                      <IconSymbol name="arrow.right" size={16} color="#fff" />
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                <>
                  <View style={styles.headerPasoVolver}>
                    <TouchableOpacity style={styles.btnVolverLinea} onPress={() => setPasoCheckout(1)}>
                      <IconSymbol name="arrow.left" size={14} color={Tema.dark.tint} />
                      <Text style={styles.textoVolver}>VOLVER A ENTREGA</Text>
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.modalTitlePago}>MÉTODOS DE PAGO</Text>
                  
                  <View style={styles.metodosPagoColumna}>
                    <View style={styles.metodosPagoFila}>
                      <TouchableOpacity 
                        style={[styles.metodoPagoItem, datosPago.metodo === 'tarjeta' && styles.metodoPagoActivo]}
                        onPress={() => setDatosPago({...datosPago, metodo: 'tarjeta'})}
                      >
                        <IconSymbol name="creditcard.fill" size={28} color={datosPago.metodo === 'tarjeta' ? Tema.dark.tint : Tema.dark.textSecondary} />
                        <Text style={styles.metodoPagoNombre}>TARJETA</Text>
                        <Text style={styles.metodoPagoSub}>Crédito/Débito</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity 
                        style={[styles.metodoPagoItem, datosPago.metodo === 'nequi' && styles.metodoPagoActivo]}
                        onPress={() => setDatosPago({...datosPago, metodo: 'nequi'})}
                      >
                        <IconSymbol name="iphone" size={28} color={datosPago.metodo === 'nequi' ? Tema.dark.tint : Tema.dark.textSecondary} />
                        <Text style={styles.metodoPagoNombre}>NEQUI</Text>
                        <Text style={styles.metodoPagoSub}>Pago móvil</Text>
                      </TouchableOpacity>
                    </View>

                    <View style={styles.metodosPagoFila}>
                      <TouchableOpacity 
                        style={[styles.metodoPagoItem, datosPago.metodo === 'daviplata' && styles.metodoPagoActivo]}
                        onPress={() => setDatosPago({...datosPago, metodo: 'daviplata'})}
                      >
                        <IconSymbol name="bag.fill" size={28} color={datosPago.metodo === 'daviplata' ? Tema.dark.tint : Tema.dark.textSecondary} />
                        <Text style={styles.metodoPagoNombre}>DAVIPLATA</Text>
                        <Text style={styles.metodoPagoSub}>Billetera digital</Text>
                      </TouchableOpacity>

                      <TouchableOpacity 
                        style={[styles.metodoPagoItem, datosPago.metodo === 'transferencia' && styles.metodoPagoActivo]}
                        onPress={() => setDatosPago({...datosPago, metodo: 'transferencia'})}
                      >
                        <IconSymbol name="building.columns.fill" size={28} color={datosPago.metodo === 'transferencia' ? Tema.dark.tint : Tema.dark.textSecondary} />
                        <Text style={styles.metodoPagoNombre}>TRANSFERENCIA</Text>
                        <Text style={styles.metodoPagoSub}>Bancaria</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {datosPago.metodo === 'tarjeta' && (
                    <View style={styles.formularioTarjeta}>
                      <Text style={styles.labelSeccion}>INFORMACIÓN DE TARJETA</Text>
                      
                      <View style={styles.inputGroup}>
                        <Text style={styles.label}>NÚMERO DE TARJETA *</Text>
                        <TextInput
                          style={styles.input}
                          placeholder="1234 5678 9012 3456"
                          placeholderTextColor={Tema.dark.textSecondary}
                          keyboardType="number-pad"
                          value={datosPago.numero}
                          onChangeText={(text) => setDatosPago({ ...datosPago, numero: text })}
                        />
                      </View>

                      <View style={styles.inputGroup}>
                        <Text style={styles.label}>TITULAR *</Text>
                        <TextInput
                          style={styles.input}
                          placeholder="Nombre completo"
                          placeholderTextColor={Tema.dark.textSecondary}
                          value={datosPago.titular}
                          onChangeText={(text) => setDatosPago({ ...datosPago, titular: text })}
                        />
                      </View>

                      <View style={styles.filaInputs}>
                        <View style={[styles.inputGroup, { flex: 1, marginRight: Espaciado.md }]}>
                          <Text style={styles.label}>EXPIRACIÓN *</Text>
                          <TextInput
                            style={styles.input}
                            placeholder="MM/AA"
                            placeholderTextColor={Tema.dark.textSecondary}
                            value={datosPago.expiracion}
                            onChangeText={(text) => setDatosPago({ ...datosPago, expiracion: text })}
                          />
                        </View>
                        <View style={[styles.inputGroup, { flex: 1 }]}>
                          <Text style={styles.label}>CVV *</Text>
                          <TextInput
                            style={styles.input}
                            placeholder="123"
                            placeholderTextColor={Tema.dark.textSecondary}
                            keyboardType="number-pad"
                            secureTextEntry
                            value={datosPago.cvv}
                            onChangeText={(text) => setDatosPago({ ...datosPago, cvv: text })}
                          />
                        </View>
                      </View>
                    </View>
                  )}

                  {datosPago.metodo === 'nequi' && (
                    <View style={styles.formularioTarjeta}>
                      <Text style={styles.labelSeccion}>INFORMACIÓN DE NEQUI</Text>
                      <View style={styles.inputGroup}>
                        <Text style={styles.label}>NÚMERO DE CELULAR *</Text>
                        <TextInput
                          style={styles.input}
                          placeholder="300 000 0000"
                          placeholderTextColor={Tema.dark.textSecondary}
                          keyboardType="phone-pad"
                        />
                      </View>
                    </View>
                  )}

                  {datosPago.metodo === 'daviplata' && (
                    <View style={styles.formularioTarjeta}>
                      <Text style={styles.labelSeccion}>INFORMACIÓN DE DAVIPLATA</Text>
                      <View style={styles.inputGroup}>
                        <Text style={styles.label}>NÚMERO DE CELULAR *</Text>
                        <TextInput
                          style={styles.input}
                          placeholder="300 000 0000"
                          placeholderTextColor={Tema.dark.textSecondary}
                          keyboardType="phone-pad"
                        />
                      </View>
                    </View>
                  )}

                  {datosPago.metodo === 'transferencia' && (
                    <View style={styles.formularioTarjeta}>
                      <Text style={styles.labelSeccion}>INFORMACIÓN DE TRANSFERENCIA</Text>
                      <Text style={{color: Tema.dark.textSecondary, fontSize: 13, marginBottom: 15}}>
                        Transfiere el total a la cuenta Bancolombia Ahorros #123-456789-00 y anota la referencia.
                      </Text>
                      <View style={styles.inputGroup}>
                        <Text style={styles.label}>NÚMERO DE REFERENCIA / COMPROBANTE *</Text>
                        <TextInput
                          style={styles.input}
                          placeholder="Ej: 987654321"
                          placeholderTextColor={Tema.dark.textSecondary}
                          keyboardType="number-pad"
                        />
                      </View>
                    </View>
                  )}

                  <View style={styles.resumenPedido}>
                    <Text style={styles.resumenTitulo}>RESUMEN DEL PEDIDO</Text>
                    {items.map(item => (
                      <View key={item.id} style={styles.resumenFila}>
                        <Text style={styles.resumenItem}>{item.nombre}</Text>
                        <Text style={styles.resumenValor}>${formatPrecio(item.subtotal)}</Text>
                      </View>
                    ))}
                    <View style={styles.separadorResumen} />
                    <View style={styles.resumenFila}>
                      <Text style={styles.resumenLabel}>SUBTOTAL</Text>
                      <Text style={styles.resumenValor}>${formatPrecio(totalPrecio)}</Text>
                    </View>
                    <View style={styles.resumenFila}>
                      <Text style={styles.resumenLabel}>IVA (10%)</Text>
                      <Text style={styles.resumenValor}>${formatPrecio(totalPrecio * 0.1)}</Text>
                    </View>
                    <View style={styles.separadorResumen} />
                    <View style={styles.resumenFilaTotal}>
                      <Text style={styles.resumenTotalLabel}>TOTAL</Text>
                      <Text style={styles.resumenTotalValor}>${formatPrecio(totalPrecio * 1.1)}</Text>
                    </View>
                  </View>

                  <TouchableOpacity style={styles.btnPagarFull} onPress={handleConfirmarPedidoCheckout}>
                    <IconSymbol name="lock.fill" size={16} color="#fff" />
                    <Text style={styles.btnPagarFullTexto}>CONFIRMAR Y PAGAR ${formatPrecio(totalPrecio * 1.1)}</Text>
                  </TouchableOpacity>
                </>
              )}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  botonVaciar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: Espaciado.sm,
  },
  textoVaciar: {
    color: Tema.dark.error,
    fontSize: 14,
    fontWeight: '600',
  },
  cargandoContenedor: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lista: {
    padding: Espaciado.lg,
    paddingTop: Espaciado.sm,
    gap: Espaciado.md,
  },
  itemCarrito: {
    flexDirection: 'row',
    backgroundColor: '#16161E',
    borderRadius: RadioBorde.lg,
    padding: Espaciado.lg,
    borderWidth: 1,
    borderColor: '#2A2A35',
  },
  imagenPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: RadioBorde.md,
    backgroundColor: '#1C1C26',
    overflow: 'hidden',
  },
  imagen: {
    width: '100%',
    height: '100%',
  },
  itemInfoContenedor: {
    flex: 1,
    flexDirection: 'column',
    marginLeft: Espaciado.md,
    justifyContent: 'space-between',
  },
  itemInfo: {
    marginBottom: Espaciado.sm,
  },
  nombre: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  precio: {
    color: Tema.dark.textSecondary,
    fontSize: 13,
    marginBottom: 4,
  },
  subtotalEtiqueta: {
    color: Tema.dark.tint,
    fontSize: 13,
    fontWeight: 'bold',
  },
  subtotalMonto: {
    color: Tema.dark.tint,
    fontSize: 15,
    fontWeight: 'bold',
  },
  controlesContenedor: {
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  botonCancelarSolicitud: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Tema.dark.tint,
    paddingHorizontal: Espaciado.md,
    paddingVertical: 10,
    borderRadius: RadioBorde.md,
  },
  textoCancelarSolicitud: {
    color: Tema.dark.tint,
    fontSize: 12,
    fontWeight: '600',
  },
  vacioContenedor: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Espaciado.xl,
  },
  vacioTitulo: {
    color: Tema.dark.text,
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: Espaciado.lg,
    marginBottom: Espaciado.sm,
  },
  vacioSubtitulo: {
    color: Tema.dark.textSecondary,
    textAlign: 'center',
    marginBottom: Espaciado.xl,
  },
  botonExplorar: {
    backgroundColor: Tema.dark.tint,
    paddingHorizontal: Espaciado.xl,
    paddingVertical: Espaciado.md,
    borderRadius: RadioBorde.md,
  },
  botonExplorarTexto: {
    color: '#fff',
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  footer: {
    padding: Espaciado.lg,
    backgroundColor: Tema.dark.surface,
    borderTopWidth: 1,
    borderTopColor: Tema.dark.borderRed,
  },
  totalContenedor: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Espaciado.md,
  },
  totalTexto: {
    color: Tema.dark.text,
    fontSize: 18,
    fontWeight: '600',
  },
  totalMonto: {
    color: Tema.dark.tint,
    fontSize: 26,
    fontWeight: 'bold',
  },
  botonComprar: {
    backgroundColor: Tema.dark.tint,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Espaciado.lg,
    borderRadius: RadioBorde.md,
    width: '100%',
    marginTop: Espaciado.sm,
  },
  botonComprarTexto: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 2,
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
  btnCancelarModal: {
    flex: 1,
    paddingVertical: Espaciado.md,
    borderRadius: RadioBorde.md,
    borderWidth: 1,
    borderColor: '#2A2A35',
    backgroundColor: '#16161E',
    alignItems: 'center',
  },
  btnCancelarModalTexto: {
    color: Tema.dark.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  btnConfirmarModal: {
    flex: 2,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Espaciado.md,
    borderRadius: RadioBorde.md,
    backgroundColor: Tema.dark.tint,
    gap: Espaciado.sm,
  },
  btnConfirmarModalTexto: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  headerPasoVolver: {
    flexDirection: 'row',
    marginBottom: Espaciado.lg,
    alignItems: 'center',
  },
  btnVolverLinea: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#2A2A35',
    paddingHorizontal: Espaciado.md,
    paddingVertical: 6,
    borderRadius: RadioBorde.sm,
    backgroundColor: 'transparent',
  },
  textoVolver: {
    color: Tema.dark.tint,
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  modalTitlePago: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: Espaciado.lg,
    letterSpacing: 1,
  },
  metodosPagoColumna: {
    flexDirection: 'column',
    marginBottom: Espaciado.xl,
  },
  metodosPagoFila: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    width: '100%',
  },
  metodoPagoItem: {
    width: '48%',
    backgroundColor: '#16161E',
    borderWidth: 1,
    borderColor: '#2A2A35',
    borderRadius: RadioBorde.md,
    padding: Espaciado.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metodoPagoActivo: {
    borderColor: Tema.dark.tint,
    shadowColor: Tema.dark.tint,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  metodoPagoNombre: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
    marginTop: Espaciado.md,
    marginBottom: 4,
  },
  metodoPagoSub: {
    color: Tema.dark.textSecondary,
    fontSize: 10,
  },
  formularioTarjeta: {
    marginBottom: Espaciado.xl,
  },
  labelSeccion: {
    color: Tema.dark.tint,
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: Espaciado.md,
    letterSpacing: 1,
  },
  filaInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  resumenPedido: {
    backgroundColor: '#16161E',
    borderWidth: 1,
    borderColor: '#2A2A35',
    borderRadius: RadioBorde.lg,
    padding: Espaciado.lg,
    marginBottom: Espaciado.xl,
  },
  resumenTitulo: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: Espaciado.md,
    letterSpacing: 1,
  },
  resumenFila: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Espaciado.sm,
  },
  resumenItem: {
    color: '#fff',
    fontSize: 13,
  },
  resumenLabel: {
    color: Tema.dark.textSecondary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  resumenValor: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  separadorResumen: {
    height: 1,
    backgroundColor: '#2A2A35',
    marginVertical: Espaciado.sm,
  },
  resumenFilaTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Espaciado.xs,
  },
  resumenTotalLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resumenTotalValor: {
    color: Tema.dark.tint,
    fontSize: 16,
    fontWeight: 'bold',
  },
  btnPagarFull: {
    backgroundColor: Tema.dark.tint,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Espaciado.lg,
    borderRadius: RadioBorde.md,
    gap: Espaciado.sm,
  },
  btnPagarFullTexto: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  facturaContenedorPrincipal: {
    width: '100%',
  },
  facturaNotificacion: {
    borderWidth: 1,
    borderColor: '#00E676',
    borderRadius: RadioBorde.md,
    padding: Espaciado.lg,
    alignItems: 'center',
    marginBottom: Espaciado.lg,
    backgroundColor: 'rgba(0, 230, 118, 0.05)',
  },
  facturaNotiTitulo: {
    color: '#00E676',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: Espaciado.sm,
  },
  facturaNotiSub: {
    color: Tema.dark.textSecondary,
    fontSize: 12,
  },
  facturaCard: {
    backgroundColor: '#fff',
    borderRadius: RadioBorde.md,
    padding: Espaciado.lg,
  },
  facturaHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Espaciado.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: Espaciado.md,
  },
  facturaLogoTexto: {
    color: Tema.dark.tint,
    fontStyle: 'italic',
    fontSize: 16,
    fontWeight: 'bold',
  },
  facturaInfoEmpresa: {
    color: '#666',
    fontSize: 10,
    marginTop: 2,
  },
  facturaHeaderDerecha: {
    alignItems: 'flex-end',
  },
  badgePagado: {
    backgroundColor: '#00E676',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
  },
  badgePagadoTexto: {
    color: '#fff',
    fontSize: 9,
    fontWeight: 'bold',
  },
  facturaNumeroTexto: {
    color: Tema.dark.tint,
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  badgeConfirmado: {
    backgroundColor: '#00E676',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeConfirmadoTexto: {
    color: '#fff',
    fontSize: 9,
    fontWeight: 'bold',
  },
  facturaSeccion: {
    marginBottom: Espaciado.md,
    borderLeftWidth: 2,
    borderLeftColor: Tema.dark.tint,
    paddingLeft: Espaciado.sm,
    backgroundColor: '#FAFAFA',
    padding: Espaciado.sm,
    borderRadius: 4,
  },
  facturaSeccionTitulo: {
    color: Tema.dark.tint,
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: Espaciado.sm,
  },
  facturaFila: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  facturaLabel: {
    width: 90,
    color: '#333',
    fontSize: 10,
    fontWeight: 'bold',
  },
  facturaValor: {
    flex: 1,
    color: '#666',
    fontSize: 10,
  },
  facturaTablaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Tema.dark.tint,
    padding: 6,
    borderRadius: 4,
    marginBottom: Espaciado.sm,
  },
  facturaTablaHeaderTexto: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  facturaTablaFila: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: Espaciado.sm,
  },
  facturaTablaProducto: {
    color: '#333',
    fontSize: 11,
    fontWeight: '600',
  },
  facturaTablaPrecio: {
    color: Tema.dark.tint,
    fontSize: 11,
    fontWeight: 'bold',
  },
  facturaTotalesBox: {
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    padding: Espaciado.md,
    marginTop: Espaciado.md,
    alignSelf: 'flex-end',
    width: '70%',
    borderWidth: 1,
    borderColor: '#eee',
  },
  facturaFilaSubtotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  facturaSubtotalLabel: {
    color: '#666',
    fontSize: 10,
  },
  facturaSubtotalValor: {
    color: '#333',
    fontSize: 10,
  },
  facturaTotalLinea: {
    height: 1,
    backgroundColor: Tema.dark.tint,
    marginVertical: Espaciado.sm,
  },
  facturaTotalLabel: {
    color: Tema.dark.tint,
    fontSize: 12,
    fontWeight: 'bold',
  },
  facturaTotalValor: {
    color: Tema.dark.tint,
    fontSize: 12,
    fontWeight: 'bold',
  },
  facturaFilaMetodo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: Espaciado.md,
    marginTop: Espaciado.md,
  },
  facturaMetodoLabel: {
    color: '#333',
    fontSize: 11,
    fontWeight: 'bold',
  },
  facturaMetodoValor: {
    color: '#666',
    fontSize: 11,
  },
  facturaBotones: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Espaciado.xl,
    gap: Espaciado.md,
  },
  facturaBtnImprimir: {
    flex: 1,
    backgroundColor: Tema.dark.tint,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Espaciado.md,
    borderRadius: RadioBorde.sm,
    gap: 8,
  },
  facturaBtnImprimirTexto: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  facturaBtnNueva: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: Tema.dark.tint,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Espaciado.md,
    borderRadius: RadioBorde.sm,
    gap: 8,
  },
  facturaBtnNuevaTexto: {
    color: Tema.dark.tint,
    fontSize: 12,
    fontWeight: 'bold',
  },
});
