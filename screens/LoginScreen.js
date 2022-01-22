import React from 'react';
import { StyleSheet, Text, View, KeyboardAvoidingView, TouchableOpacity, TextInput, Image, Alert } from 'react-native';
import firebase from 'firebase';

export default class LoginScreen extends React.Component{
    constructor(){
        super();
        this.state = {
            email: '',
            password: ''
        }
    }

    login = async (email, password) => {
        if(email && password){
            try{
                const response = await firebase.auth().signInWithEmailAndPassword(email, password);
                if(response){
                    this.props.navigation.navigate('Transaction');
                } 
            } 
            catch(error){
                switch(error.code){
                    case 'auth/user-not-found':
                        Alert.alert("User doesn't exist");
                    break;
                    case 'auth/invalid-email':
                        Alert.alert("Incorrect E-mail");
                    break;
                    case 'auth/invalid-password':
                        Alert.alert('Incorrect Password')
                    break;
                }
            }
        } else {
            Alert.alert("Enter E-mail and Password.");
        }
    }

    render(){
        return(
            <KeyboardAvoidingView style={{alignItems: 'center', marginTop: 20}}
            behavior='padding' enabled>
                <View>
                    <Image source={require('../assets/booklogo.jpg')} style={{width: 200, height: 200}}/>
                    <Text style={{textAlign: 'center', fontSize: 35, fontWeight: 'bold'}}>Willy App</Text>
                </View>
                <View>
                    <TextInput
                        style={styles.loginBox}
                        placeholder='E-mail Id'
                        keyboardType='email-address'
                        onChangeText={(text)=>{
                            this.setState({
                                email: text
                            })
                        }}
                        value={this.state.email}
                    />
                    <TextInput
                        style={styles.loginBox}
                        placeholder='password'
                        secureTextEntry = {true}
                        onChangeText={(text)=>{
                            this.setState({
                                password: text
                            })
                        }}
                        value={this.state.password}
                    />
                </View>
                <View>
                        <TouchableOpacity style={{height: 30, width: 90, borderWidth: 1, marginTop: 20, paddingTop: 5, borderRadius: 7}}
                        onPress={()=>{
                            this.login(this.state.email, this.state.password);
                        }}>
                            <Text style={{textAlign: 'center'}}>Login</Text>
                        </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        )
    }
}

const styles = StyleSheet.create({
    loginBox: {
        width: 300,
        height: 40,
        borderWidth: 1.5,
        fontSize: 20,
        margin: 10,
        paddingLeft: 10
    }
})