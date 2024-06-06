fetch("../data/team.json")
  .then((response) => response.json())
  .then((data) => {
    const profilesContainer1 = document.getElementById("profiles-container");
    const profilesContainer2 = document.getElementById("profiles-container2");
    const profilesContainer3 = document.getElementById("profiles-container3");

    const createProfileDiv = (member) => `
      <div class="team-content">
        <img src="${member.image}" class="profession_image" alt="${member.name}" />
        <img src="${member.image}" class="profile_image" alt="${member.name}" />
        <div class="profile_detail">
          <span>${member.name}</span>
          <p>${member.role}</p>
        </div>
        <div class="wrapper">
          <div class="profile_quote">
            <p>${member.quote}</p>
          </div>
        </div>
      </div>
    `;

    profilesContainer1.innerHTML = data.team1.map(createProfileDiv).join("");
    profilesContainer2.innerHTML = data.team2.map(createProfileDiv).join("");
    profilesContainer3.innerHTML = data.team3.map(createProfileDiv).join("");
  })
  .catch((error) => console.error("Error loading profiles:", error));
