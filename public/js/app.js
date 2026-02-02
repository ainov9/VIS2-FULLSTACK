// Array to store all students data
let students = [];

// Total number of students
let total = 0;

// Counter of entered students
let count = 0;

// Chart instance
let chartInstance = null;

/**
 * Generate random student ID
 * Format: STU-XXXXXX
 */
function generateStudentId() {
  const randomNum = Math.floor(Math.random() * 900000) + 100000;
  return `STU-${randomNum}`;
}

/**
 * Called when teacher clicks Start
 */
function start() {
  total = Number(document.getElementById("totalStudents").value);
  
  if (total < 1 || total > 100) {
    alert("Please enter a number between 1 and 100");
    return;
  }
  
  students = [];
  count = 0;
  
  document.getElementById("resultsSection").style.display = "none";
  document.getElementById("tableBody").innerHTML = "";
  
  showForm();
}

/**
 * Displays the form for each student
 */
function showForm() {
  if (count >= total) {
    document.getElementById("formArea").innerHTML = "<p class='completion-message'>✅ All students entered! Review results below.</p>";
    document.getElementById("resultsSection").style.display = "block";
    drawChart();
    return;
  }

  const studentId = generateStudentId();
  
  document.getElementById("formArea").innerHTML = `
    <div class="student-form">
      <h3>Student ${count + 1} of ${total}</h3>
      <div class="form-row">
        <div class="form-group">
          <label>Student ID:</label>
          <input id="studentId" value="${studentId}" readonly class="readonly-input">
        </div>
        <div class="form-group">
          <label>Name: <span class="required">*</span></label>
          <input id="name" placeholder="Enter full name" autocomplete="off">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Average Grade: <span class="required">*</span></label>
          <input id="avg" type="number" step="0.01" min="0" max="20" placeholder="0.00 - 20.00">
        </div>
        <div class="form-group">
          <label>Subject (Optional):</label>
          <input id="subject" placeholder="e.g., Mathematics">
        </div>
      </div>
      <div class="form-actions">
        <button onclick="addStudent()" class="btn btn-primary">➕ Add Student</button>
        <button onclick="skipStudent()" class="btn btn-secondary">⏭️ Skip</button>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${(count / total) * 100}%"></div>
      </div>
      <p class="progress-text">${count} / ${total} students entered</p>
    </div>
  `;
  
  // Focus on name input
  document.getElementById("name").focus();
  
  // Add Enter key listener
  document.getElementById("avg").addEventListener("keypress", function(e) {
    if (e.key === "Enter") {
      addStudent();
    }
  });
}

/**
 * Returns validation status based on average
 */
function getStatus(avg) {
  if (avg >= 10) return "Validé";
  if (avg >= 8) return "Ratt";
  return "NV";
}

/**
 * Get status color
 */
function getStatusColor(status) {
  switch(status) {
    case "Validé": return "#28a745";
    case "Ratt": return "#ffc107";
    case "NV": return "#dc3545";
    default: return "#6c757d";
  }
}

/**
 * Adds one student
 */
function addStudent() {
  const studentId = document.getElementById("studentId").value;
  const name = document.getElementById("name").value.trim();
  const avg = parseFloat(document.getElementById("avg").value);
  const subject = document.getElementById("subject").value.trim() || "General";

  // Validation
  if (!name) {
    alert("Please enter student name");
    document.getElementById("name").focus();
    return;
  }
  
  if (isNaN(avg) || avg < 0 || avg > 20) {
    alert("Please enter a valid average between 0 and 20");
    document.getElementById("avg").focus();
    return;
  }

  const status = getStatus(avg);
  const student = {
    id: studentId,
    name: name,
    avg: avg.toFixed(2),
    subject: subject,
    status: status,
    timestamp: new Date().toISOString()
  };
  
  students.push(student);

  // Update table
  addRowToTable(student);

  // Update statistics
  updateStats();

  count++;
  showForm();
}

/**
 * Skip current student
 */
function skipStudent() {
  if (confirm("Are you sure you want to skip this student?")) {
    count++;
    showForm();
  }
}

/**
 * Add row to table
 */
function addRowToTable(student) {
  const tableBody = document.getElementById("tableBody");
  const statusColor = getStatusColor(student.status);
  
  const row = `
    <tr data-id="${student.id}">
      <td>${student.id}</td>
      <td>${sanitizeHTML(student.name)}</td>
      <td>${student.avg}</td>
      <td><span class="status-badge" style="background: ${statusColor}">${student.status}</span></td>
      <td>
        <button onclick="editStudent('${student.id}')" class="btn-action btn-edit" title="Edit">✏️</button>
        <button onclick="deleteStudent('${student.id}')" class="btn-action btn-delete" title="Delete">🗑️</button>
      </td>
    </tr>
  `;
  
  tableBody.insertAdjacentHTML('beforeend', row);
}

/**
 * Sanitize HTML to prevent XSS
 */
function sanitizeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/**
 * Edit student
 */
function editStudent(studentId) {
  const student = students.find(s => s.id === studentId);
  if (!student) return;
  
  const newName = prompt("Edit student name:", student.name);
  if (newName && newName.trim()) {
    student.name = newName.trim();
  }
  
  const newAvg = prompt("Edit average (0-20):", student.avg);
  if (newAvg && !isNaN(newAvg) && newAvg >= 0 && newAvg <= 20) {
    student.avg = parseFloat(newAvg).toFixed(2);
    student.status = getStatus(parseFloat(newAvg));
  }
  
  // Rebuild table
  rebuildTable();
  updateStats();
  if (chartInstance) drawChart();
}

