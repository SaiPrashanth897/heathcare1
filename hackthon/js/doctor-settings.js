// settings.js (with embedded Firebase config)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import {
  getAuth,
  updatePassword,
  onAuthStateChanged,
  deleteUser,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-storage.js";

// 🔧 Your Firebase config (replace with real credentials)
const firebaseConfig = {
    apiKey: "AIzaSyDbuYEkjKDbA0MhJiBkByaFJVTS44ieNSY",
    authDomain: "heathcare-ab5aa.firebaseapp.com",
    projectId: "heathcare-ab5aa",
    storageBucket: "heathcare-ab5aa.appspot.com",
    messagingSenderId: "160649667093",
    appId: "1:160649667093:web:ad42dbaa790d9c0cc2641"
  };

// 🔥 Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Load profile data
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const docRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      document.getElementById("name").value = data.name || "";
      document.getElementById("email").value = user.email || "";
      document.getElementById("phone").value = data.phone || "";
      document.getElementById("specialty").value = data.specialty || "";
      document.getElementById("clinic").value = data.clinic || "";
      document.getElementById("emailNotifications").checked = data.emailNotifications ?? true;
      document.getElementById("pushNotifications").checked = data.pushNotifications ?? true;
    }
  } else {
    window.location.href = "login.html";
  }
});

// Save profile updates
document.getElementById("profileForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const user = auth.currentUser;
  if (!user) return;

  const docRef = doc(db, "users", user.uid);
  const file = document.getElementById("profilePic").files[0];
  let profilePicURL = "";

  try {
    if (file) {
      const storageRef = ref(storage, `profilePics/${user.uid}`);
      await uploadBytes(storageRef, file);
      profilePicURL = await getDownloadURL(storageRef);
    }

    await updateDoc(docRef, {
      name: document.getElementById("name").value,
      phone: document.getElementById("phone").value,
      specialty: document.getElementById("specialty").value,
      clinic: document.getElementById("clinic").value,
      emailNotifications: document.getElementById("emailNotifications").checked,
      pushNotifications: document.getElementById("pushNotifications").checked,
      ...(profilePicURL && { profilePic: profilePicURL }),
    });

    alert("✅ Profile updated successfully.");
  } catch (error) {
    alert("❌ Failed to update profile: " + error.message);
  }
});

// Change password
document.getElementById("changePasswordBtn").addEventListener("click", async () => {
  const newPassword = prompt("Enter your new password:");
  if (newPassword) {
    try {
      await updatePassword(auth.currentUser, newPassword);
      alert("🔐 Password updated.");
    } catch (err) {
      alert("❌ Error: " + err.message);
    }
  }
});

// Export data
document.getElementById("exportDataBtn").addEventListener("click", async () => {
  const user = auth.currentUser;
  const docSnap = await getDoc(doc(db, "users", user.uid));
  const data = docSnap.data();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "smartcare_profile_data.json";
  link.click();
  URL.revokeObjectURL(url);
});

// Delete account
document.getElementById("deleteAccountBtn").addEventListener("click", async () => {
  const confirmed = confirm("⚠️ Are you sure you want to delete your account?");
  if (confirmed) {
    try {
      await deleteUser(auth.currentUser);
      alert("🗑️ Account deleted.");
      window.location.href = "login.html";
    } catch (err) {
      alert("❌ Error deleting account: " + err.message);
    }
  }
});

// Logout
document.getElementById("logoutBtn").addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "login.html";
});
