// Local Storage Management for Recommendations
const RECOMMENDATIONS_STORAGE_KEY = 'portfolio_recommendations';

function loadRecommendationsFromStorage() {
  const stored = localStorage.getItem(RECOMMENDATIONS_STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

function saveRecommendationsToStorage(recommendations) {
  localStorage.setItem(RECOMMENDATIONS_STORAGE_KEY, JSON.stringify(recommendations));
}

function displayRecommendation(recommendation) {
  var element = document.createElement("div");
  element.setAttribute("class", "recommendation");
  var nameHTML = recommendation.name ? "<div class='recommendation-author'>— " + recommendation.name + "</div>" : "";
  element.innerHTML = "<span>&#8220;</span>" + recommendation.message + "<span>&#8221;</span>" + nameHTML;
  document.getElementById("all_recommendations").appendChild(element);
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function clearErrorMessages() {
  document.getElementById("message-error").textContent = "";
  document.getElementById("new_recommendation").classList.remove("input-error");
}

function validateForm() {
  clearErrorMessages();
  let isValid = true;
  
  const message = document.getElementById("new_recommendation").value.trim();
  
  if (message === "") {
    document.getElementById("message-error").textContent = "Message is required";
    document.getElementById("new_recommendation").classList.add("input-error");
    isValid = false;
  }
  
  return isValid;
}

// Navigation functionality
document.addEventListener('DOMContentLoaded', function () {
  // Load and display saved recommendations from storage
  const savedRecommendations = loadRecommendationsFromStorage();
  savedRecommendations.forEach(rec => {
    displayRecommendation(rec);
  });

  // Clear error messages on input
  document.getElementById("new_recommendation").addEventListener("input", function() {
    this.classList.remove("input-error");
    document.getElementById("message-error").textContent = "";
  });

  // Get all navigation links
  const navLinks = document.querySelectorAll('.topmenu');

  // Function to update active navigation link
  function updateActiveNav() {
    const sections = document.querySelectorAll('section[id]');
    const scrollPos = window.scrollY + 100; // Offset for fixed nav

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');

      if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
        // Remove active class from all links
        navLinks.forEach(link => link.classList.remove('active'));

        // Add active class to current section link
        const activeLink = document.querySelector(`.topmenu[href="#${sectionId}"]`);
        if (activeLink) {
          activeLink.classList.add('active');
        }
      }
    });
  }

  // Update active nav on scroll
  window.addEventListener('scroll', updateActiveNav);

  // Set initial active state
  updateActiveNav();

  // Smooth scrolling for navigation links
  navLinks.forEach(link => {
    link.addEventListener('click', function (e) {
      const href = this.getAttribute('href');

      // Only handle internal links
      if (href.startsWith('#')) {
        e.preventDefault();
        const targetId = href.substring(1);
        const targetSection = document.getElementById(targetId);

        if (targetSection) {
          const offsetTop = targetSection.offsetTop - 80; // Account for fixed nav
          window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
          });
        }
      }
    });
  });
});

function addRecommendation() {
  if (!validateForm()) {
    return;
  }
  
  const name = document.getElementById("name").value.trim();
  const message = document.getElementById("new_recommendation").value.trim();
  
  const recommendationObj = {
    name: name,
    message: message,
    timestamp: new Date().toISOString()
  };
  
  console.log("New recommendation added");
  showPopup(true);
  
  // Display the recommendation
  displayRecommendation(recommendationObj);
  
  // Save to local storage
  const savedRecommendations = loadRecommendationsFromStorage();
  savedRecommendations.push(recommendationObj);
  saveRecommendationsToStorage(savedRecommendations);
  
  // Reset form
  document.getElementById("name").value = "";
  document.getElementById("new_recommendation").value = "";
  clearErrorMessages();
}

function showPopup(bool) {
  if (bool) {
    document.getElementById('popup').style.visibility = 'visible'
  } else {
    document.getElementById('popup').style.visibility = 'hidden'
  }
}
