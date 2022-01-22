import React from 'react';
import { Text, View, StyleSheet, TextInput, Image, KeyboardAvoidingView, ToastAndroid, Alert, TouchableOpacity } from 'react-native';
import * as Permissions from 'expo-permissions';
import { BarCodeScanner } from 'expo-barcode-scanner';
import db from '../config';
import firebase from 'firebase';

export default class TransactionScreen extends React.Component {
    constructor(){
      super();
      this.state = {
        hasCameraPermissions: null,
        scanned: false,
        buttonState: 'normal',
        scannedBookId: '',
        scannedStudentId: '',
        transactionMessage: ''
      }
    }

    checkStudentEligibilityForBookIssue = async () => {
      var studentRef = await db.collectiion('Students')
      .where('StudentID', '==', this.state.scannedStudentId).get();
      var isStudentEligible = '';
      if(studentRef.docs.length === 0){
        isStudentEligible = false;
        Alert.alert("This student doesn't exist in the database");
        this.setState({
          scannedStudentId: '',
          scannedBookId: ''
        })
      } else {
        studentRef.docs.map((doc)=>{
          var student = doc.data();
          if(student.NumberOfBooksIssued < 2){
            isStudentEligible = true
          } else{
            isStudentEligible = false;
            alert('The Student have already issued two book');
            this.setState({
              scannedStudentId: '',
              scannedBookId: ''
            })
          }
        })
      }
      return isStudentEligible;
    }

    checkStudentEligibilityForBookReturn = async () => {
      var transactionRef = await db.collection('Transaction')
      .where('BookID', '==', this.state.scannedBookId).get();
      var isStudentEligible = '';
      transactionRef.docs.map((doc)=>{
        var lastBookTransaction = doc.data();
        if(lastBookTransaction.StudentID === this.state.scannedStudentId){
          isStudentEligible = true;
        } else{
          isStudentEligible = false;
          alert('The book is not issued by this student');
          this.setState({
            scannedBookId: '',
            scannedStudentId: ''
          });
        }
      })
      return isStudentEligible;
    }

    checkBookEligibility = async () => {
      var bookRef = await db.collection('Books')
      .where('BookID', '==', this.state.scannedBookId).get();
      var transactionType = '';
      if(bookRef.docs.length === 0){
        transactionType = false;
      } else{
        bookRef.docs.map((doc)=>{
          var book = doc.data();
          if(book.BookAvailability){
            transactionType = 'Issue'
          } else{
            transactionType = 'Return';
          }
        })
      }
      return transactionType;
    }

    getCameraPermissions = async (id) =>{
      const {status} = await Permissions.askAsync(Permissions.CAMERA);
      
      this.setState({
        /*status === "granted" is true when user has granted permission
          status === "granted" is false when user has not granted the permission
        */
        hasCameraPermissions: status === "granted",
        buttonState: id,
        scanned: false
      });
    }

    handleBarCodeScanned = async({type, data})=>{
      const {buttonState} = this.state;
      if(buttonState === "bookID"){
        this.setState({
          scanned: true,
          scannedBookId: data,
          buttonState: 'normal'
        });
      } else if(buttonState === 'studentID'){
        this.setState({
          scanned: true,
          scannedStudentId: data,
          buttonState: 'normal'
        });
      }
    }

    initiateBookIssue = async () => {
      db.collection('Transaction').add({
        'StudentID': this.state.scannedStudentId,
        'BookID': this.state.scannedBookId,
        'Date': firebase.firestore.Timestamp.now().toDate(),
        'TransactionType': 'Issue'
      });
      db.collection('Books').doc(this.state.scannedBookId).update({
        'BookAvailability': false
      });
      db.collection('Students').doc(this.state.scannedStudentId).update({
        'NumberOfBooksIssued': firebase.firestore.FieldValue.increment(1)
      })
      this.setState({
        scannedBookId: '',
        scannedStudentId: '',
        transactionMessage: ''
      })
    }