/**
 * Delete student
 */
function deleteStudent(studentId) {
  if (!confirm("Are you sure you want to delete this student?")) return;
  
  students = students.filter(s => s.id !== studentId);
  document.querySelector(`tr[data-id="${studentId}"]`).remove();
  
  total--;
  updateStats();
  if (chartInstance) drawChart();
}

/**
 * Rebuild entire table
 */
function rebuildTable() {
  const tableBody = document.getElementById("tableBody");
  tableBody.innerHTML = "";
  students.forEach(student => addRowToTable(student));
}

/**
 * Filter/search table
 */
function filterTable() {
  const searchTerm = document.getElementById("searchTable").value.toLowerCase();
  const rows = document.querySelectorAll("#tableBody tr");
  
  rows.forEach(row => {
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(searchTerm) ? "" : "none";
  });
}

/**
 * Sort table
 */
function sortTable(type) {
  if (type === 'name') {
    students.sort((a, b) => a.name.localeCompare(b.name));
  } else if (type === 'avg') {
    students.sort((a, b) => parseFloat(b.avg) - parseFloat(a.avg));
  }
  rebuildTable();
}

/**
 * Draws chart using Chart.js
 */
function drawChart() {
  const counts = { "Validé": 0, "Ratt": 0, "NV": 0 };
  students.forEach(s => counts[s.status]++);

  const ctx = document.getElementById("chart");
  
  if (chartInstance) {
    chartInstance.destroy();
  }

  chartInstance = new Chart(ctx, {
    type: "pie",
    data: {
      labels: ["Validé", "Ratt", "NV"],
      datasets: [{
        data: [counts["Validé"], counts["Ratt"], counts["NV"]],
        backgroundColor: ["#28a745", "#ffc107", "#dc3545"],
        borderWidth: 2,
        borderColor: "#fff"
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            font: { size: 14 },
            padding: 15
          }
        },
        title: {
          display: true,
          text: 'Student Status Distribution',
          font: { size: 16, weight: 'bold' }
        }
      }
    }
  });
}

/**
 * Updates the statistics box
 */
function updateStats() {
  const totalCount = students.length;
  const validCount = students.filter(s => s.status === "Validé").length;
  const rattCount = students.filter(s => s.status === "Ratt").length;
  const nvCount = students.filter(s => s.status === "NV").length;
  const successRate = totalCount > 0 ? ((validCount / totalCount) * 100).toFixed(1) : 0;

  document.getElementById("totalCount").textContent = totalCount;
  document.getElementById("validCount").textContent = validCount;
  document.getElementById("rattCount").textContent = rattCount;
  document.getElementById("nvCount").textContent = nvCount;
  document.getElementById("successRate").textContent = successRate + "%";
}

/**
 * Save session to database
 */
async function saveSessionToDB() {
  if (students.length === 0) {
    alert("No students to save!");
    return;
  }
  
  const sessionName = document.getElementById("sessionName").value || `Session ${new Date().toLocaleString()}`;
  
  try {
    const formData = new FormData();
    formData.append('action', 'save_session');
    formData.append('session_name', sessionName);
    formData.append('students_data', JSON.stringify(students));
    
    const response = await fetch('index.php', {
      method: 'POST',
      body: formData
    });
    
    const result = await response.json();
    
    if (result.success) {
      alert(`✅ Session saved successfully to database!\nSession ID: ${result.session_id}`);
    } else {
      alert("❌ Error saving session to database");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("❌ Error saving session to database");
  }
}

/**
 * Export to Excel (CSV format)
 */
function exportToExcel() {
  if (students.length === 0) {
    alert("No data to export!");
    return;
  }
  
  let csv = "Student ID,Name,Average,Status,Subject,Timestamp\n";
  
  students.forEach(s => {
    csv += `${s.id},"${s.name}",${s.avg},${s.status},"${s.subject}","${s.timestamp}"\n`;
  });
  
  downloadFile(csv, "students_results.csv", "text/csv");
}

/**
 * Export to JSON
 */
function exportToJSON() {
  if (students.length === 0) {
    alert("No data to export!");
    return;
  }
  
  const data = {
    session_name: document.getElementById("sessionName").value || "Unnamed Session",
    date: new Date().toISOString(),
    total_students: students.length,
    statistics: {
      valide: students.filter(s => s.status === "Validé").length,
      ratt: students.filter(s => s.status === "Ratt").length,
      nv: students.filter(s => s.status === "NV").length
    },
    students: students
  };
  
  const json = JSON.stringify(data, null, 2);
  downloadFile(json, "students_session.json", "application/json");
}

/**
 * Download file helper
 */
function downloadFile(content, filename, contentType) {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Print results
 */
function printResults() {
  window.print();
}

/**
 * Reset session
 */
function resetSession() {
  if (!confirm("Are you sure you want to reset the entire session? This cannot be undone.")) {
    return;
  }
  
  students = [];
  count = 0;
  total = 0;
  
  document.getElementById("tableBody").innerHTML = "";
  document.getElementById("formArea").innerHTML = "";
  document.getElementById("resultsSection").style.display = "none";
  document.getElementById("totalStudents").value = "20";
  document.getElementById("sessionName").value = "";
  
  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }
  
  updateStats();
}

// Initialize on page load
window.addEventListener('DOMContentLoaded', function() {
  console.log("Student Validation System - PHP + MySQL Version loaded");
  updateStats();
});
