import React from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';
import { createAppContainer, createSwitchNavigator } from 'react-navigation';
import { createBottomTabNavigator } from 'react-navigation-tabs';

import TransactionScreen from './screens/BookTransactionScreen';
import Searchscreen from './screens/SearchScreen';
import LoginScreen from './screens/LoginScreen';

export default class App extends React.Component {
  render(){
    {console.disableYellowBox = true}
    return (
      
        <AppContainer />
      
    );
  }
}

const TabNavigator = createBottomTabNavigator({
  Transaction: {screen: TransactionScreen},
  Search: {screen: Searchscreen},
}, {
  defaultNavigationOptions: ({navigation})=>({
    tabBarIcon: ()=>{
      const routeName = navigation.state.routeName
      console.log(routeName);
      if(routeName === "Transaction"){
        return(
          <Image source={require('./assets/book.png')} style={{width: 40, height: 40}}/>
        )
      } else if(routeName === "Search"){
        return(
          <Image source={require('./assets/searchingbook.png')} style={{width: 40, height: 40}}/>
        )
      }
    }
  })
});

const SwitchNavigator = createSwitchNavigator({
  LoginScreen: {screen: LoginScreen},
  TabNavigator: {screen: TabNavigator}
});

const AppContainer =  createAppContainer(SwitchNavigator);