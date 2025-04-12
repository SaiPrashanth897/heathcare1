import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  updateDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyDbuYEkjKDbA0MhJiBkByaFJVTS44ieNSY",
    authDomain: "heathcare-ab5aa.firebaseapp.com",
    projectId: "heathcare-ab5aa",
    storageBucket: "heathcare-ab5aa.appspot.com",
    messagingSenderId: "160649667093",
    appId: "1:160649667093:web:ad42dbaa790d9c0cc2641c",
    measurementId: "G-M3ZSFT8XQH"
  };

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Fetch and display ADR alerts
const tableBody = document.querySelector("#adrTable tbody");
const statusMsg = document.getElementById("statusMessage");

async function loadADRAlerts() {
  tableBody.innerHTML = "";
  const querySnapshot = await getDocs(collection(db, "adr_alerts"));
  let found = false;

  querySnapshot.forEach((docSnap) => {
    const data = docSnap.data();
    if (data.status === "unconfirmed") {
      found = true;
      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${data.patientName}</td>
        <td>${data.drug}</td>
        <td>${data.symptom}</td>
        <td>${data.severity}</td>
        <td>${data.status}</td>
        <td>
          <button class="confirmBtn" data-id="${docSnap.id}">✅ Confirm</button>
          <button class="dismissBtn" data-id="${docSnap.id}">❌ Dismiss</button>
        </td>
      `;

      tableBody.appendChild(row);
    }
  });

  if (!found) {
    statusMsg.textContent = "✅ No pending ADR alerts.";
  }

  // Event listeners
  document.querySelectorAll(".confirmBtn").forEach(btn => {
    btn.addEventListener("click", () => updateStatus(btn.dataset.id, "confirmed"));
  });

  document.querySelectorAll(".dismissBtn").forEach(btn => {
    btn.addEventListener("click", () => updateStatus(btn.dataset.id, "dismissed"));
  });
}

async function updateStatus(id, newStatus) {
  const ref = doc(db, "adr_alerts", id);
  await updateDoc(ref, { status: newStatus });
  loadADRAlerts();
}

loadADRAlerts();
