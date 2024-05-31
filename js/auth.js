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

                showSucModal("User Logged In!!");
                window.location.href = "../index.html";
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

// function resetPassword() {
//   const email = document.getElementById("reset_email").value;

//   if (!validate_email(email)) {
//     showEModal("Please enter a valid Email Address!!");
//     return;
//   }

//   auth
//     .sendPasswordResetEmail(email)
//     .then(() => {
//       showNotifModal("Password reset email sent. Please check your email.");
//       // Show modal for setting new password
//       showResetPasswordModal();
//     })
//     .catch((error) => {
//       console.error("Error sending password reset email:", error);
//       showEModal(error.message);
//     });
// }

// function resetPassword() {
//   const email = document.getElementById("reset_email").value;

//   if (!validate_email(email)) {
//     showEModal("Please enter a valid Email Address!!");
//     return;
//   }

//   auth
//     .sendPasswordResetEmail(email)
//     .then(() => {
//       showNotifModal("Password reset email sent. Please check your email.");
//     })
//     .catch((error) => {
//       console.error("Error sending password reset email:", error);
//       showEModal(error.message);
//     });
// }

// // Function to handle password reset and automatic login
// function handlePasswordReset() {
//   const oobCode = new URLSearchParams(window.location.search).get("oobCode");
//   const email = new URLSearchParams(window.location.search).get("email");

//   if (!oobCode || !email) {
//     showEModal("Invalid or missing action code.");
//     return;
//   }

//   Swal.fire({
//     title: "Reset Password",
//     html:
//       '<input type="password" id="new_password" class="swal2-input" placeholder="New Password">' +
//       '<input type="password" id="confirm_new_password" class="swal2-input" placeholder="Confirm New Password">',
//     focusConfirm: false,
//     preConfirm: () => {
//       const newPassword = document.getElementById("new_password").value;
//       const confirmNewPassword = document.getElementById(
//         "confirm_new_password"
//       ).value;

//       if (!newPassword || !confirmNewPassword) {
//         Swal.showValidationMessage(
//           "Please enter both new password and confirm new password"
//         );
//         return false;
//       }

//       if (newPassword !== confirmNewPassword) {
//         Swal.showValidationMessage("Passwords do not match");
//         return false;
//       }

//       return { newPassword: newPassword };
//     },
//   }).then((result) => {
//     if (result.isConfirmed) {
//       const newPassword = result.value.newPassword;

//       auth
//         .verifyPasswordResetCode(oobCode)
//         .then(() => {
//           auth
//             .confirmPasswordReset(oobCode, newPassword)
//             .then(() => {
//               showSucModal("Password has been successfully reset.");

//               // Automatically log in the user after resetting the password
//               auth
//                 .signInWithEmailAndPassword(email, newPassword)
//                 .then(() => {
//                   window.location.href = "../pages/profile.html";
//                 })
//                 .catch((error) => {
//                   showEModal(error.message);
//                 });
//             })
//             .catch((error) => {
//               showEModal(error.message);
//             });
//         })
//         .catch((error) => {
//           showEModal("The action code is invalid or expired.");
//         });
//     }
//   });
// }

//
// document.addEventListener("DOMContentLoaded", () => {
//   const oobCode = new URLSearchParams(window.location.search).get("oobCode");
//   const email = new URLSearchParams(window.location.search).get("email");

//   if (oobCode && email) {
//     handlePasswordReset();
//   }
// });

// function updateProfile(event) {
//   event.preventDefault();

//   const user = auth.currentUser;
//   if (user) {
//     const username = document.getElementById("edit-username").value;
//     const email = document.getElementById("edit-email").value;
//     const currentPassword = document.getElementById("current-password").value;

//     if (!validate_field(username) && !validate_field(email)) {
//       showEModal("Please fill in at least one field to update.");
//       return;
//     }

//     if (!validate_field(currentPassword)) {
//       showEModal("Current password is required for verification!");
//       return;
//     }

//     // Re-authenticate the user
//     const credential = firebase.auth.EmailAuthProvider.credential(
//       user.email,
//       currentPassword
//     );
//     user
//       .reauthenticateWithCredential(credential)
//       .then(() => {
//         // Proceed to update profile
//         const promises = [];
//         if (username && username !== user.displayName) {
//           promises.push(
//             firestore.collection("users").doc(user.uid).update({ username })
//           );
//         }

