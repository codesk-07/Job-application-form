// ========================================
// API
// ========================================

const API_URL = "https://jsonplaceholder.typicode.com/posts";


// ========================================
// DOM ELEMENTS
// ========================================

const applicationForm =
    document.getElementById("applicationForm");

const companyInput =
    document.getElementById("company");

const positionInput =
    document.getElementById("position");

const locationInput =
    document.getElementById("location");

const statusInput =
    document.getElementById("status");

const dateInput =
    document.getElementById("date");

const submitButton =
    document.getElementById("submitButton");

const cancelButton =
    document.getElementById("cancelButton");

const formTitle =
    document.getElementById("formTitle");

const searchInput =
    document.getElementById("searchInput");

const statusFilter =
    document.getElementById("statusFilter");

const applicationContainer =
    document.getElementById("applicationContainer");

const loading =
    document.getElementById("loading");

const errorMessage =
    document.getElementById("errorMessage");

const totalCount =
    document.getElementById("totalCount");

const appliedCount =
    document.getElementById("appliedCount");

const interviewCount =
    document.getElementById("interviewCount");

const selectedCount =
    document.getElementById("selectedCount");

const scrollInfo =
    document.getElementById("scrollInfo");


// ========================================
// APPLICATION STATE
// ========================================

let applications = [];

let editingId = null;


// ========================================
// LOCAL STORAGE
// ========================================

function saveToLocalStorage() {

    localStorage.setItem(
        "jobApplications",
        JSON.stringify(applications)
    );
}


function loadFromLocalStorage() {

    const storedData =
        localStorage.getItem("jobApplications");

    if (storedData) {

        applications = JSON.parse(storedData);

        return true;
    }

    return false;
}


// ========================================
// GET
// ========================================

async function getApplications() {

    try {

        showLoading();

        clearError();


        /*
            First check localStorage.

            This allows our CRUD changes to
            remain after refreshing the page.
        */

        const hasLocalData =
            loadFromLocalStorage();


        if (hasLocalData) {

            displayApplications(applications);

            updateStatistics();

            hideLoading();

            return;
        }


        /*
            REST API GET request
        */

        const response =
            await fetch(API_URL);


        if (!response.ok) {

            throw new Error(
                "Failed to fetch applications"
            );
        }


        const data =
            await response.json();


        /*
            JSONPlaceholder gives us
            generic data.

            We convert it into our
            application structure.
        */

        applications = data
            .slice(0, 8)
            .map((item, index) => {

                return {

                    id: item.id,

                    company:
                        item.title
                            .split(" ")
                            .slice(0, 2)
                            .join(" "),

                    position:
                        "Software Developer",

                    location:
                        index % 2 === 0
                            ? "Bangalore"
                            : "Hyderabad",

                    status:
                        ["Applied",
                         "Interview",
                         "Selected",
                         "Rejected"][index % 4],

                    date:
                        "2026-09-" +
                        String(index + 1).padStart(2, "0")
                };
            });


        saveToLocalStorage();


        displayApplications(applications);

        updateStatistics();


    } catch (error) {

        showError(error.message);

    } finally {

        hideLoading();
    }
}


// ========================================
// POST
// ========================================

async function addApplication(application) {

    try {

        showLoading();

        clearError();


        const response =
            await fetch(API_URL, {

                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body:
                    JSON.stringify(application)
            });


        if (!response.ok) {

            throw new Error(
                "Failed to add application"
            );
        }


        const data =
            await response.json();


        /*
            JSONPlaceholder returns
            an id for the new object.

            We use that id.
        */

        const newApplication = {

            ...application,

            id: data.id
        };


        applications.push(newApplication);


        saveToLocalStorage();


        displayApplications(applications);

        updateStatistics();


        applicationForm.reset();


        alert(
            "Application added successfully!"
        );


    } catch (error) {

        showError(error.message);

    } finally {

        hideLoading();
    }
}


// ========================================
// PUT
// ========================================

async function updateApplication(
    id,
    updatedApplication
) {

    try {

        showLoading();

        clearError();


        const response =
            await fetch(`${API_URL}/${id}`, {

                method: "PUT",

                headers: {

                    "Content-Type":
                        "application/json"
                },

                body:
                    JSON.stringify(updatedApplication)
            });


        if (!response.ok) {

            throw new Error(
                "Failed to update application"
            );
        }


        const data =
            await response.json();


        /*
            Find application index
        */

        const index =
            applications.findIndex(
                application =>
                    application.id === id
            );


        if (index !== -1) {

            applications[index] = {

                ...applications[index],

                ...updatedApplication,

                id: data.id || id
            };
        }


        saveToLocalStorage();


        displayApplications(applications);

        updateStatistics();


        resetForm();


        alert(
            "Application updated successfully!"
        );


    } catch (error) {

        showError(error.message);

    } finally {

        hideLoading();
    }
}


// ========================================
// DELETE
// ========================================

async function deleteApplication(id) {

    const confirmDelete =
        confirm(
            "Are you sure you want to delete this application?"
        );


    if (!confirmDelete) {
        return;
    }


    try {

        showLoading();

        clearError();


        const response =
            await fetch(`${API_URL}/${id}`, {

                method: "DELETE"
            });


        if (!response.ok) {

            throw new Error(
                "Failed to delete application"
            );
        }


        /*
            Remove from local array
        */

        applications =
            applications.filter(
                application =>
                    application.id !== id
            );


        saveToLocalStorage();


        displayApplications(applications);

        updateStatistics();


    } catch (error) {

        showError(error.message);

    } finally {

        hideLoading();
    }
}


// ========================================
// DISPLAY APPLICATIONS
// ========================================

