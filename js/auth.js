// auth.js
const firebaseConfig = {
  apiKey: "AIzaSyDCW0iJbOjSfZ8QYuPhDTJQi6Hq6SuOLXI",
  authDomain: "km-balikpapan-team17.firebaseapp.com",
  databaseURL:
    "https://km-balikpapan-team17-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "km-balikpapan-team17",
  storageBucket: "km-balikpapan-team17.appspot.com",
  messagingSenderId: "621633907233",
  appId: "1:621633907233:web:0f02c8b05222da50b8d160",
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const firestore = firebase.firestore();
const provider = new firebase.auth.GoogleAuthProvider();

function validate_email(email) {
  expression = /^[^@]+@\w+(\.\w+)+\w$/;
  if (expression.test(email) == true) {
    return true;
  } else {
    return false;
  }
}

function validate_password(password) {
  if (password < 6) {
    return false;
  } else {
    return true;
  }
}

function validate_field(field) {
  if (field == null) {
    return false;
  }

  if (field.length <= 0) {
    return false;
  } else {
    return true;
  }
}