//         if (email && validate_email(email) && email !== user.email) {
//           // Check if the new email is already in use
//           firestore
//             .collection("users")
//             .where("email", "==", email)
//             .get()
//             .then((querySnapshot) => {
//               if (!querySnapshot.empty) {
//                 showEModal(
//                   "The email is already in use. Please choose a different email."
//                 );
//                 return;
//               } else {
//                 promises.push(
//                   user
//                     .updateEmail(email)
//                     .then(() => {
//                       return user.sendEmailVerification().then(() => {
//                         showNotifModal(
//                           "Verification email sent to new email address. Please verify your email to complete the update."
//                         );
//                         // Prompt user to create new password after email verification
//                         Swal.fire({
//                           title: "Create New Password",
//                           html: `
//                       <input type="password" id="new-password" class="swal2-input" placeholder="New Password" required>
//                       <input type="password" id="confirm-new-password" class="swal2-input" placeholder="Confirm New Password" required>
//                     `,
//                           confirmButtonText: "Save Changes",
//                           showLoaderOnConfirm: true,
//                           preConfirm: () => {
//                             const newPassword =
//                               document.getElementById("new-password").value;
//                             const confirmNewPassword = document.getElementById(
//                               "confirm-new-password"
//                             ).value;
//                             if (newPassword !== confirmNewPassword) {
//                               return Swal.showValidationMessage(
//                                 "Passwords do not match!"
//                               );
//                             }
//                             // Update password
//                             return user
//                               .updatePassword(newPassword)
//                               .catch((error) => {
//                                 console.error(
//                                   "Error updating password:",
//                                   error
//                                 );
//                                 throw new Error(error.message);
//                               });
//                           },
//                         })
//                           .then((result) => {
//                             if (result.isConfirmed) {
//                               showSucModal("Password updated successfully.");
//                               // Delete old account after updating password
//                               user
//                                 .delete()
//                                 .then(() => {
//                                   showSucModal(
//                                     "Old account deleted successfully."
//                                   );
//                                   // Redirect user to appropriate page or log them out
//                                   // For demonstration, redirect to home page
//                                   window.location.href = "../index.html";
//                                 })
//                                 .catch((error) => {
//                                   console.error(
//                                     "Error deleting old account:",
//                                     error
//                                   );
//                                   showEModal(
//                                     "Error deleting old account: " +
//                                       error.message
//                                   );
//                                 });
//                             }
//                           })
//                           .catch((error) => {
//                             console.error("Error updating password:", error);
//                             showEModal(error.message);
//                           });
//                       });
//                     })
//                     .catch((error) => {
//                       console.error("Error updating email:", error);
//                       showEModal(error.message);
//                     })
//                 );
//               }
//             })
//             .catch((error) => {
//               console.error("Error checking email:", error);
//               showEModal("Error checking email: " + error.message);
//             });
//         }

//         Promise.all(promises)
//           .then(() => {
//             showSucModal("Profile updated successfully.");
//             // Optionally refresh the profile information displayed on the page
//             document.getElementById("username").textContent =
//               username || user.displayName;
//             document.getElementById("email").textContent = email || user.email;
//           })
//           .catch((error) => {
//             console.error("Error updating profile:", error);
//             showEModal(error.message);
//           });
//       })
//       .catch((error) => {
//         console.error("Error re-authenticating:", error);
//         showEModal("Re-authentication failed. Please check your password.");
//       });
//   } else {
//     console.log("No user is signed in");
//   }
// }
function confirmPasswordReset(oobCode, newPassword) {
  auth
    .confirmPasswordReset(oobCode, newPassword)
    .then(() => {
      showSucModal("Password has been successfully reset.");

      window.location.href = "./auth.html";
    })
    .catch((error) => {
      console.error("Error resetting password:", error);
      showEModal(error.message);
    });
}

function updateProfile(event) {
  event.preventDefault();

  const user = auth.currentUser;
  if (user) {
    const username = document.getElementById("edit-username").value;
    const email = document.getElementById("edit-email").value;
    const currentPassword = document.getElementById("current-password").value;

    if (!validate_field(username) && !validate_field(email)) {
      showEModal("Please fill in at least one field to update.");
      return;
    }

    if (!validate_field(currentPassword)) {
      showEModal("Current password is required for verification!");
      return;
    }

    const credential = firebase.auth.EmailAuthProvider.credential(
      user.email,
      currentPassword
    );
    user
      .reauthenticateWithCredential(credential)
      .then(() => {
        const promises = [];
        if (username && username !== user.displayName) {
          promises.push(
            firestore.collection("users").doc(user.uid).update({ username })
          );
        }

        if (email && validate_email(email) && email !== user.email) {
          user
            .updateEmail(email)
            .then(() => {
              // Send email verification
              return user.sendEmailVerification();
            })
            .then(() => {
              showNotifModal(
                "Verification email sent. Please verify your new email address."
              ).then(() => {
                document.getElementById("username").textContent =
                  username || user.displayName;
                document.getElementById("email").textContent =
                  email || user.email;
              });
            })
            .catch((error) => {
              console.error("Error updating email:", error);
              showEModal(error.message);
            });
        } else {
          Promise.all(promises)
            .then(() => {
              showSucModal("Profile updated successfully.").then(() => {
                document.getElementById("username").textContent =
                  username || user.displayName;
                document.getElementById("email").textContent =
                  email || user.email;
              });
            })
            .catch((error) => {
              console.error("Error updating profile:", error);
              showEModal(error.message);
            });
        }
      })
      .catch((error) => {
        console.error("Error re-authenticating:", error);
        showEModal("Re-authentication failed. Please check your password.");
      });
  } else {
    console.log("No user is signed in");
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const editProfileForm = document.querySelector(".edit-profile-form");
  if (editProfileForm) {
    editProfileForm.addEventListener("submit", updateProfile);
  }

  const user = auth.currentUser;
  if (user) {
    document.getElementById("edit-username").value = user.displayName || "";
    document.getElementById("edit-username").placeholder =
      user.displayName || "Current Username";
    document.getElementById("edit-email").value = user.email || "";
    document.getElementById("edit-email").placeholder =
      user.email || "Current Email";
  }
});

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
