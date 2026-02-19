const loginBtn = document.getElementById("loginBtn");
const loginUsername = document.getElementById("loginUsername");
const loginError = document.getElementById("loginError");

loginBtn.addEventListener("click", () => {
  const username = loginUsername.value.trim();

  if (username === "") {
    loginError.textContent = "الرجاء إدخال اسم المستخدم.";
    return;
  }

  loginError.textContent = "⏳ جاري التحقق...";  // رسالة مؤقتة

  // ⚡ مهلة بسيطة لإعطاء Firebase وقت للاتصال (مهم لبيانات الهاتف)
  setTimeout(() => {

    const ref = db.ref("allowed_users/" + username);

    ref.get().then(snapshot => {

      if (snapshot.exists()) {

        const role = snapshot.val();  // admin أو user

        localStorage.setItem("cc_username", username);
        localStorage.setItem("cc_role", role);

        // توجيه حسب الدور
        if (role === "admin") {
          window.location.href = "admin.html";
        } else {
          window.location.href = "user.html";
        }

      } else {
        loginError.textContent = "❌ المستخدم غير مسجل.";
      }

    }).catch(err => {
      loginError.textContent = "⚠️ خطأ بالشبكة. حاول مرة أخرى.";
      console.error(err);
    });

  }, 600); // ← مهلة 600ms (مناسبة لبيانات Orange و Umniah)
});