    initiateBookReturn = async () => {
      db.collection('Transaction').add({
        'StudentID': this.state.scannedStudentId,
        'BookID': this.state.scannedBookId,
        'Date': firebase.firestore.Timestamp.now().toDate(),
        'TransactionType': 'Return'
      });
      db.collection('Books').doc(this.state.scannedBookId).update({
        'BookAvailability': true
      });
      db.collection('Students').doc(this.state.scannedStudentId).update({
        'NumberOfBooksIssued': firebase.firestore.FieldValue.increment(-1)
      });
      this.setState({
        scannedBookId: '',
        scannedStudentId: '',
        transactionMessage: ''
      });
    }

    handleTransaction = async ()=>{
      var transactionType = await this.checkBookEligibility();
      var isStudentEligible = '';
      if(transactionType == '' || transactionType == false || transactionType == null || transactionType == undefined){
        alert("The book doesn't exist in the library");
        this.setState({
          scannedStudentId: '',
          scannedBookId: ''
        });
      } else if(transactionType === 'issued'){
        isStudentEligible = await this.checkStudentEligibilityForBookIssue();
        if(isStudentEligible){
          this.initiateBookIssue();
          alert('Book Issued to the Student')
        } 
      } else{
        isStudentEligible = await this.checkStudentEligibilityForBookReturn();
        if(isStudentEligible){
          this.initiateBookReturn();
          alert('Book Return to the Library');
        }
      }
    }

    render() {
      {console.reportErrorsAsExceptions = false;}
      const hasCameraPermissions = this.state.hasCameraPermissions;
      const scanned = this.state.scanned;
      const buttonState = this.state.buttonState;

      if (buttonState !== "normal" && hasCameraPermissions){
        return(
          <BarCodeScanner
            onBarCodeScanned={scanned ? undefined : this.handleBarCodeScanned}
            style={StyleSheet.absoluteFillObject}
          />
        );
      }

      else if (buttonState === "normal"){
        return(
          <KeyboardAvoidingView style={styles.container} behavior='padding' enabled >
            <View>
              <Image source={require('../assets/booklogo.jpg')} style={{width: 200, height: 200}}/>
              <Text style={{textAlign: 'center', fontSize: 30}}>Willy</Text>
            </View>
            <View style={styles.inputView}>
              <TextInput style={styles.inputBox} placeholder="Book ID" onChangeText={(text)=>{
                this.setState({
                  scannedBookId: text
                })
              }} value={this.state.scannedBookId}/>
              
              <TouchableOpacity style={styles.scanButton} onPress={()=>{
                this.getCameraPermissions("bookID");
              }}>
                <Text style={styles.buttonText}> Scan </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.inputView}>
              <TextInput style={styles.inputBox} placeholder="Student ID" onChangeText={(text)=>{
                this.setState({
                  scannedStudentId: text
                })
              }} value={this.state.scannedStudentId}/>
              
              <TouchableOpacity style={styles.scanButton} onPress={()=>{
                this.getCameraPermissions("studentID");
              }}>
                <Text style={styles.buttonText}> Scan </Text>
              </TouchableOpacity>
            </View>
            <Text>{this.state.transactionMessage}</Text>
            <TouchableOpacity style={styles.submitButton} onPress={()=>{
              this.handleTransaction();
            }}>
              <Text style={styles.submitButtonText}>Submit</Text>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        );
      }
    }
  }

  const styles = StyleSheet.create({
    submitButton: {
      backgroundColor: 'green',
      width: 100,
      height: 50,
      display: "flex", 
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 15
    },
    submitButtonText: {
      fontSize: 20,
      fontWeight: "bold",
      color: 'white'
    },
    inputView: {
      flexDirection: 'row',
      margin: 20
    },
    inputBox: {
      width: 200,
      height: 40,
      borderWidth: 1.5,
      borderRightWidth: 0,
      fontSize: 20
    },  
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'
    },
    scanButton:{
      backgroundColor: '#2196F3',
      width: 50,
      borderWidth: 1.5,
      borderLeftWidth: 0
    },
    buttonText:{
      fontSize: 15,
      textAlign: 'center',
      marginTop: 10
    }
  });