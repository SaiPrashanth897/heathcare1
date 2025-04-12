import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import {
  getFirestore, collection, getDocs, addDoc, doc, updateDoc,
  onSnapshot, query, where
} from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

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

// Elements
const patientSelect = document.getElementById("patientSelect");
const diseaseSelect = document.getElementById("diseaseSelect");
const medicineSelect = document.getElementById("medicineSelect");
const form = document.getElementById("prescriptionForm");
const interactionResult = document.getElementById("interactionResult");
const prescriptionsTable = document.getElementById("prescriptionsTable");

const diseaseMedicineMap = {
  Hypertension: ["Losartan", "Amlodipine", "Enalapril", "Warfarin", "Aspirin"],
  Diabetes: ["Metformin", "Insulin", "Glipizide", "Cimetidine"],
  Asthma: ["Salbutamol", "Budesonide", "Montelukast"],
  HeartDisease: ["Aspirin", "Clopidogrel", "Warfarin"]
};


// Load patients
async function loadPatients() {
  const snapshot = await getDocs(collection(db, "patients"));
  snapshot.forEach(doc => {
    const option = document.createElement("option");
    option.value = doc.id;
    option.textContent = doc.data().name;
    patientSelect.appendChild(option);
  });
}

// Handle disease selection
diseaseSelect.addEventListener("change", () => {
  const disease = diseaseSelect.value;
  medicineSelect.innerHTML = `<option value="">Select</option>`;
  if (diseaseMedicineMap[disease]) {
    diseaseMedicineMap[disease].forEach(med => {
      const option = document.createElement("option");
      option.value = med;
      option.textContent = med;
      medicineSelect.appendChild(option);
    });
  }
});

// Submit prescription
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const patientId = patientSelect.value;
  const disease = diseaseSelect.value;
  const medicine = medicineSelect.value;
  const dosage = document.getElementById("dosage").value;
  const frequency = document.getElementById("frequency").value;

  const prescription = {
    patientId,
    disease,
    medicine,
    dosage,
    frequency,
    status: "Active",
    timestamp: Date.now()
  };

  interactionResult.textContent = "Checking for interactions..."; // Show temporary loading state

  const adr = await checkADR(patientId, medicine);

  if (adr.possible) {
    interactionResult.textContent = `⚠️ ${adr.reason}`;
    interactionResult.style.color = "red";
    await addDoc(collection(db, "adr_alerts"), {
      patientId,
      medicine,
      reason: adr.reason,
      severity: adr.severity || "moderate",
      timestamp: Date.now(),
      acknowledged: false
    });
  } else {
    interactionResult.textContent = "✅ No known interactions found.";
    interactionResult.style.color = "green";
  }

  await addDoc(collection(db, "prescriptions"), prescription);
  form.reset();
});

// ADR Checker using RxNav
async function checkADR(patientId, newMedicine) {
  try {
    const cuiRes = await fetch(`https://rxnav.nlm.nih.gov/REST/rxcui.json?name=${encodeURIComponent(newMedicine)}&search=2`);
    const cuiData = await cuiRes.json();
    const newRxCUI = cuiData.idGroup?.rxnormId?.[0];

    if (!newRxCUI) {
      console.warn("❗ RxCUI not found for:", newMedicine);
      return { possible: false };
    }

    const q = query(collection(db, "prescriptions"),
      where("patientId", "==", patientId),
      where("status", "==", "Active"));
    const snapshot = await getDocs(q);

    const medNames = snapshot.docs.map(doc => doc.data().medicine);
    const cuiPromises = medNames.map(async name => {
      const res = await fetch(`https://rxnav.nlm.nih.gov/REST/rxcui.json?name=${encodeURIComponent(name)}&search=2`);
      const data = await res.json();
      return data.idGroup?.rxnormId?.[0];
    });

    const existingCUIs = (await Promise.all(cuiPromises)).filter(Boolean);
    if (existingCUIs.length === 0) return { possible: false };

    const allCUIs = [newRxCUI, ...existingCUIs].join(",");
    const interactionRes = await fetch(`https://rxnav.nlm.nih.gov/REST/interaction/list.json?rxcuis=${allCUIs}`);
    const interactionData = await interactionRes.json();

    const interactions = interactionData?.fullInteractionTypeGroup?.[0]?.fullInteractionType || [];
    if (interactions.length > 0) {
      const firstPair = interactions[0].interactionPair?.[0];
      return {
        possible: true,
        reason: firstPair.description,
        severity: firstPair.severity || "moderate"
      };
    }

    return { possible: false };
  } catch (error) {
    console.error("ADR Check Error:", error);
    interactionResult.textContent = "Error checking for interactions.";
    interactionResult.style.color = "orange";
    return { possible: false };
  }
}

// Load prescriptions into table
function loadPrescriptions() {
  const q = collection(db, "prescriptions");
  onSnapshot(q, async (snapshot) => {
    prescriptionsTable.innerHTML = "";
    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      const patientDoc = await getDocs(collection(db, "patients"));
      const patient = patientDoc.docs.find(p => p.id === data.patientId)?.data()?.name || "Unknown";

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td class="p-2 border">${patient}</td>
        <td class="p-2 border">${data.medicine}</td>
        <td class="p-2 border">${data.dosage} mg</td>
        <td class="p-2 border">${data.status}</td>
        <td class="p-2 border space-x-2">
          <button class="bg-green-500 text-white px-2 py-1 rounded" onclick="markCompleted('${docSnap.id}')">Complete</button>
          <button class="bg-yellow-500 text-white px-2 py-1 rounded" onclick="markModified('${docSnap.id}')">Modify</button>
        </td>
      `;
      prescriptionsTable.appendChild(tr);
    }
  });
}

// Mark as completed
window.markCompleted = async function (id) {
  const docRef = doc(db, "prescriptions", id);
  await updateDoc(docRef, { status: "Completed" });
};

// Mark as modified
window.markModified = async function (id) {
  const docRef = doc(db, "prescriptions", id);
  await updateDoc(docRef, { status: "Modified" });
};

// Initialize on load
loadPatients();
loadPrescriptions();
