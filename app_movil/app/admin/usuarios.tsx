import React, { useEffect, useState, useContext } from 'react';
import { 
    ActivityIndicator,
    Alert,
    FlatList,
    Pressable, 
    StyleSheet, 
    TextInput,
    View,
    Text,
    TouchableOpacity
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Tema, Espaciado, RadioBorde } from '@/constants/tema';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ThemedText } from '../../components/themed-text';

import { listarUsuarios, toggleUsuario, eliminarUsuario, cambiarRolUsuario } from '@/src/servicios/servicioUsuarioAdmin';
import { AuthContext } from '@/src/contexto/ContextoAuth';

type Usuario = {
    Id_Usuario?: number;
    Nombre?: string;
    Apellidos?: string;
    Correo?: string;
    Rol?: { Nombre_Rol: string } | string;
    Id_Rol?: number;
    Activo?: boolean;
}

export default function AdminUsuariosScreen() {
    const router = useRouter();
    const { usuario: user, esAdmin } = useContext(AuthContext) as any;

    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [usuariosFiltrados, setUsuariosFiltrados] = useState<Usuario[]>([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [busqueda, setBusqueda] = useState('');

    const fetchUsuarios = async () => {
        setLoading(true);
        setErrorMessage('');
        try {
            const data = await listarUsuarios();
            setUsuarios(data || []);
            setUsuariosFiltrados(data || []);
        } catch (error: unknown) {
            setErrorMessage((error as { message?: string})?.message || 'Error al cargar los usuarios');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!esAdmin) {
            router.replace('/(tabs)');
            return;
        }
        fetchUsuarios();
    }, [esAdmin]);

    const handleBuscar = (text: string) => {
        setBusqueda(text);
        if (!text.trim()) {
            setUsuariosFiltrados(usuarios);
            return;
        }
        
        const term = text.toLowerCase();
        const filtrados = usuarios.filter(u => 
            u.Nombre?.toLowerCase().includes(term) || 
            u.Apellidos?.toLowerCase().includes(term) ||
            u.Correo?.toLowerCase().includes(term)
        );
        setUsuariosFiltrados(filtrados);
    };

    const isAdminAuth = esAdmin;

    const getRolName = (u: Usuario) => {
        if (u.Rol && typeof u.Rol === 'object') return u.Rol.Nombre_Rol;
        if (typeof u.Rol === 'string') return u.Rol;
        if (u.Id_Rol === 1) return 'admin';
        if (u.Id_Rol === 2) return 'cliente';
        return 'desconocido';
    };

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.botonVolver} onPress={() => router.back()}>
                    <IconSymbol name="chevron.left" size={24} color={Tema.dark.text} />
                </TouchableOpacity>
                <View>
                    <Text style={styles.titulo}>Gestión de <Text style={styles.textoDorado}>Usuarios</Text></Text>
                    <Text style={styles.subtitulo}>{usuariosFiltrados.length} usuarios encontrados</Text>
                </View>
            </View>

            <View style={styles.content}>
                <View style={styles.searchRow}>
                    <IconSymbol name="magnifyingglass" size={20} color={Tema.dark.textSecondary} style={styles.searchIcon} />
                    <TextInput
                        placeholder="Buscar por nombre, apellido o correo..."
                        placeholderTextColor={Tema.dark.textSecondary}
                        value={busqueda}
                        onChangeText={handleBuscar}
                        style={styles.input}
                    />
                </View>

                {loading ? (
                    <View style={styles.centered}>
                        <ActivityIndicator size="large" color={Tema.dark.tint} />
                        <Text style={styles.loadingText}>Cargando usuarios...</Text>
                    </View>
                ) : null}

                {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

                <FlatList
                    data={usuariosFiltrados}
                    keyExtractor={(item) => String(item.Id_Usuario)}
                    renderItem={({ item }) => {
                        const rolName = getRolName(item);
                        return (
                            <View style={styles.card}>
                                <View style={styles.cardHeader}>
                                    <View style={styles.userInfo}>
                                        <Text style={styles.userName}>{item.Nombre} {item.Apellidos || ''}</Text>
                                        <View style={styles.emailRow}>
                                            <IconSymbol name="envelope.fill" size={12} color={Tema.dark.textSecondary} />
                                            <Text style={styles.userEmail}>{item.Correo}</Text>
                                        </View>
                                    </View>
                                    <View style={[styles.statusBadge, { backgroundColor: item.Activo ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)' }]}>
                                        <Text style={[styles.statusText, { color: item.Activo ? Tema.dark.exito : Tema.dark.error }]}>
                                            {item.Activo ? 'ACTIVO' : 'INACTIVO'}
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.cardFooter}>
                                    <View style={styles.rolBadge}>
                                        <IconSymbol name="person.fill" size={12} color={Tema.dark.dorado} />
                                        <Text style={styles.rolText}>{String(rolName).toUpperCase()}</Text>
                                    </View>

                                    {isAdminAuth && (
                                        <View style={styles.actionsRow}>
                                            <TouchableOpacity
                                                style={[styles.actionBtn, styles.rolBtn]}
                                                onPress={() => {
                                                    const nuevoRol = rolName === 'admin' || rolName === 'administrador' ? 'cliente' : 'admin';
                                                    Alert.alert('Cambiar rol', `¿Deseas cambiar el rol a ${nuevoRol.toUpperCase()}?`, [
                                                        { text: 'Cancelar', style: 'cancel' },
                                                        {
                                                            text: 'Cambiar',
                                                            onPress: async () => {
                                                                try {
                                                                    setLoading(true);
                                                                    await cambiarRolUsuario(item.Id_Usuario!, nuevoRol);
                                                                    await fetchUsuarios();
                                                                    Alert.alert('Éxito', 'Rol actualizado');
                                                                } catch {
                                                                    Alert.alert('Error', 'No se pudo cambiar el rol');
                                                                    setLoading(false);
                                                                }
                                                            },
                                                        },
                                                    ]);
                                                }}
                                            >
                                                <IconSymbol name="arrow.triangle.2.circlepath" size={14} color={Tema.dark.dorado} />
                                                <Text style={[styles.actionBtnText, { color: Tema.dark.dorado }]}>Rol</Text>
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                                style={[styles.actionBtn, item.Activo ? styles.deactivateBtn : styles.activateBtn]}
                                                onPress={async () => {
                                                    try {
                                                        setLoading(true);
                                                        await toggleUsuario(item.Id_Usuario!);
                                                        await fetchUsuarios();
                                                    } catch {
                                                        Alert.alert('Error', 'No se pudo cambiar el estado');
                                                        setLoading(false);
                                                    }
                                                }}
                                            >
                                                <IconSymbol name={item.Activo ? "lock.fill" : "lock.open.fill"} size={14} color={item.Activo ? Tema.dark.error : Tema.dark.exito} />
                                                <Text style={[styles.actionBtnText, { color: item.Activo ? Tema.dark.error : Tema.dark.exito }]}>
                                                    {item.Activo ? 'Bloquear' : 'Activar'}
                                                </Text>
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                                style={[styles.actionBtn, styles.deleteBtn]}
                                                onPress={() => {
                                                    Alert.alert('Eliminar usuario', '¿Estás seguro de eliminar este usuario permanentemente?', [
                                                        { text: 'Cancelar', style: 'cancel' },
                                                        {
                                                            text: 'Eliminar',
                                                            style: 'destructive',
                                                            onPress: async () => {
                                                                try {
                                                                    setLoading(true);
                                                                    await eliminarUsuario(item.Id_Usuario!);
                                                                    await fetchUsuarios();
                                                                } catch {
                                                                    Alert.alert('Error', 'No se pudo eliminar');
                                                                    setLoading(false);
                                                                }
                                                            },
                                                        },
                                                    ]);
                                                }}
                                            >
                                                <IconSymbol name="trash.fill" size={14} color="#fff" />
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                </View>
                            </View>
                        );
                    }}
                    ListEmptyComponent={!loading && !errorMessage ? <Text style={styles.emptyText}>No hay usuarios que coincidan con la búsqueda.</Text> : null}
                    contentContainerStyle={styles.listContainer}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: Tema.dark.background 
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
    content: {
        flex: 1,
        padding: Espaciado.lg,
    },
    centered: { 
        alignItems: 'center', 
        gap: 10, 
        marginVertical: Espaciado.xl 
    },
    loadingText: {
        color: Tema.dark.textSecondary,
    },
    error: { 
        color: Tema.dark.error,
        textAlign: 'center',
        marginBottom: Espaciado.md,
    },
    searchRow: { 
        flexDirection: 'row', 
        alignItems: 'center',
        backgroundColor: Tema.dark.surface,
        borderRadius: RadioBorde.md,
        borderWidth: 1,
        borderColor: Tema.dark.border,
        paddingHorizontal: Espaciado.md,
        marginBottom: Espaciado.lg,
    },
    searchIcon: {
        marginRight: Espaciado.sm,
    },
    input: { 
        flex: 1, 
        paddingVertical: Espaciado.md,
        color: Tema.dark.text,
        fontSize: 16,
    },
    listContainer: {
        gap: Espaciado.md,
        paddingBottom: Espaciado.xl * 2,
    },
    card: { 
        backgroundColor: Tema.dark.surface, 
        borderWidth: 1, 
        borderColor: Tema.dark.border, 
        borderRadius: RadioBorde.lg, 
        overflow: 'hidden',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        padding: Espaciado.md,
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        color: Tema.dark.text,
        fontSize: 17,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    emailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    userEmail: {
        color: Tema.dark.textSecondary,
        fontSize: 14,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: RadioBorde.sm,
    },
    statusText: {
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: Tema.dark.surface2,
        paddingHorizontal: Espaciado.md,
        paddingVertical: Espaciado.sm,
        borderTopWidth: 1,
        borderTopColor: Tema.dark.border,
    },
    rolBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    rolText: {
        color: Tema.dark.dorado,
        fontSize: 12,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    actionsRow: { 
        flexDirection: 'row', 
        gap: Espaciado.sm,
    },
    actionBtn: { 
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingVertical: 6, 
        paddingHorizontal: 10, 
        borderRadius: RadioBorde.sm, 
        borderWidth: 1,
    },
    rolBtn: {
        backgroundColor: 'rgba(201, 160, 96, 0.1)',
        borderColor: Tema.dark.dorado,
    },
    activateBtn: {
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        borderColor: Tema.dark.exito,
    },
    deactivateBtn: {
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderColor: Tema.dark.error,
    },
    deleteBtn: {
        backgroundColor: Tema.dark.error,
        borderColor: Tema.dark.error,
        paddingHorizontal: 8,
    },
    actionBtnText: { 
        fontWeight: 'bold', 
        fontSize: 12,
    },
    emptyText: {
        color: Tema.dark.textSecondary,
        textAlign: 'center',
        marginTop: Espaciado.xl,
        fontSize: 16,
    }
});