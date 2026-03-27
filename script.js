// =============================================
// Firebase Initialization
// Config is loaded from firebase-config.js (gitignored)
// See firebase-config.example.js for the required format
// =============================================
if (!window.firebaseConfig) {
  throw new Error(
    "Firebase config not found. Copy firebase-config.example.js to firebase-config.js and fill in your values.",
  );
}

// Initialize Firebase
firebase.initializeApp(window.firebaseConfig);
const db = firebase.firestore();

// =============================================
// Recommendation Display
// =============================================

function displayRecommendation(recommendation) {
  var element = document.createElement("div");
  // 'dynamic' class lets us identify and clear Firestore-loaded cards on re-render
  element.setAttribute("class", "recommendation dynamic");

  var nameHTML = recommendation.name
    ? "<div class='recommendation-author'>— " + recommendation.name + "</div>"
    : "";

  element.innerHTML =
    "<span>&#8220;</span>" +
    recommendation.message +
    "<span>&#8221;</span>" +
    nameHTML;

  document.getElementById("all_recommendations").appendChild(element);
}

function clearDynamicRecommendations() {
  document.querySelectorAll(".recommendation.dynamic").forEach(function (el) {
    el.remove();
  });
}

// =============================================
// Form Validation
// =============================================

function clearErrorMessages() {
  document.getElementById("message-error").textContent = "";
  document.getElementById("new_recommendation").classList.remove("input-error");
}

function validateForm() {
  clearErrorMessages();
  let isValid = true;

  const message = document.getElementById("new_recommendation").value.trim();

  if (message === "") {
    document.getElementById("message-error").textContent =
      "Message is required";
    document.getElementById("new_recommendation").classList.add("input-error");
    isValid = false;
  } else if (message.length > 1000) {
    document.getElementById("message-error").textContent =
      "Message must be under 1000 characters";
    document.getElementById("new_recommendation").classList.add("input-error");
    isValid = false;
  }

  return isValid;
}

// =============================================
// Add Recommendation → Firestore
// =============================================

async function addRecommendation() {
  if (!validateForm()) return;

  const name = document.getElementById("name").value.trim();
  const message = document.getElementById("new_recommendation").value.trim();
  const submitBtn = document.getElementById("recommend_btn");

  const recommendationObj = {
    name: name,
    message: message,
    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
  };

  // Disable button to prevent double submissions
  submitBtn.disabled = true;
  submitBtn.textContent = "Saving...";

  try {
    await db.collection("recommendations").add(recommendationObj);

    // Reset form
    document.getElementById("name").value = "";
    document.getElementById("new_recommendation").value = "";
    clearErrorMessages();

    showPopup(true);
  } catch (error) {
    console.error("Error saving recommendation:", error);
    document.getElementById("message-error").textContent =
      "Failed to save. Please try again.";
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Submit";
  }
}

// =============================================
// Popup
// =============================================

function showPopup(bool) {
  document.getElementById("popup").style.visibility = bool
    ? "visible"
    : "hidden";
}

// =============================================
// DOMContentLoaded — Boot everything
// =============================================

document.addEventListener("DOMContentLoaded", function () {
  // --- Load recommendations from Firestore in real-time ---
  db.collection("recommendations")
    .orderBy("timestamp", "asc")
    .onSnapshot(
      function (snapshot) {
        // Clear previously rendered Firestore cards and re-render all
        clearDynamicRecommendations();
        snapshot.forEach(function (doc) {
          displayRecommendation(doc.data());
        });
      },
      function (error) {
        console.error("Error loading recommendations:", error);
      },
    );

  // --- Clear error on input ---
  document
    .getElementById("new_recommendation")
    .addEventListener("input", function () {
      this.classList.remove("input-error");
      document.getElementById("message-error").textContent = "";
    });

  // --- Navigation: active link on scroll ---
  const navLinks = document.querySelectorAll(".topmenu");

  function updateActiveNav() {
    const sections = document.querySelectorAll("section[id]");
    const scrollPos = window.scrollY + 100;

    sections.forEach(function (section) {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute("id");

      if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
        navLinks.forEach(function (link) {
          link.classList.remove("active");
        });

        const activeLink = document.querySelector(
          '.topmenu[href="#' + sectionId + '"]',
        );
        if (activeLink) {
          activeLink.classList.add("active");
        }
      }
    });
  }

  window.addEventListener("scroll", updateActiveNav);
  updateActiveNav();

  // --- Smooth scrolling ---
  navLinks.forEach(function (link) {
    link.addEventListener("click", function (e) {
      const href = this.getAttribute("href");

      if (href.startsWith("#")) {
        e.preventDefault();
        const targetId = href.substring(1);
        const targetSection = document.getElementById(targetId);

        if (targetSection) {
          const offsetTop = targetSection.offsetTop - 80;
          window.scrollTo({
            top: offsetTop,
            behavior: "smooth",
          });
        }
      }
    });
  });
});
