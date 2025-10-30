import React, { useState, useEffect } from 'react';
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Platform,
  TouchableOpacity,
  Alert,
  Button,
} from 'react-native';
import * as Database from './services/Database';
import Formulario from './components/Formulario';
import ListaRegistros from './components/ListaRegistros';
import Grafico from './components/Grafico'; // ✅ Novo componente de gráfico
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';

export default function App() {
  // ---------------- Estados ----------------
  const [registros, setRegistros] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [registroEmEdicao, setRegistroEmEdicao] = useState(null);
  const [ordenacao, setOrdenacao] = useState('recentes'); // ✅ Novo estado de ordenação

  // ---------------- Efeitos ----------------
  useEffect(() => {
    const init = async () => {
      try {
        const dados = await Database.carregarDados();
        setRegistros(dados || []);
      } catch (err) {
        console.warn('Erro ao carregar dados:', err);
        setRegistros([]);
      } finally {
        setCarregando(false);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (!carregando) {
      Database.salvarDados(registros);
    }
  }, [registros, carregando]);

  // ---------------- Handlers ----------------
  const handleSave = (coposWhey, ovos, arroz) => {
    const wheyNum = parseFloat(String(coposWhey).replace(',', '.'));
    const ovosNum = parseFloat(String(ovos).replace(',', '.'));
    const arrozNum = parseFloat(String(arroz).replace(',', '.'));

    if (
      coposWhey === '' ||
      ovos === '' ||
      arroz === '' ||
      Number.isNaN(wheyNum) ||
      Number.isNaN(ovosNum) ||
      Number.isNaN(arrozNum)
    ) {
      return Alert.alert('Erro de Validação', 'Preencha todos os campos com números válidos.');
    }
    if (wheyNum < 0 || ovosNum < 0 || arrozNum < 0) {
      return Alert.alert('Erro de Validação', 'Nenhum valor pode ser negativo. Por favor, corrija.');
    }

    if (registroEmEdicao) {
      // ✅ Atualiza registro existente
      const registrosAtualizados = registros.map((reg) =>
        reg.id === registroEmEdicao.id
          ? { ...reg, whey: wheyNum, ovos: ovosNum, arroz: arrozNum }
          : reg
      );
      setRegistros(registrosAtualizados);
      Alert.alert('Sucesso!', 'Registro atualizado!');
    } else {
      // ✅ Novo registro
      const novoRegistro = {
        id: new Date().getTime(),
        data: new Date().toLocaleDateString('pt-BR'),
        whey: wheyNum,
        ovos: ovosNum,
        arroz: arrozNum,
      };
      setRegistros([...registros, novoRegistro]);
      Alert.alert('Sucesso!', 'Registro salvo!');
    }

    setRegistroEmEdicao(null);
  };

  const handleDelete = (id) => {
    const filtrados = registros.filter((reg) => reg.id !== id);
    setRegistros(filtrados);
    Alert.alert('Sucesso!', 'O registro foi deletado.');
  };

  const handleIniciarEdicao = (registro) => {
    setRegistroEmEdicao(registro);
  };

  const handleCancelarEdicao = () => {
    setRegistroEmEdicao(null);
  };

  const exportarDados = async () => {
    const fileUri = Database.fileUri;

    try {
      if (Platform.OS === 'web') {
        if (registros.length === 0) {
          return Alert.alert('Aviso', 'Nenhum dado para exportar.');
        }
        const jsonString = JSON.stringify(registros, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'dados.json';
        a.click();
        URL.revokeObjectURL(url);
      } else {
        if (!fileUri) {
          return Alert.alert('Erro', 'Arquivo de dados não configurado no serviço Database.');
        }
        const fileInfo = await FileSystem.getInfoAsync(fileUri);
        if (!fileInfo.exists) {
          return Alert.alert('Aviso', 'Nenhum dado para exportar.');
        }
        if (!(await Sharing.isAvailableAsync())) {
          return Alert.alert('Erro', 'Compartilhamento não disponível.');
        }
        await Sharing.shareAsync(fileUri);
      }
    } catch (err) {
      console.warn('Erro exportando dados:', err);
      Alert.alert('Erro', 'Falha ao exportar os dados.');
    }
  };

  // ---------------- Ordenação ----------------
  let registrosExibidos = [...registros];
  if (ordenacao === 'maior_whey') {
    registrosExibidos.sort((a, b) => b.whey - a.whey);
  } else if (ordenacao === 'maior_arroz') {
    registrosExibidos.sort((a, b) => b.arroz - a.arroz);
  } else {
    registrosExibidos.sort((a, b) => b.id - a.id); // recentes
  }

  // ---------------- Renderização ----------------
  if (carregando) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Text style={styles.titulo}>Meu Diário Bulking 🍗💪</Text>
        <Text style={styles.subtituloApp}>App Interativo e Profissional</Text>

        {/* ✅ Gráfico */}
        <Grafico registros={registrosExibidos} />

        {/* ✅ Botões de ordenação */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 10, gap: 10 }}>
          <Button title="Mais Recentes" onPress={() => setOrdenacao('recentes')} />
          <Button title="Maior Whey" onPress={() => setOrdenacao('maior_whey')} />
          <Button title="Maior Arroz" onPress={() => setOrdenacao('maior_arroz')} />
        </View>

        <Formulario
          onSave={handleSave}
          onCancel={handleCancelarEdicao}
          registroEmEdicao={registroEmEdicao}
        />

        <ListaRegistros
          registros={registrosExibidos}
          onEdit={handleIniciarEdicao}
          onDelete={handleDelete}
        />

        <View style={styles.card}>
          <Text style={styles.subtitulo}>Exportar "Banco de Dados"</Text>
          <TouchableOpacity style={styles.botaoExportar} onPress={exportarDados}>
            <Text style={styles.botaoTexto}>Exportar arquivo dados.json</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ---------------- Estilos ----------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 25 : 0,
    backgroundColor: '#f0f4f7',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    color: '#1e3a5f',
  },
  subtituloApp: {
    textAlign: 'center',
    fontSize: 16,
    color: '#555',
    marginTop: -20,
    marginBottom: 20,
    fontStyle: 'italic',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    marginHorizontal: 15,
    marginBottom: 20,
    elevation: 3,
  },
  subtitulo: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#34495e',
  },
  botaoExportar: {
    backgroundColor: '#27ae60',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 5,
  },
  botaoTexto: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
