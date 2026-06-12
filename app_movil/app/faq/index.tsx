import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, LayoutAnimation, UIManager, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Tema, Espaciado, RadioBorde } from '@/constants/tema';
import { IconSymbol } from '@/components/ui/IconSymbol';

// Habilitar animaciones en Android
if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

export default function FAQScreen() {
  const [expandido, setExpandido] = useState(null);

  const preguntas = [
    {
      id: 1,
      pregunta: '¿Cuáles son los métodos de pago aceptados?',
      respuesta: 'Aceptamos transferencias bancarias (Bancolombia, Nequi, Daviplata), pagos en efectivo en nuestro estudio y pagos con tarjeta de crédito/débito a través de enlaces de pago seguros.',
      icono: 'creditcard.fill'
    },
    {
      id: 2,
      pregunta: '¿Con cuánto tiempo de anticipación debo reservar un paquete?',
      respuesta: 'Para garantizar disponibilidad, recomendamos reservar con al menos 2 semanas de anticipación para sesiones regulares, y con 2 meses para eventos grandes como bodas o quince años.',
      icono: 'calendar.badge.clock'
    },
    {
      id: 3,
      pregunta: '¿Realizan envíos de los productos físicos?',
      respuesta: 'Sí, realizamos envíos a nivel nacional. El costo del envío varía según el destino y el tamaño del paquete. Dentro del área metropolitana contamos con mensajería propia.',
      icono: 'cube.box.fill'
    },
    {
      id: 4,
      pregunta: '¿Puedo cancelar o reprogramar una cita?',
      respuesta: 'Sí. Puedes reprogramar tu cita sin costo adicional hasta con 48 horas de anticipación. Las cancelaciones pueden estar sujetas a la retención del anticipo dependiendo del tiempo de aviso.',
      icono: 'arrow.triangle.2.circlepath'
    },
    {
      id: 5,
      pregunta: '¿En qué formato entregan las fotografías digitales?',
      respuesta: 'Entregamos todas las fotografías editadas en alta resolución (formato JPG) a través de una galería privada en línea desde la cual podrás descargarlas y compartirlas.',
      icono: 'photo.fill'
    },
    {
      id: 6,
      pregunta: '¿Cómo funcionan los proyectos personalizados?',
      respuesta: 'Debes llenar el formulario de "Nueva Solicitud" describiendo tu idea. Nosotros la evaluamos y nos contactamos contigo para afinar detalles, darte una cotización y tiempos de entrega.',
      icono: 'wand.and.stars'
    }
  ];

  const toggleExpandir = (id) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandido(expandido === id ? null : id);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <Text style={styles.titulo}>Preguntas <Text style={styles.textoRojo}>Frecuentes</Text></Text>
        <Text style={styles.subtitulo}>Resuelve tus dudas sobre nuestros servicios y procesos.</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {preguntas.map((item) => {
          const isExpandido = expandido === item.id;
          
          return (
            <TouchableOpacity 
              key={item.id} 
              style={[styles.tarjeta, isExpandido && styles.tarjetaExpandida]}
              onPress={() => toggleExpandir(item.id)}
              activeOpacity={0.8}
            >
              <View style={styles.tarjetaHeader}>
                <View style={styles.iconoContenedor}>
                  <IconSymbol name={item.icono} size={20} color={Tema.dark.tint} />
                </View>
                <Text style={styles.pregunta}>{item.pregunta}</Text>
                <IconSymbol 
                  name={isExpandido ? "chevron.up" : "chevron.down"} 
                  size={20} 
                  color={Tema.dark.textSecondary} 
                />
              </View>
              
              {isExpandido && (
                <View style={styles.respuestaContenedor}>
                  <Text style={styles.respuesta}>{item.respuesta}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}

        <View style={styles.contactoContenedor}>
          <Text style={styles.contactoTitulo}>¿Aún tienes dudas?</Text>
          <Text style={styles.contactoTexto}>Contáctanos directamente a través de nuestro soporte por WhatsApp.</Text>
          <TouchableOpacity style={styles.botonContacto}>
            <IconSymbol name="phone.fill" size={18} color="#fff" />
            <Text style={styles.botonContactoTexto}>HABLAR CON SOPORTE</Text>
          </TouchableOpacity>
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
  header: {
    padding: Espaciado.lg,
  },
  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Tema.dark.text,
  },
  textoRojo: {
    color: Tema.dark.tint,
  },
  subtitulo: {
    color: Tema.dark.textSecondary,
    fontSize: 14,
    marginTop: Espaciado.xs,
  },
  scrollContent: {
    padding: Espaciado.lg,
    paddingTop: 0,
    gap: Espaciado.md,
  },
  tarjeta: {
    backgroundColor: Tema.dark.surface,
    borderRadius: RadioBorde.md,
    borderWidth: 1,
    borderColor: Tema.dark.border,
    overflow: 'hidden',
  },
  tarjetaExpandida: {
    borderColor: Tema.dark.borderRed,
  },
  tarjetaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Espaciado.md,
  },
  iconoContenedor: {
    width: 36,
    height: 36,
    borderRadius: RadioBorde.md,
    backgroundColor: Tema.dark.surface2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Espaciado.md,
  },
  pregunta: {
    flex: 1,
    color: Tema.dark.text,
    fontSize: 15,
    fontWeight: '600',
    paddingRight: Espaciado.sm,
  },
  respuestaContenedor: {
    padding: Espaciado.md,
    paddingTop: 0,
    paddingLeft: 36 + Espaciado.md * 2, // Alinear con el texto de la pregunta
  },
  respuesta: {
    color: Tema.dark.textSecondary,
    fontSize: 14,
    lineHeight: 22,
  },
  contactoContenedor: {
    marginTop: Espaciado.xl,
    padding: Espaciado.lg,
    backgroundColor: Tema.dark.surface2,
    borderRadius: RadioBorde.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Tema.dark.borderRed,
    borderStyle: 'dashed',
  },
  contactoTitulo: {
    color: Tema.dark.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: Espaciado.xs,
  },
  contactoTexto: {
    color: Tema.dark.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: Espaciado.lg,
  },
  botonContacto: {
    backgroundColor: '#25D366', // Color WhatsApp
    flexDirection: 'row',
    paddingHorizontal: Espaciado.xl,
    paddingVertical: Espaciado.md,
    borderRadius: RadioBorde.md,
    alignItems: 'center',
    gap: Espaciado.sm,
  },
  botonContactoTexto: {
    color: '#fff',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});