function displayApplications(data) {

    applicationContainer.innerHTML = "";


    if (data.length === 0) {

        applicationContainer.innerHTML = `
            <div class="empty">
                No applications found.
            </div>
        `;

        return;
    }


    data.forEach(application => {

        const card =
            document.createElement("div");


        card.className =
            "application-card";


        card.dataset.id =
            application.id;


        card.innerHTML = `

            <h3>
                ${escapeHTML(application.company)}
            </h3>

            <p>
                <strong>Position:</strong>
                ${escapeHTML(application.position)}
            </p>

            <p>
                <strong>Location:</strong>
                ${escapeHTML(application.location)}
            </p>

            <p>
                <strong>Date:</strong>
                ${escapeHTML(application.date)}
            </p>

            <span class="status">
                ${escapeHTML(application.status)}
            </span>

            <div class="card-buttons">

                <button
                    class="edit-btn"
                    data-action="edit"
                    data-id="${application.id}"
                >
                    Edit
                </button>

                <button
                    class="delete-btn"
                    data-action="delete"
                    data-id="${application.id}"
                >
                    Delete
                </button>

            </div>
        `;


        applicationContainer.appendChild(card);
    });
}


// ========================================
// EVENT DELEGATION
// ========================================

applicationContainer.addEventListener(
    "click",
    function (event) {

        const button =
            event.target.closest("button");


        if (!button) {
            return;
        }


        const id =
            Number(button.dataset.id);


        const action =
            button.dataset.action;


        if (action === "edit") {

            startEdit(id);
        }


        if (action === "delete") {

            deleteApplication(id);
        }
    }
);


// ========================================
// START EDIT
// ========================================

function startEdit(id) {

    const application =
        applications.find(
            application =>
                application.id === id
        );


    if (!application) {
        return;
    }


    editingId = id;


    companyInput.value =
        application.company;

    positionInput.value =
        application.position;

    locationInput.value =
        application.location;

    statusInput.value =
        application.status;

    dateInput.value =
        application.date;


    formTitle.textContent =
        "Update Job Application";


    submitButton.textContent =
        "Update Application";


    cancelButton.hidden =
        false;


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


// ========================================
// FORM SUBMIT
// ========================================

applicationForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();


        const application = {

            company:
                companyInput.value.trim(),

            position:
                positionInput.value.trim(),

            location:
                locationInput.value.trim(),

            status:
                statusInput.value,

            date:
                dateInput.value
        };


        /*
            If editingId exists,
            perform PUT.

            Otherwise perform POST.
        */

        if (editingId !== null) {

            updateApplication(
                editingId,
                application
            );

        } else {

            addApplication(application);
        }
    }
);


// ========================================
// CANCEL EDIT
// ========================================

cancelButton.addEventListener(
    "click",
    resetForm
);


function resetForm() {

    editingId = null;


    applicationForm.reset();


    formTitle.textContent =
        "Add Job Application";


    submitButton.textContent =
        "Add Application";


    cancelButton.hidden =
        true;
}


// ========================================
// SEARCH + FILTER
// ========================================

function filterApplications() {

    const searchText =
        searchInput.value
            .toLowerCase()
            .trim();


    const selectedStatus =
        statusFilter.value;


    const result =
        applications.filter(application => {

            const company =
                application.company
                    .toLowerCase();

            const position =
                application.position
                    .toLowerCase();

            const location =
                application.location
                    .toLowerCase();


            const matchesSearch =
                company.includes(searchText) ||
                position.includes(searchText) ||
                location.includes(searchText);


            const matchesStatus =
                selectedStatus === "all" ||
                application.status === selectedStatus;


            return (
                matchesSearch &&
                matchesStatus
            );
        });


    displayApplications(result);
}


// ========================================
// DEBOUNCE
// ========================================

function debounce(callback, delay) {

    let timer;


    return function (...args) {

        clearTimeout(timer);


        timer =
            setTimeout(() => {

                callback(...args);

            }, delay);
    };
}


const debouncedSearch =
    debounce(
        filterApplications,
        400
    );


searchInput.addEventListener(
    "input",
    debouncedSearch
);


// ========================================
// STATUS FILTER
// ========================================

statusFilter.addEventListener(
    "change",
    filterApplications
);


// ========================================
// THROTTLE
// ========================================

function throttle(callback, delay) {

    let lastTime = 0;


    return function (...args) {

        const currentTime =
            Date.now();


        if (
            currentTime - lastTime >=
            delay
        ) {

            callback(...args);


            lastTime =
                currentTime;
        }
    };
}


const handleScroll =
    throttle(
        function () {

            scrollInfo.textContent =
                `Scroll position: ${Math.round(window.scrollY)}px`;

        },
        300
    );


window.addEventListener(
    "scroll",
    handleScroll
);


// ========================================
// STATISTICS
// ========================================

function updateStatistics() {

    totalCount.textContent =
        applications.length;


    const applied =
        applications.filter(
            application =>
                application.status === "Applied"
        ).length;


    const interview =
        applications.filter(
            application =>
                application.status === "Interview"
        ).length;


    const selected =
        applications.filter(
            application =>
                application.status === "Selected"
        ).length;


    appliedCount.textContent =
        applied;


    interviewCount.textContent =
        interview;


    selectedCount.textContent =
        selected;
}


// ========================================
// LOADING
// ========================================

function showLoading() {

    loading.style.display =
        "block";
}


function hideLoading() {

    loading.style.display =
        "none";
}


// ========================================
// ERROR
// ========================================

function showError(message) {

    errorMessage.textContent =
        message;
}


function clearError() {

    errorMessage.textContent =
        "";
}


// ========================================
// HTML ESCAPING
// ========================================

function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent =
        value;

    return div.innerHTML;
}


// ========================================
// START APPLICATION
// ========================================

getApplications();