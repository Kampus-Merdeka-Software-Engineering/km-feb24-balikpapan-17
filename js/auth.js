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
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
}

function register() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const username = document.getElementById("username").value;

  if (!validate_gmail(email)) {
    alert("Please use a valid Gmail address!!");
    return;
  }

  if (!validate_password(password)) {
    alert("Password should be at least 6 characters long!!");
    return;
  }

  if (!validate_field(username)) {
    alert("Username is required!!");
    return;
  }

  auth
    .createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      const user_data = {
        email: email,
        username: username,
        last_login: firebase.firestore.FieldValue.serverTimestamp(),
      };

      if (validate_gmail(email)) {
        firestore
          .collection("users")
          .doc(user.uid)
          .set(user_data)
          .then(() => {
            alert("User Created!!");
            window.location.href = "./profile.html";
          })
          .catch((error) => {
            alert(error.message);
          });
      } else {
        alert("Invalid Gmail address. User registration aborted.");
      }
    })
    .catch((error) => {
      alert(error.message);
    });
}

function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  auth
    .signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      const user_data = {
        last_login: firebase.firestore.FieldValue.serverTimestamp(),
      };

      firestore
        .collection("users")
        .doc(user.uid)
        .update(user_data)
        .then(() => {
          firestore
            .collection("users")
            .doc(user.uid)
            .get()
            .then((doc) => {
              if (doc.exists) {
                const userData = doc.data();
                const userRole = userData.role;
                sessionStorage.setItem("isAuthenticated", "true");
                sessionStorage.setItem("userRole", userRole);
                if (userRole === "admin") {
                  window.location.href = "../pages/dashboard.html";
                } else {
                  window.location.href = "../pages/profile.html";
                }
              } else {
                console.log("User information not found!");
              }
            })
            .catch((error) => {
              console.error("Error getting user data:", error);
            });
        })
        .catch((error) => {
          console.error("Error updating user data:", error);
        });
    })
    .catch((error) => {
      alert(error.message);
    });
}

function googleSignIn() {
  auth
    .signInWithPopup(provider)
    .then((result) => {
      const user = result.user;
      const userRef = firestore.collection("users").doc(user.uid);
      userRef
        .get()
        .then((doc) => {
          if (!doc.exists) {
            const user_data = {
              email: user.email,
              username: user.displayName,
              last_login: firebase.firestore.FieldValue.serverTimestamp(),
            };
            userRef
              .set(user_data)
              .then(() => {
                alert("User Created!!");
                window.location.href = "profile.html";
              })
              .catch((error) => {
                alert(error.message);
              });
          } else {
            userRef
              .update({
                last_login: firebase.firestore.FieldValue.serverTimestamp(),
              })
              .then(() => {
                alert("User Logged In!!");
                window.location.href = "../index.html";
              })
              .catch((error) => {
                alert(error.message);
              });
          }
        })
        .catch((error) => {
          alert(error.message);
        });
    })
    .catch((error) => {
      alert(error.message);
    });
}

function logout() {
  sessionStorage.removeItem("isAuthenticated");
  sessionStorage.removeItem("userRole");

  firebase
    .auth()
    .signOut()
    .then(function () {
      window.location.href = "../pages/auth.html";
    })
    .catch(function (error) {
      console.error(error);
    });
}

function goHome() {
  window.location.href = "../index.html";
}

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
