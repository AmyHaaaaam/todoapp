import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, ScrollView, Alert, Platform } from 'react-native';
import React, { useEffect, useState } from 'react';
import { theme } from './color';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AntDesign, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const STORAGE_KEY = "@toDos";
const ISITWORK = "@isItWork";

export default function App() {
  const [working, setworking] = useState(showCurrentWorking);
  const [text, setText] = useState("");
  const [toDos, setToDos] = useState({});
  const [complete, setComplete] = useState(false);
  const [edit, setEdit] = useState(false);

  useEffect(() => {
    loadToDos();
    showCurrentWorking();
  }, []);

  const travel = () => setworking(false);
  const work = () => setworking(true);
  const saveCurrentWorking = async(isThisWork) => {
    try {
      await AsyncStorage.setItem(ISITWORK, JSON.stringify(isThisWork));
    } catch (error) {
      console.log(error);
    } 
  };
  const showCurrentWorking = async() => {
    try {
      const y = await AsyncStorage.getItem(ISITWORK);
      if(y) {
        setworking(JSON.parse(y));
        return y;
      } else {
        return false;
      }
    } catch (error) {
      console.log(error);
    }
  };
  const onChangeText = (payload) => setText(payload);
  const onChangeEditedText = (payload) => setText(payload);
  const saveToDos = async (toSave) => { //save list
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch (error) {
      console.log(error);
    }
  };
  const loadToDos = async () => { //load saved lists
    try {
      const s = await AsyncStorage.getItem(STORAGE_KEY);
      if(s) {
        setToDos(JSON.parse(s));
      }
    } catch (error) {
      console.log(error);
    }
  };
  const addToDo = async () => { //add list
    if(text === ""){
      return;
    }
    // const newToDos = Object.assign({}, toDos, {[Date.now()]: { text, work: working }}); //combining state without mutating state
    const newToDos = {...toDos, [Date.now()]: { text, working, complete, edit }}
    setToDos(newToDos); //put them in the state
    await saveToDos(newToDos); //
    setText("");
  };
  const saveEditedToDo = async (key) => {    
    const newToDos = {...toDos}
    toDos[key].edit = false;
    newToDos[key].text = text;
    setToDos(newToDos); //put them in the state
    await saveToDos(newToDos); //
    setText("");
  };
  const deleteToDo = async (key) => { //delete ToDo
    if(Platform.OS === "web") {
      const ok = confirm("Do you want to delete this to do?")
      if(ok) {
        const newToDos = {...toDos};
        delete newToDos[key];
        setToDos(newToDos);
        saveToDos(newToDos);
      }
    } else {
      Alert.alert(
        "Delete To Do?", 
        "Are you sure?", [
          {text:"Cancel"},
          {text:"I'm sure",
          style: "destructive", 
          onPress: () => {
            const newToDos = {...toDos};
            delete newToDos[key];
            setToDos(newToDos);
            saveToDos(newToDos);
          }},
        ]
      );  
    } 
  };
  const completeToDo = async (key) => { //complete ToDo
    const newToDos = {...toDos};
    newToDos[key].complete = true;
    setToDos(newToDos);
    saveToDos(newToDos);
  };
  const editToDo = async (key) => { //complete ToDo
    const newToDos = {...toDos};
    newToDos[key].edit = true;
    setToDos(newToDos);
    saveToDos(newToDos);
  };
  function TextList(key) {
    return (
      <Text style={key.complete ? styles.doneText : styles.toDoText}>{key.text}</Text>
    )
  }
  function TextSmallInput(key) {
    return (
      <TextInput
        onSubmitEditing={() => {saveEditedToDo(key.key);}} 
        onChangeText={onChangeEditedText}
        returnKeyType="done"
        placeholder={key.text} 
        //value={key.text}
        style={styles.input}>
      </TextInput>
    )
  }
  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => {work(); saveCurrentWorking(true);}}
          activeOpacity={0.2}>
          <Text style={{fontSize: 38, fontWeight: "600", color: working ? '#fff' : theme.grey}}>Work</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => {travel(); saveCurrentWorking(false);}}>
          <Text style={{fontSize: 38, fontWeight: "600", color: !working ? '#fff' : theme.grey}}>Travel</Text>
        </TouchableOpacity>        
      </View>
      <View>
        <TextInput
        onSubmitEditing={addToDo} 
        onChangeText={onChangeText}
        returnKeyType="done"
        placeholder={working ? 'Add a To Do' : 'Where do you want to go?'} 
        value={text}
        style={styles.input}></TextInput>
        <ScrollView>
          {Object.keys(toDos).map((key) => 
            toDos[key].working === working ? (
              <View style={toDos[key].complete ? styles.done : styles.toDo} key={key}>
                {toDos[key].edit ? (
                <TextInput
                  onSubmitEditing={() => {saveEditedToDo(key);}} 
                  onChangeText={onChangeEditedText}
                  returnKeyType="done"
                  placeholder={toDos[key].text} 
                  placeholderTextColor="#333"
                  //value={key.text}
                  style={styles.smallInput}>
                </TextInput>
                ) : (<TextList complete={toDos[key].complete} text={toDos[key].text} />)}
                <View style={styles.btnBox}>
                  <TouchableOpacity onPress={() => deleteToDo(key)}><AntDesign name="minuscircle" size={24} color={toDos[key].complete ? "#555" : "white"} /></TouchableOpacity> 
                  <TouchableOpacity onPress={() => completeToDo(key)}><Ionicons name="checkmark-done-circle" size={30} color={toDos[key].complete ? "#555" : "white"} /></TouchableOpacity>
                  <TouchableOpacity onPress={() => editToDo(key)}><MaterialCommunityIcons name="clock-edit" size={30} color={toDos[key].complete ? "#555" : "white"} /></TouchableOpacity>
                </View>
              </View>
             ) : null
            )}
        </ScrollView>       
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 100,
  },
  input: {
    marginTop: 10,
    padding: 10,
    borderRadius: 10,
    backgroundColor: "white",
    fontSize: 12,
  },
  toDo: {
    backgroundColor: theme.toDoBg,
    marginTop: 20,
    marginBottom: 10,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 15,
    opacity: 0.7,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  done: {
    backgroundColor: "#111",
    marginTop: 20,
    marginBottom: 10,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 15,
    opacity: 0.7,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  doneText: {
    flex: 14,
    fontSize: 16,
    color: "#555",
    fontWeight: "500",
  },
  toDoText: {
    flex: 14,
    fontSize: 16,
    color: "white",
    fontWeight: "500",
  },
  smallInput: {
    flex: 14,
    fontSize: 16,
    color: "white",
    fontWeight: "500",
  },
  btnBox: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    minWidth: 70,
  }
});
