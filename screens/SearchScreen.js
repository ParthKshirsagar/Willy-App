import React from 'react';
import { Text, View, StyleSheet, FlatList, TextInput, TouchableOpacity } from 'react-native';
import db from '../config';

export default class Searchscreen extends React.Component {
    constructor(props){
      super(props);
      this.state = {
        allTransaction: [],
        lastVisibleTransaction: null,
        search: ''
      }
    }

    searchTransaction = async (text)=>{
      var enteredText = text.split('');
      if(enteredText[0].toUpperCase() === 'B'){
        const transaction = await db.collection('Transaction')
        .where('BookID', '==', text).get();
        transaction.docs.map((doc)=>{
          this.setState({
            allTransaction: [...this.state.allTransaction, doc.data()],
            lastVisibleTransaction: doc
          })
        })
      } else if(enteredText[0].toUpperCase() === 'S'){
        const transaction = await db.collection('Transaction')
        .where('StudentID', '==', text).get();
        transaction.docs.map((doc)=>{
          this.setState({
            allTransaction: [...this.state.allTransaction, doc.data()],
            lastVisibleTransaction: doc
          })
        })
      }
    }
  
    fetchMoreTransaction = async ()=>{
      var text = this.state.search.toUpperCase();
      var enteredText = text.split('');
      if(enteredText[0].toUpperCase() == 'B'){
        const query = await db.collection('Transaction')
        .where('BookID', '==', text)
        .startAfter(this.state.lastVisibleTransaction)
        .limit(10).get();
        query.docs.map((doc)=>{
          this.setState({
            lastVisibleTransaction: doc,
            allTransaction: [...this.state.allTransaction, doc.data()]
          })
        })
      } else if(enteredText[0].toUpperCase() == 'S'){
        const query = await db.collection('Transaction')
        .where('StudentID', '==', text)
        .startAfter(this.state.lastVisibleTransaction)
        .limit(10).get();
        query.docs.map((doc)=>{
          this.setState({
            lastVisibleTransaction: doc,
            allTransaction: [...this.state.allTransaction, doc.data()]
          })
        })
      }
    }
  
    componentDidMount = async()=>{
      const query = await db.collection('Transaction')
      .limit(10).get();
      query.docs.map((doc)=>{
      this.setState({
        allTransaction: [...this.state.allTransaction, doc.data()],
        lastVisibleTransaction: doc
      })
      })
    }
  
      render() {
        return (
          <View style={styles.container}>
            <View style={styles.searchBar}>
              <TextInput style={styles.bar} placeholder="Book ID/Student ID" onChangeText={(text)=>{
                this.setState({
                  search: text
                });
              }} placeholderTextColor="black"/>
              <TouchableOpacity style={styles.searchButton} onPress={()=>{
                this.searchTransaction(this.state.search);
              }}>
                <Text>Search</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={this.state.allTransaction}
              renderItem={({item})=>(
                <View style={{borderBottomWidth: 2}}>
                  <Text>{'Book ID: ' + item.BookID}</Text>
                  <Text>{'Student ID: ' + item.StudentID}</Text>
                  <Text>{'Date: ' + item.Date}</Text>
                </View>
              )}
              keyExtractor={(item, index)=>{index.toString()}}
              onEndReached={this.fetchMoreTransaction}
              onEndReachedThreshold={0.7}
            />
          </View>
        );
      }
  }
  
  const styles = StyleSheet.create({ container: { flex: 1, marginTop: 45 }, searchBar:{ flexDirection:'row', height:40, width:'auto', borderWidth:0.5, alignItems:'center', backgroundColor:'grey', }, bar:{ borderWidth:2, height:30, width:300, paddingLeft:10, }, searchButton:{ borderWidth:1, height:30, width:50, alignItems:'center', justifyContent:'center', backgroundColor:'green' } })