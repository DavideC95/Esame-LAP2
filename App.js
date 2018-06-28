import React from 'react';
import { MapView } from 'expo';
import { StyleSheet, Text, View, Button, FlatList, Image, TouchableOpacity, AsyncStorage, TextInput} from 'react-native';
import { StackNavigator, TabNavigator } from 'react-navigation';

class HomeScreen extends React.Component {
  //Title
  static navigationOptions = ({ navigation }) => {

    //Nel caso in cui il parametro è vuoto lo riempio con un oggetto vuoto.
    const params = navigation.state.params || {};
    const title = params.title ? params.title : "Home";

    return{
    //Assegno un oggetto per configurare la barra di navigazione
      title: title,
      headerRight: <Button title="+" onPress = {() => navigation.navigate("Add", {onAdd: navigation.state.params.add})}/>,   
    }
  };

  state = {
    isLoading: true, //Setto un flag per il caricamento dei dati con la fetch.
    storage: false
  };

  //Recupero i dati dal path
  componentDidMount(){
    
    this.props.navigation.setParams({add: this._add});

    AsyncStorage.getItem("dataSource").then(response => 
      this.setState({dataSource: JSON.parse(response) || []}));
    
    if(this.state.dataSource == undefined){
      return fetch('http://www.dmi.unict.it/~calanducci/LAP2/favorities.json')
        .then((response) => response.json())
        .then((responseJson) => {
          this.setState({
            isLoading: false,
            dataSource: responseJson.data,
          }, function(){

          });

        })
        .catch((error) =>{
          console.error(error);
        });
    }
  }

  //Funzione per recuperare i parametri dalla addTodo
  _add = data => {
    this.setState({dataSource: [...this.state.dataSource, data] }, AsyncStorage.setItem("dataSource", JSON.stringify(this.state.dataSource)));
  }

  render() {
    return (
      <View style={{flex: 1}}>
          <FlatList
            data={this.state.dataSource}
            renderItem={({item}) => 
            <View style={styles.container}>
                <TouchableOpacity onPress={() => this.props.navigation.navigate("Detail", 
                  { 
                  id: item.id,
                  address: item.address,
                  img: item.img,
                  info: item.info,
                  name: item.name,
                  tags: item.tags,
                  tel: item.tel,
                  url: item.url
                  })}
                >
                  <Image source={{uri: item.img}} style={{width: 400, height: 200}} />
                </TouchableOpacity>
                <Text style={styles.title}>{item.name}</Text>
                <Text style={styles.subtitle}>{item.address}</Text>
                <Text>{item.tags}</Text>
            </View>
            } //Chiude renderItem
            keyExtractor={(item, index) => index}
          />
      </View>
    );
  }
}

//Detail
class DetailScreen extends React.Component {
  static navigationOptions = {
    title: "Detail"
  }

  state = {
    mapRegion: {
      latitude: 37.49223,
      longitude: 15.07041,
    },
  };

  render() {
    //Ricontrollare i parametri che passo.
    const {params} = this.props.navigation.state;

    return (
      <View style={styles.containerDetail}>
        <Text style={{fontSize:24, marginLeft: 125}}> {params.name} </Text>
        <Image source={{uri: params.img}} style={{width: 400, height: 200}} />       
        <Text style={{fontSize:16, marginTop:10}}> Info: {params.info} </Text>
        <Text style={{fontSize:18, marginTop:10}}> Tel: {params.tel} </Text>
        <Text style={{fontSize:18, marginTop:10, color:"blue"}}> Sito: {params.url} </Text>
        <Text style={{fontSize:18, marginTop:10}}> Indirizzo: {params.address} </Text>
        <View style={{marginTop:10}}>
          <MapView
            style={{ alignSelf: 'stretch', height: 200 }}
            region={this.state.mapRegion}
          >
          <MapView.Marker
            coordinate={this.state.mapRegion}
            title={'Sei qui'}
          />
          </MapView>
        </View>
      </View>
    );
  }
}


//Add di un nuovo luogo preferito.
class AddScreen extends React.Component {
  static navigationOptions = {
    title: "Add"
  }

  _save = () => {
    console.log(this.state.name);
    const newItem = {
      name: this.state.name,
      address: this.state.address, 
      tags: this.state.tags,
      img: "https://upload.wikimedia.org/wikipedia/commons/5/57/FontanaVillaBellini.jpg",
    }
    
    this.props.navigation.state.params ? this.props.navigation.state.params.onAdd(newItem) : null ;
    this.props.navigation.goBack();
  }

  render(){
    return(
        <View>
          <TextInput
            style={styles.input}
            placeholder="Nome località"
            onChangeText = {(value) => this.setState({name: value})}
          />
          <TextInput
            style={styles.input}
            placeholder="Indirizzo"
            onChangeText = {(value) => this.setState({address: value})}
          />
          <TextInput
            style={styles.input}
            placeholder="Tag"
            onChangeText = {(value) => this.setState({tags: value})}
            onSubmitEditing = {this._save}
          />
          <Button title="Save" onPress = {() => this._save}/>
        </View>
       
      );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  containerDetail: {
    flex: 1,
    flexDirection: 'column',
  },
  title: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    fontSize: 18,
  },
  subtitle: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    color: 'gray',
    fontSize: 14,
  },
  input: {
    marginTop:5,
    fontSize:24,
    backgroundColor: 'white'
  }
});

const RootStack = StackNavigator({
    //Specifichiamo un elenco di root
    Home:{
      screen: HomeScreen
    },
    //Screen per la visualizzazione del dettaglio
    Detail:{
      screen: DetailScreen
    },
    Add:{
      screen: AddScreen
    }
}, {
  //Il secondo parametro di questa funzione può essere la schermata di default.
  //mode: "modal", modifica l'animazione all'apertura di una nuova pagina.
  initialRouteName: "Home",
  navigationOptions: {
    headerTitleStyle: {
      fontWeight: "bold",
      color: "black"
    }
  }
});

export default class App extends React.Component{
  render(){
    return (
      <RootStack/>
      //<MainNav/>
      );
  }
}
