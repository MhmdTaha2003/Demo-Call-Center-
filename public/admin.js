// ===============================
// التحقق من الدخول والأدوار
// ===============================
const username = localStorage.getItem("cc_username");
const role = localStorage.getItem("cc_role");

if (!username || role !== "admin") {
  window.location.href = "index.html";
}

const adminLogout = document.getElementById("adminLogout");
const statsTable = document.getElementById("statsTable");
const downloadExcelBtn = document.getElementById("downloadExcel");

// تسجيل خروج الأدمن
adminLogout.addEventListener("click", () => {
  localStorage.removeItem("cc_username");
  localStorage.removeItem("cc_role");
  window.location.href = "index.html";
});

// ===============================
// زر تنزيل Excel → يعتمد على stats فقط
// ===============================
downloadExcelBtn.addEventListener("click", () => {
  const statsRef = db.ref("stats");
  const allRef = db.ref("admin/all_numbers");

  // 1️⃣ جلب المستخدمين الظاهرين في جدول الإحصائيات
  statsRef.get().then(statsSnapshot => {
    let allowedUsers = [];

    statsSnapshot.forEach(child => {
      allowedUsers.push(child.key); // أسماء المستخدمين الفعلية
    });

    // 2️⃣ بناء ملف Excel
    allRef.get().then(snapshot => {
      if (!snapshot.exists()) {
        alert("لا يوجد بيانات للتنزيل");
        return;
      }

      let data = [];

      snapshot.forEach(child => {
        const number = child.key;
        const val = child.val() || {};

        // فلترة -> نصدّر فقط أرقام المستخدمين الموجودين في stats
        if (!allowedUsers.includes(val.user)) return;

        data.push({
          "الرقم": number,
          "الشبكة": val.prefix || "",
          "المستخدم": val.user || "",
          "الجنس": val.gender || "",
          "الفئة العمرية": val.ageGroup || "",
          "الحالة الاجتماعية": val.socialStatus || "",
          "حالة الاتصال": val.callStatus || "",
          "وقت الإضافة": val.createdAt
            ? new Date(val.createdAt).toLocaleString()
            : ""
        });
      });

      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Numbers");
      XLSX.writeFile(workbook, "call_center_numbers.xlsx");
    });
  });
});

// ===============================
// عرض عدد الأرقام لكل مستخدم (stats)
// ===============================
function listenToStats() {
  const statsRef = db.ref("stats");

  statsRef.on("value", snapshot => {
    statsTable.innerHTML = "";

    snapshot.forEach(child => {
      const user = child.key;
      const count = child.val();

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${user}</td>
        <td>${count}</td>
      `;
      statsTable.appendChild(tr);
    });
  });
}

listenToStats();

// ===============================
// إدارة المستخدمين (allowed_users)
// ===============================
const usersTable = document.getElementById("usersTable");
const addUserBtn = document.getElementById("addUserBtn");
const newUserInput = document.getElementById("newUserInput");

// عرض المستخدمين (باستثناء الأدمن)
function loadUsers() {
  const ref = db.ref("allowed_users");

  ref.on("value", snapshot => {
    usersTable.innerHTML = "";

    snapshot.forEach(child => {
      const user = child.key;
      const role = child.val();

      if (role === "admin") return; // إخفاء الأدمن

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${user}</td>
        <td>
          <button class="secondary-btn" onclick="deleteUser('${user}')">حذف</button>
        </td>
      `;
      usersTable.appendChild(tr);
    });
  });
}

loadUsers();

// إضافة مستخدم
addUserBtn.addEventListener("click", () => {
  const user = newUserInput.value.trim();

  if (user === "") {
    alert("الرجاء إدخال اسم مستخدم.");
    return;
  }

  db.ref("allowed_users/" + user).set("user").then(() => {
    alert("✔ تم إضافة المستخدم");
    newUserInput.value = "";
  });
});

// حذف مستخدم
window.deleteUser = function(user) {
  if (confirm("هل تريد حذف المستخدم " + user + " ؟")) {
    db.ref("allowed_users/" + user).remove().then(() => {
      alert("✔ تم حذف المستخدم");
    });
  }
};
