import firebase from "firebase";

var firebaseConfig = {
    apiKey: "AIzaSyBSxPiZY4XKl85ssUj0-hf311xoYxbSMsc",
    authDomain: "willy-app-770e8.firebaseapp.com",
    databaseURL: 'https://willy-app-770e8.firebaseio.com',
    projectId: "willy-app-770e8",
    storageBucket: "willy-app-770e8.appspot.com",
    messagingSenderId: "460402025099",
    appId: "1:460402025099:web:490fef7dd9de6bcb8d6a8e"
};

firebase.initializeApp(firebaseConfig);

export default firebase.firestore();