firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const firestore = firebase.firestore();
const provider = new firebase.auth.GoogleAuthProvider();

function validate_email(email) {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
}

const showEModal = (message) => {
  Swal.fire({
    title: "Error!",
    text: message,
    iconHtml: "<i class='fa-solid fa-bug'></i>",
    width: 600,
    padding: "3em",
    showClass: {
      popup: "swipe-in-from-bottom",
    },
    hideClass: {
      popup: "swipe-out-to-bottom",
    },
    customClass: {
      title: "my-title-class",
      content: "my-content-class",
      confirmButton: "my-confirm-button-class",
    },
    buttonsStyling: false,
  });
};

const showNotifModal = (message) => {
  Swal.fire({
    title: "Check!",
    text: message,
    iconHtml: "<i class='fa-solid fa-triangle-exclamation'></i>",
    width: 600,
    padding: "3em",
    showClass: {
      popup: "swipe-in-from-bottom",
    },
    hideClass: {
      popup: "swipe-out-to-bottom",
    },
    customClass: {
      title: "my-title-class",
      content: "my-content-class",
      confirmButton: "my-confirm-button-class",
    },
    buttonsStyling: false,
  });
};

const showSucModal = (message) => {
  Swal.fire({
    title: "Done!",
    text: message,
    iconHtml: "<i class='fa-regular fa-square-check'></i>",
    width: 600,
    padding: "3em",
    showClass: {
      popup: "swipe-in-from-bottom",
    },
    hideClass: {
      popup: "swipe-out-to-bottom",
    },
    customClass: {
      title: "my-title-class",
      content: "my-content-class",
      confirmButton: "my-confirm-button-class",
    },
    buttonsStyling: false,
  });
};

function register() {
  const email = document.getElementById("register_email").value;
  const password = document.getElementById("register_password").value;
  const username = document.getElementById("username").value;

  if (!validate_email(email)) {
    showEModal("Please enter a valid Email Address!!");
    return;
  }

  if (password.length < 6) {
    showEModal("Password should be at least 6 characters long!!");
    return;
  }

  if (!validate_field(username)) {
    showEModal("Username is required!!");
    return;
  }

  auth
    .createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      const user = userCredential.user;

      user
        .sendEmailVerification()
        .then(() => {
          showNotifModal(
            "Verification email sent. Please verify your email to complete the registration."
          );

          const checkEmailVerified = setInterval(() => {
            user
              .reload()
              .then(() => {
                if (user.emailVerified) {
                  clearInterval(checkEmailVerified);

                  const user_data = {
                    email: email,
                    username: username,
                    role: "user",
                    last_login: firebase.firestore.FieldValue.serverTimestamp(),
                  };

                  firestore
                    .collection("users")
                    .doc(user.uid)
                    .set(user_data)
                    .then(() => {
                      sessionStorage.setItem("isAuthenticated", "true");
                      sessionStorage.setItem("userRole", "user");

                      Swal.fire({
                        title: "Success!",
                        text: "Your email has been verified. User created successfully!",
                        iconHtml: "<i class='fa-solid fa-check'></i>",
                        confirmButtonText: "OK",
                        showClass: {
                          popup: "swipe-in-from-bottom",
                        },
                        hideClass: {
                          popup: "swipe-out-to-bottom",
                        },
                        customClass: {
                          confirmButton: "my-confirm-button-class",
                        },
                        buttonsStyling: false,
                      }).then((result) => {
                        if (result.isConfirmed) {
                          window.location.href = "../pages/profile.html";
                        }
                      });
                    })
                    .catch((error) => {
                      console.error("Error saving user data:", error);
                      showEModal(error.message);
                    });
                }
              })
              .catch((error) => {
                console.error("Error reloading user:", error);
              });
          }, 1000);
        })
        .catch((error) => {
          console.error("Error sending verification email:", error);
          showEModal(error.message);
        });
    })
    .catch((error) => {
      showEModal(error.message);
    });
}

function login() {
  const email = document.getElementById("login_email").value;
  const password = document.getElementById("login_password").value;

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
                if (userRole === "admin" || userRole === "user") {
                  window.location.href = "../pages/dashboard.html";
                  sessionStorage.setItem("activePage", "dashboard");
                } else {
                  console.log("User role is not recognized");
                  showEModal("User role is not recognized");
                }
              } else {
                console.log("User information not found!");
                showEModal("User information not found!");
              }
            })
            .catch((error) => {
              console.error("Error getting user data:", error);
              showEModal("Error getting user data: " + error.message);
            });
        })
        .catch((error) => {
          console.error("Error updating user data:", error);
          showEModal("Error updating user data: " + error.message);
        });
    })
    .catch((error) => {
      showEModal(error.message);
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
              role: "user",
            };
            userRef
              .set(user_data)
              .then(() => {
                sessionStorage.setItem("isAuthenticated", "true");
                sessionStorage.setItem("userRole", "user");
                showSucModal("User Created!!");
                window.location.href = "../pages/profile.html";
              })
              .catch((error) => {
                showEModal(error.message);
              });
          } else {
            userRef
              .update({
                last_login: firebase.firestore.FieldValue.serverTimestamp(),
              })
              .then(() => {
                sessionStorage.setItem("isAuthenticated", "true");
                userRef.get().then((updatedDoc) => {
                  const userRole = updatedDoc.data().role;
                  sessionStorage.setItem("userRole", userRole);
                  showSucModal("User Logged In!!");
                  window.location.href = "../index.html";
                });
              })
              .catch((error) => {
                showEModal(error.message);
              });
          }
        })
        .catch((error) => {
          showEModal(error.message);
        });
    })
    .catch((error) => {
      showEModal(error.message);
    });
}

function logout() {
  Swal.fire({
    title: "Are you sure?",
    text: "You will be logged out!",
    iconHtml: "<i class='fas fa-exclamation-circle'></i>",
    showCancelButton: true,
    confirmButtonColor: "#5e3229",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, log out!",
    showClass: {
      popup: "swipe-in-from-bottom",
    },
    hideClass: {
      popup: "swipe-out-to-bottom",
    },
    customClass: {
      icon: "custom-warning-icon",
      confirmButton: "custom-confirm-button",
      cancelButton: "custom-cancel-button",
    },
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.fire({
        title: "Logged out!",
        text: "You have been logged out successfully.",
        iconHtml: "<i class='fas fa-check-circle'></i>",
        showClass: {
          popup: "swipe-in-from-bottom",
        },
        hideClass: {
          popup: "swipe-out-to-bottom",
        },
        customClass: {
          icon: "custom-success-icon",
          confirmButton: "custom-confirm-button",
        },
      }).then(() => {
        auth
          .signOut()
          .then(function () {
            sessionStorage.removeItem("isAuthenticated");
            sessionStorage.removeItem("userRole");
            window.location.href = "../pages/auth.html?#";
          })
          .catch(function (error) {
            console.error(error);
            Swal.fire({
              title: "Error",
              text: "An error occurred during logout.",
              iconHtml: "<i class='fas fa-times-circle'></i>",
              showClass: {
                popup: "swipe-in-from-bottom",
              },
              hideClass: {
                popup: "swipe-out-to-bottom",
              },
              customClass: {
                icon: "custom-error-icon",
                confirmButton: "custom-confirm-button",
              },
            });
          });
      });
    }
  });
}

function goHome() {
  window.location.href = "../index.html";
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
