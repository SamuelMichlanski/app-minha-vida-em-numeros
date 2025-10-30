import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

export default function Formulario({ onSave, onCancel, registroEmEdicao }) {
  const [coposWhey, setCoposWhey] = useState('');
  const [ovos, setOvos] = useState('');
  const [arroz, setArroz] = useState('');

  useEffect(() => {
    if (registroEmEdicao) {
      setCoposWhey(String(registroEmEdicao.whey));
      setOvos(String(registroEmEdicao.ovos));
      setArroz(String(registroEmEdicao.arroz));
    } else {
      setCoposWhey('');
      setOvos('');
      setArroz('');
    }
  }, [registroEmEdicao]);

  const handleSaveClick = () => {
    onSave(coposWhey, ovos, arroz);
  };

  return (
    <View style={styles.card}>
      <Text style={styles.subtitulo}>
        {registroEmEdicao ? 'Editando Registro (Update)' : 'Novo Registro (Create)'}
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Copos de whey"
        keyboardType="numeric"
        value={coposWhey}
        onChangeText={setCoposWhey}
      />
      <TextInput
        style={styles.input}
        placeholder="Ovos consumidos"
        keyboardType="numeric"
        value={ovos}
        onChangeText={setOvos}
      />
      <TextInput
        style={styles.input}
        placeholder="Gramas de arroz"
        keyboardType="numeric"
        value={arroz}
        onChangeText={setArroz}
      />

      <TouchableOpacity style={styles.botao} onPress={handleSaveClick}>
        <Text style={styles.botaoTexto}>
          {registroEmEdicao ? 'Atualizar Registro' : 'Gravar no Arquivo'}
        </Text>
      </TouchableOpacity>

      {registroEmEdicao && (
        <TouchableOpacity style={styles.botaoCancelar} onPress={onCancel}>
          <Text style={styles.botaoTexto}>Cancelar Edição</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: 'white', borderRadius: 8, padding: 15, marginHorizontal: 15, marginBottom: 20, elevation: 3 },
  subtitulo: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, color: '#34495e' },
  input: { borderWidth: 1, borderColor: '#cccccc', borderRadius: 5, padding: 12, fontSize: 16, marginBottom: 10 },
  botao: { backgroundColor: '#3498db', padding: 15, borderRadius: 5, alignItems: 'center', marginTop: 5 },
  botaoTexto: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  botaoCancelar: { backgroundColor: '#7f8c8d', padding: 10, borderRadius: 5, alignItems: 'center', marginTop: 10 },
});
