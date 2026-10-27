import {filterSkillsByCategory,calculateTotalCost, matchSkillsToUser} from "./skillswap-functions.js";

let skillList = [];

async function displaySkills(container, skillArray) {
        container.innerHTML = "";

        skillArray.forEach((skill) => {
        container.insertAdjacentHTML("beforeend",
            `<article class="skill-card" tabindex="0">
                    <button class="skill-card-collapse" type="button" aria-label="Hide offering">&minus;</button>
                    <div class="skill-card-content" id="${skill.provider}-${skill.title}">
                        <h3>${skill.title}</h3>
                        <p class="skill-card-details"><strong>Category:</strong> ${skill.category}</p>
                        <p class="skill-card-details"><strong>Price:</strong> $${skill.price}</p>
                        <p class="skill-card-extra"><strong>Provider:</strong> ${skill.provider}</p>
                        <p class="skill-card-extra">${skill.description}</p>
                    </div>
                </article>`);
        });
    }

//#region Filter Skills Code
let skillCardContainer = document.getElementById("offerings-grid");

async function OnLoad() {
    await loadSkills();
    let shortenedSkillList =skillList.slice(0,8);
    displaySkills(skillCardContainer, shortenedSkillList);
}

OnLoad();
let filterSearch = document.getElementById("filter-search");
document.getElementById("filter-button").addEventListener("click", () => {
    loadSkills();
    let filteredList = filterSkillsByCategory(skillList,filterSearch.value);
    displaySkills(skillCardContainer, filteredList);
});
document.getElementById("reset-filter-button").addEventListener("click", () => {
    filterSearch.value = "";
    loadSkills();
    let unfilteredList = filterSkillsByCategory(skillList,'all');
    displaySkills(skillCardContainer, unfilteredList);
});
//#endregion

//#region Highlight on hover code
document.querySelectorAll(".skill-card").forEach((card) => {
    const content = card.querySelector(".skill-card-content");
    const collapseButton = card.querySelector(".skill-card-collapse");
    if (!content || !collapseButton) {
        return;
    }

    card.addEventListener("pointerenter", () => {
        setCardExpanded(card, true);
    });

    card.addEventListener("pointerleave", () => {
        setCardExpanded(card, false);
    });

    card.addEventListener("focusin", () => {
        setCardExpanded(card, true);
    });

    card.addEventListener("focusout", (event) => {
        if (!card.contains(event.relatedTarget)) {
            setCardExpanded(card, false);
        }
    });

    collapseButton.addEventListener("click", () => {
        toggleCardCollapsed(card);
        setCardExpanded(card, false);
    });
});

const setCardExpanded = (card, expanded) => {
    card.classList.toggle("is-expanded", expanded);
};

const toggleCardCollapsed = (card) => {
    card.classList.toggle("is-collapsed");
};
//#endregion

//#region Cost Calculator Code
let result = document.getElementById("cost-calculator-result");

document.getElementById("calculate-cost-button").addEventListener("click",() => {
    let rate = document.getElementById("hourly-rate").value;
    let hours = document.getElementById("session-hours").value;
    if(rate == null || hours == null) return;

    result.value = "$" + calculateTotalCost(rate,hours);
})    
//#endregion

//#region MatchUserToSkills
let matchListContainer = document.getElementById("match-results-content");

document.getElementById("match-results-button").addEventListener("click",() => {
    let userNeeds = {
        category: document.getElementById("match-category").value,
        price: document.getElementById("match-max-price").value
    };
    if(userNeeds.category == null || userNeeds.price == null) return;

    loadSkills();
    let filteredList = matchSkillsToUser(userNeeds,skillList);
    displaySkills(matchListContainer, filteredList);
})    
//#endregion

async function loadSkills() {
    try {
        skillList = await window.apiService.fetchSkills();
    }
    catch(error) {
        console.error("Failed to load skills: ", error);
        alert("Failed to load skills. Please make sure the server is running.")
    }
}