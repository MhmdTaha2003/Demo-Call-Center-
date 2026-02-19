// ===============================
// التحقق من تسجيل الدخول والأدوار
// ===============================
const username = localStorage.getItem("cc_username");
const role = localStorage.getItem("cc_role");

if (!username || role !== "user") {
  window.location.href = "index.html";
}

// التحقق بأن المستخدم مسجل داخل allowed_users
db.ref("allowed_users/" + username).get().then(snap => {
  if (!snap.exists()) {
    localStorage.removeItem("cc_username");
    localStorage.removeItem("cc_role");
    window.location.href = "index.html";
  }
});

document.getElementById("welcomeUser").textContent = "أهلاً يا " + username;


// ===============================
// عناصر الواجهة
// ===============================
const prefixSelect = document.getElementById("prefixSelect");
const genderSelect = document.getElementById("genderSelect");
const ageGroupSelect = document.getElementById("ageGroupSelect");
const statusSelect = document.getElementById("statusSelect");
const callStatusSelect = document.getElementById("callStatusSelect");

const generateBtn = document.getElementById("generateBtn");
const saveBtn = document.getElementById("saveBtn");
const callBtn = document.getElementById("callBtn");
const generatedNumberBox = document.getElementById("generatedNumber");
const backToLogin = document.getElementById("backToLogin");

let currentGeneratedNumber = localStorage.getItem("last_generated_number") || null;


// ===============================
// توليد رقم
// ===============================
function generateRandomNumber(prefix) {
  const random7 = Math.floor(1000000 + Math.random() * 9000000);
  return prefix + random7;
}

generateBtn.addEventListener("click", () => {

  const prefix = prefixSelect.value;
  currentGeneratedNumber = generateRandomNumber(prefix);

  generatedNumberBox.style.display = "block";
  generatedNumberBox.textContent = currentGeneratedNumber;

  // حفظ آخر رقم
  localStorage.setItem("last_generated_number", currentGeneratedNumber);
});


// ===============================
// حفظ البيانات في Firebase
// ===============================
saveBtn.addEventListener("click", () => {

  if (!currentGeneratedNumber) {
    alert("يجب توليد رقم أولاً.");
    return;
  }

  const prefix = prefixSelect.value;
  const gender = genderSelect.value;
  const ageGroup = ageGroupSelect.value;
  const socialStatus = statusSelect.value;
  const callStatus = callStatusSelect.value;

  const number = currentGeneratedNumber;

  // التأكد أن الرقم غير موجود سابقاً
  db.ref("admin/all_numbers/" + number).get().then(snapshot => {
    if (snapshot.exists()) {
      alert("الرقم مستخدم مسبقاً. يرجى توليد رقم جديد.");
      return;
    }

    const numberData = {
      number,
      prefix,
      user: username,
      gender,
      ageGroup,
      socialStatus,
      callStatus,
      createdAt: Date.now()
    };

    const updates = {};
    updates[`users/${username}/numbers/${number}`] = numberData;
    updates[`admin/all_numbers/${number}`] = numberData;

    // تحديث البيانات في قاعدة البيانات
    db.ref().update(updates).then(() => {

      // ===============================
      // 🔥 تحديث عدد الأرقام للمستخدم (status)
      // ===============================
      const userNumbersRef = db.ref("users/" + username + "/numbers");

      userNumbersRef.get().then(snap => {
        const realCount = snap.exists() ? snap.numChildren() : 0;
        db.ref("stats/" + username).set(realCount);
      });

      alert("✔️ تم حفظ البيانات بنجاح");
    });

  });
});


// ===============================
// زر الاتصال المباشر
// ===============================
callBtn.addEventListener("click", () => {

  const lastNumber = currentGeneratedNumber || localStorage.getItem("last_generated_number");

  if (!lastNumber) {
    alert("لا يوجد رقم للاتصال به!");
    return;
  }

  const cleanNumber = lastNumber.replace(/\D/g, "");

  window.location.href = "tel:" + cleanNumber;
});


// ===============================
// تسجيل خروج
// ===============================
backToLogin.addEventListener("click", () => {
  localStorage.removeItem("cc_username");
  localStorage.removeItem("cc_role");
  localStorage.removeItem("last_generated_number");

  window.location.href = "index.html"; 
});
