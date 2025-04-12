// Firebase imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import {
  getFirestore,
  collection,
  query,
  where,
  orderBy,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDbuYEkjKDbA0MhJiBkByaFJVTS44ieNSY",
  authDomain: "heathcare-ab5aa.firebaseapp.com",
  projectId: "heathcare-ab5aa",
  storageBucket: "heathcare-ab5aa.appspot.com",
  messagingSenderId: "160649667093",
  appId: "1:160649667093:web:ad42dbaa790d9c0cc2641"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Function to render ADR alerts in table
async function renderAdrAlerts(userId) {
  const tableBody = document.querySelector("#adrTable tbody");
  tableBody.innerHTML = "<tr><td colspan='4'>Loading...</td></tr>";

  try {
    const adrRef = collection(db, "adr_alerts");
    const q = query(
      adrRef,
      where("patientId", "==", userId),
      orderBy("timestamp", "desc")
    );
    const snapshot = await getDocs(q);

    tableBody.innerHTML = ""; // Clear loading row

    if (snapshot.empty) {
      tableBody.innerHTML = "<tr><td colspan='4'>No ADR alerts found.</td></tr>";
      return;
    }

    snapshot.forEach(doc => {
      const alert = doc.data();
      const row = document.createElement("tr");

      // Severity class
      let severityClass = "";
      if (alert.severity === "high") {
        severityClass = "red";
      } else if (alert.severity === "moderate") {
        severityClass = "yellow";
      }

      row.innerHTML = `
        <td>${alert.symptom}</td>
        <td>${alert.medicine}</td>
        <td class="${severityClass}">${alert.severity}</td>
        <td>${alert.status || "Pending"}</td>
      `;
      tableBody.appendChild(row);
    });

  } catch (error) {
    console.error("Error fetching ADR alerts:", error);
    tableBody.innerHTML = "<tr><td colspan='4'>Error loading alerts.</td></tr>";
  }
}

// Auth check
onAuthStateChanged(auth, (user) => {
  if (user) {
    renderAdrAlerts(user.uid);
  } else {
    window.location.href = "login.html";
  }
});

// Logout button
document.getElementById("logoutBtn").addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "login.html";
});
