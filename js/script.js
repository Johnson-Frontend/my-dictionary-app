import { db } from "./firebase-config.js";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  getDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

// --------- Debugging Firebase Initialization ---------
console.log("Firestore DB Loaded:", db);
if (!db) {
  console.error("Firestore is not initialized. Check firebase-config.js.");
}

// --------- Add Entry Logic ---------
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("addForm");
  const message = document.getElementById("message");

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Get form values
    const entryType = document.getElementById("entryType").value;
    const entryText = document.getElementById("entryText").value.trim();
    const entryDefinition = document.getElementById("entryDefinition").value.trim();
    const entryExample = document.getElementById("entryExample").value.trim();
    const entryDifficulty = document.getElementById("entryDifficulty").value;

    // Validation
    if (!entryType || !entryText || !entryDefinition || !entryExample || !entryDifficulty) {
      showMessage("Error: All fields are required!", "red");
      return;
    }

    try {
      console.log("Submitting data to Firestore...");
      const data = {
        date: serverTimestamp(),
        type: entryType,
        text: entryText,
        definition: entryDefinition,
        example: entryExample,
        difficulty: parseInt(entryDifficulty),
      };

      console.log("Data to add:", data);

      await addDoc(collection(db, "dictionaryEntries"), data);

      console.log("Document added successfully!");
      showMessage("Entry added successfully!", "green");
      form.reset();
    } catch (error) {
      console.error("Error adding entry:", error.message);
      showMessage("Error: Could not add entry. Check console for details.", "red");
    }
  });

  function showMessage(msg, color) {
    message.textContent = msg;
    message.style.color = color;
    message.style.display = "block";
    setTimeout(() => (message.style.display = "none"), 3000);
  }
});

// --------- View Entries Logic ---------
document.addEventListener("DOMContentLoaded", async () => {
  const tableBody = document.getElementById("tableBody");

  if (tableBody) {
    try {
      console.log("Fetching data from Firestore...");
      const querySnapshot = await getDocs(collection(db, "dictionaryEntries"));
      tableBody.innerHTML = "";

      if (querySnapshot.empty) {
        console.warn("No entries found in Firestore.");
        tableBody.innerHTML = "<tr><td colspan='6'>No entries available.</td></tr>";
        return;
      }

      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        console.log("Document fetched:", data);

        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${data.date?.toDate().toLocaleDateString() || "N/A"}</td>
          <td>${data.type}</td>
          <td>${data.text}</td>
          <td>${data.example}</td>
          <td>${data.difficulty}</td>
          <td>
            <button class="update" onclick="updateEntry('${docSnap.id}')">Update</button>
            <button class="remove" onclick="removeEntry('${docSnap.id}')">Remove</button>
          </td>
        `;
        tableBody.appendChild(row);
      });
    } catch (error) {
      console.error("Error fetching entries:", error.message);
      alert("Failed to fetch entries. Check console for details.");
    }
  }
});

// --------- Remove Entry Logic ---------
window.removeEntry = async (id) => {
  const confirmDelete = confirm("Are you sure you want to remove this entry?");
  if (confirmDelete) {
    try {
      console.log(`Removing document with ID: ${id}`);
      await deleteDoc(doc(db, "dictionaryEntries", id));
      alert("Entry removed successfully!");
      location.reload();
    } catch (error) {
      console.error("Error removing entry:", error.message);
      alert("Failed to remove entry. Check console for details.");
    }
  }
};

// --------- Update Entry Logic ---------
window.updateEntry = (id) => {
  localStorage.setItem("updateId", id); // Store document ID
  window.location.href = "update.html";
};

document.addEventListener("DOMContentLoaded", async () => {
  const form = document.getElementById("updateForm");
  const message = document.getElementById("message");
  const updateId = localStorage.getItem("updateId");

  if (form && updateId) {
    const docRef = doc(db, "dictionaryEntries", updateId);

    try {
      console.log(`Fetching document with ID: ${updateId}`);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log("Document fetched for update:", data);

        // Pre-fill the form with existing data
        document.getElementById("entryText").value = data.text;
        document.getElementById("entryType").value = data.type;
        document.getElementById("entryDefinition").value = data.definition;
        document.getElementById("entryExample").value = data.example;
        document.getElementById("entryDifficulty").value = data.difficulty;
      } else {
        showMessage("Error: Document does not exist.", "red");
      }
    } catch (error) {
      console.error("Error fetching document for update:", error.message);
      showMessage("Error: Could not load entry for update.", "red");
    }

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      try {
        console.log("Updating document...");
        await updateDoc(docRef, {
          type: document.getElementById("entryType").value,
          definition: document.getElementById("entryDefinition").value.trim(),
          example: document.getElementById("entryExample").value.trim(),
          difficulty: parseInt(document.getElementById("entryDifficulty").value),
        });

        showMessage("Entry updated successfully!", "green");
        localStorage.removeItem("updateId");
        setTimeout(() => (window.location.href = "view.html"), 2000);
      } catch (error) {
        console.error("Error updating entry:", error.message);
        showMessage("Error: Could not update entry.", "red");
      }
    });
  }

  function showMessage(msg, color) {
    message.textContent = msg;
    message.style.color = color;
    message.style.display = "block";
    setTimeout(() => (message.style.display = "none"), 3000);
  }
});
