import React, { useEffect, useMemo, useState } from 'react';
import {
  SafeAreaView, View, Text, TextInput, Pressable, ScrollView,
  StyleSheet, Alert, KeyboardAvoidingView, Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';

type Entry = {
  id: string; date: string; income: number; fuel: number; other: number; profit: number;
};

const KEY = '@mis_ganancias_historial';
const money = (n: number) => `RD$ ${n.toLocaleString('es-DO', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
const numberFrom = (s: string) => {
  const n = Number(s.replace(',', '.'));
  return Number.isFinite(n) && n >= 0 ? n : 0;
};

export default function App() {
  const [income, setIncome] = useState('');
  const [fuel, setFuel] = useState('');
  const [other, setOther] = useState('');
  const [history, setHistory] = useState<Entry[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(KEY).then(raw => {
      if (raw) setHistory(JSON.parse(raw));
    }).catch(() => Alert.alert('Aviso', 'No se pudo cargar el historial.'))
      .finally(() => setLoaded(true));
  }, []);

  const totals = useMemo(() => {
    const i = numberFrom(income), f = numberFrom(fuel), o = numberFrom(other);
    return { income: i, fuel: f, other: o, profit: i - f - o };
  }, [income, fuel, other]);

  async function save() {
    if (!income.trim()) {
      Alert.alert('Falta un dato', 'Escribe cuánto ganaste antes de guardar.');
      return;
    }
    const entry: Entry = {
      id: `${Date.now()}`, date: new Date().toLocaleString('es-DO'),
      income: totals.income, fuel: totals.fuel, other: totals.other, profit: totals.profit
    };
    const updated = [entry, ...history];
    setHistory(updated);
    try {
      await AsyncStorage.setItem(KEY, JSON.stringify(updated));
      setIncome(''); setFuel(''); setOther('');
      Alert.alert('Guardado', 'Tu día se agregó al historial.');
    } catch {
      Alert.alert('Error', 'No se pudo guardar el registro.');
    }
  }

  async function removeAll() {
    Alert.alert('Borrar historial', '¿Seguro que quieres borrar todos los registros?', [
      {text: 'Cancelar', style: 'cancel'},
      {text: 'Borrar', style: 'destructive', onPress: async () => {
        setHistory([]);
        await AsyncStorage.removeItem(KEY);
      }}
    ]);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView style={{flex: 1}} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <View style={styles.logo}><Text style={styles.logoText}>$</Text></View>
            <View><Text style={styles.title}>Mis Ganancias</Text><Text style={styles.subtitle}>Calculadora para inDrive</Text></View>
          </View>

          <View style={styles.card}>
            <Text style={styles.section}>Calcula tu ganancia</Text>
            <Field label="Ingresos del día (RD$)" value={income} onChange={setIncome} placeholder="Ej. 2500" />
            <Field label="Gasolina (RD$)" value={fuel} onChange={setFuel} placeholder="Ej. 400" />
            <Field label="Otros gastos (RD$)" value={other} onChange={setOther} placeholder="Ej. 200" />
            <View style={styles.result}>
              <Text style={styles.resultLabel}>GANANCIA NETA</Text>
              <Text style={[styles.resultValue, totals.profit < 0 && {color: '#c0392b'}]}>{money(totals.profit)}</Text>
              <Text style={styles.math}>{money(totals.income)} − {money(totals.fuel)} − {money(totals.other)}</Text>
            </View>
            <Pressable style={styles.button} onPress={save}><Text style={styles.buttonText}>Guardar en historial</Text></Pressable>
          </View>

          <View style={styles.historyHeader}>
            <Text style={styles.section}>Historial</Text>
            {history.length > 0 && <Pressable onPress={removeAll}><Text style={styles.clear}>Borrar todo</Text></Pressable>}
          </View>
          {history.length === 0 ? (
            <View style={styles.empty}><Text style={styles.emptyIcon}>▤</Text><Text style={styles.emptyText}>{loaded ? 'Todavía no tienes registros.' : 'Cargando historial...'}</Text></View>
          ) : history.map(item => (
            <View key={item.id} style={styles.entry}>
              <View style={{flex: 1}}>
                <Text style={styles.entryDate}>{item.date}</Text>
                <Text style={styles.entryDetails}>Ingresos {money(item.income)} · Gasolina {money(item.fuel)} · Otros {money(item.other)}</Text>
              </View>
              <Text style={[styles.entryProfit, item.profit < 0 && {color: '#c0392b'}]}>{money(item.profit)}</Text>
            </View>
          ))}
          <Text style={styles.footer}>Tus registros se guardan en este dispositivo.</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({label, value, onChange, placeholder}: {label:string; value:string; onChange:(v:string)=>void; placeholder:string}) {
  return <View style={styles.field}>
    <Text style={styles.label}>{label}</Text>
    <TextInput value={value} onChangeText={onChange} keyboardType="decimal-pad" placeholder={placeholder}
      placeholderTextColor="#9aa3ad" style={styles.input} />
  </View>;
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: '#f4f6f8'},
  container: {padding: 20, paddingBottom: 40},
  header: {flexDirection: 'row', alignItems: 'center', gap: 13, marginBottom: 22, marginTop: 8},
  logo: {width: 54, height: 54, borderRadius: 16, backgroundColor: '#176b4d', alignItems: 'center', justifyContent: 'center'},
  logoText: {color: 'white', fontSize: 36, fontWeight: '800'},
  title: {fontSize: 24, fontWeight: '800', color: '#17212b'},
  subtitle: {fontSize: 13, color: '#687582', marginTop: 2},
  card: {backgroundColor: 'white', borderRadius: 20, padding: 18, shadowColor: '#000', shadowOpacity: .05, shadowRadius: 12, elevation: 2},
  section: {fontSize: 18, fontWeight: '800', color: '#17212b', marginBottom: 14},
  field: {marginBottom: 13},
  label: {fontSize: 13, color: '#485563', fontWeight: '600', marginBottom: 7},
  input: {height: 49, borderWidth: 1, borderColor: '#dce2e7', borderRadius: 12, paddingHorizontal: 14, fontSize: 17, color: '#17212b', backgroundColor: '#fbfcfd'},
  result: {backgroundColor: '#eaf4ef', borderRadius: 15, padding: 16, marginTop: 4, marginBottom: 15},
  resultLabel: {fontSize: 11, letterSpacing: 1, fontWeight: '800', color: '#36765c'},
  resultValue: {fontSize: 29, fontWeight: '900', color: '#176b4d', marginTop: 5},
  math: {fontSize: 11, color: '#668174', marginTop: 4},
  button: {height: 50, borderRadius: 13, backgroundColor: '#176b4d', alignItems: 'center', justifyContent: 'center'},
  buttonText: {color: 'white', fontWeight: '800', fontSize: 15},
  historyHeader: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 25},
  clear: {color: '#c0392b', fontSize: 13, fontWeight: '700'},
  empty: {backgroundColor: 'white', padding: 25, borderRadius: 16, alignItems: 'center'},
  emptyIcon: {fontSize: 30, color: '#9aa3ad', marginBottom: 7},
  emptyText: {color: '#7b8792', fontSize: 13},
  entry: {backgroundColor: 'white', borderRadius: 14, padding: 14, marginBottom: 9, flexDirection: 'row', alignItems: 'center', gap: 10},
  entryDate: {fontSize: 13, fontWeight: '800', color: '#263442', marginBottom: 5},
  entryDetails: {fontSize: 10, color: '#7b8792'},
  entryProfit: {fontSize: 14, fontWeight: '900', color: '#176b4d'},
  footer: {textAlign: 'center', color: '#98a2ac', fontSize: 11, marginTop: 18}
});
