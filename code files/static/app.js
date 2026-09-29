/* =====================================================
   EDUGENIE FRONTEND
   ===================================================== */


let currentTask = "question";

let currentQuiz = null;

let lastResponse = "";



/* =====================================================
   TASK CONFIGURATION
   ===================================================== */


const taskConfig = {

    question: {

        title: "Ask Question",

        placeholder:
            "Type your question here...",

        action:
            "Ask Question",

        icon:
            "➤"

    },


    explain: {

        title: "Explain Topic",

        placeholder:
            "Enter a topic you want explained...",

        action:
            "Explain Topic",

        icon:
            "💡"

    },


    summary: {

        title: "Summarize Text",

        placeholder:
            "Paste the educational passage you want summarized...",

        action:
            "Summarize Text",

        icon:
            "📝"

    },


    quiz: {

        title: "Generate Quiz",

        placeholder:
            "Enter a topic or passage for your quiz...",

        action:
            "Generate Quiz",

        icon:
            "❓"

    },


    learning: {

        title: "Learning Path",

        placeholder:
            "Enter a topic you want to learn step by step...",

        action:
            "Create Learning Path",

        icon:
            "📊"

    }

};



/* =====================================================
   INITIALIZATION
   ===================================================== */


document.addEventListener(
    "DOMContentLoaded",
    () => {

        const input =
            document.getElementById(
                "mainInput"
            );


        input.addEventListener(
            "input",
            updateCharacterCount
        );


        document.addEventListener(
            "keydown",
            handleGlobalShortcut
        );

    }
);



/* =====================================================
   TASK SELECTION
   ===================================================== */


function selectTask(
    task,
    clickedElement = null
) {

    if (task === "home") {

        scrollToWorkspace();

        return;
    }


    if (!taskConfig[task]) {

        return;
    }


    currentTask = task;


    const config =
        taskConfig[task];


    const input =
        document.getElementById(
            "mainInput"
        );


    const actionText =
        document.getElementById(
            "actionText"
        );


    const actionIcon =
        document.getElementById(
            "actionIcon"
        );


    input.placeholder =
        config.placeholder;


    actionText.textContent =
        config.action;


    actionIcon.textContent =
        config.icon;


    document
        .querySelectorAll(".task-tab")
        .forEach(
            tab => {

                tab.classList.remove(
                    "active"
                );

                if (
                    tab.dataset.task ===
                    task
                ) {

                    tab.classList.add(
                        "active"
                    );
                }
            }
        );


    if (clickedElement) {

        document
            .querySelectorAll(".nav-item")
            .forEach(
                item =>
                    item.classList.remove(
                        "active"
                    )
            );


        clickedElement.classList.add(
            "active"
        );
    }


    scrollToWorkspace();

    input.focus();

}



/* =====================================================
   RUN TASK
   ===================================================== */


async function runCurrentTask() {

    const input =
        document.getElementById(
            "mainInput"
        );


    const text =
        input.value.trim();


    if (!text) {

        showToast(
            "Please enter something first."
        );

        input.focus();

        return;
    }


    const button =
        document.getElementById(
            "mainActionButton"
        );


    const response =
        document.getElementById(
            "responseContent"
        );


    const responseStatus =
        document.getElementById(
            "responseStatus"
        );


    button.classList.add(
        "loading"
    );


    button.disabled = true;


    button.querySelector(
        "#actionText"
    ).textContent =
        "Thinking...";


    responseStatus.textContent =
        "EduGenie is thinking...";


    response.innerHTML = `

        <div class="empty-response">

            <div>
                ✨
            </div>

            <p>
                Generating your answer...
            </p>

            <small>
                Powered by Google Gemini
            </small>

        </div>

    `;


    try {

        let result;


        switch (currentTask) {

            case "question":

                result =
                    await askQuestion(
                        text
                    );

                break;


            case "explain":

                result =
                    await explainTopic(
                        text
                    );

                break;


            case "summary":

                result =
                    await summarizeText(
                        text
                    );

                break;


            case "quiz":

                result =
                    await generateQuiz(
                        text
                    );

                break;


            case "learning":

                result =
                    await generateLearningPath(
                        text
                    );

                break;


            default:

                throw new Error(
                    "Unknown task."
                );
        }


        if (
            typeof result ===
            "string"
        ) {

            displayResponse(
                result
            );

        }

    } catch (error) {

        displayError(
            error.message
        );

    } finally {

        button.classList.remove(
            "loading"
        );

        button.disabled = false;


        button.querySelector(
            "#actionText"
        ).textContent =
            taskConfig[currentTask].action;
    }

}



/* =====================================================
   API CALL
   ===================================================== */


async function callAPI(
    url,
    data
) {

    const response =
        await fetch(
            url,
            {

                method:
                    "POST",

                headers:
                {
                    "Content-Type":
                        "application/json"
                },

                body:
                    JSON.stringify(data)

            }
        );


    let result;


    try {

        result =
            await response.json();

    } catch {

        throw new Error(
            "Server returned an invalid response."
        );

    }


    if (!response.ok) {

        throw new Error(
            result.detail ||
            "Something went wrong."
        );

    }


    return result;

}



/* =====================================================
   QUESTION
   ===================================================== */


async function askQuestion(
    question
) {

    const data =
        await callAPI(
            "/qa",
            {
                question:
                    question
            }
        );


    return data.result;

}



/* =====================================================
   EXPLANATION
   ===================================================== */


async function explainTopic(
    topic
) {

    const data =
        await callAPI(
            "/explain",
            {
                topic:
                    topic
            }
        );


    return data.result;

}



/* =====================================================
   SUMMARY
   ===================================================== */


async function summarizeText(
    text
) {

    const data =
        await callAPI(
            "/summarize",
            {
                text:
                    text
            }
        );


    return data.result;

}



/* =====================================================
   QUIZ
   ===================================================== */


async function generateQuiz(
    text
) {

    const data =
        await callAPI(
            "/quiz",
            {
                text:
                    text
            }
        );


    currentQuiz =
        data;


    displayQuiz(
        data
    );



    return null;

}



/* =====================================================
   LEARNING PATH
   ===================================================== */


async function generateLearningPath(
    topic
) {

    const data =
        await callAPI(
            "/learn/recommendations",
            {
                topic:
                    topic
            }
        );


    return data.result;

}



/* =====================================================
   DISPLAY NORMAL RESPONSE
   ===================================================== */


function displayResponse(
    text
) {

    const response =
        document.getElementById(
            "responseContent"
        );


    const status =
        document.getElementById(
            "responseStatus"
        );


    lastResponse =
        text;


    response.innerHTML =
        formatResponse(
            text
        );


    status.textContent =
        "Response generated successfully";



    document
        .getElementById(
            "responseCard"
        )
        .scrollIntoView(
            {
                behavior:
                    "smooth",
                block:
                    "nearest"
            }
        );

}



/* =====================================================
   FORMAT RESPONSE
   ===================================================== */


function formatResponse(
    text
) {

    const safe =
        escapeHTML(
            text
        );


    return `

        <div class="formatted-response">

            ${safe
            .replace(
                /\n/g,
                "<br>"
            )
        }

        </div>

    `;

}



/* =====================================================
   DISPLAY QUIZ
   ===================================================== */


function displayQuiz(
    quiz
) {

    const response =
        document.getElementById(
            "responseContent"
        );


    const status =
        document.getElementById(
            "responseStatus"
        );


    status.textContent =
        "Quiz generated successfully";


    let html = `

        <div class="quiz-title">

            ${escapeHTML(
        quiz.title
    )}

        </div>

    `;


    quiz.questions.forEach(
        (
            question,
            index
        ) => {

            html += `

                <div
                    class="quiz-question"
                    data-question-index="${index}"
                >

                    <div class="quiz-question-title">

                        ${index + 1}.
                        ${escapeHTML(
                question.question
            )}

                    </div>

            `;


            question.options.forEach(
                (
                    option,
                    optionIndex
                ) => {

                    const id =
                        `quiz_${index}_${optionIndex}`;


                    html += `

                        <label
                            class="quiz-option"
                            for="${id}"
                        >

                            <input
                                type="radio"
                                id="${id}"
                                name="quiz_question_${index}"
                                value="${escapeAttribute(option)}"
                            >

                            ${escapeHTML(
                        option
                    )}

                        </label>

                    `;

                }
            );


            html += `

                    <div
                        id="feedback_${index}"
                        class="quiz-feedback"
                        style="display:none"
                    ></div>

                </div>

            `;

        }
    );


    html += `

        <button
            class="quiz-submit"
            onclick="checkQuiz()"
        >
            Check Answers
        </button>

    `;


    response.innerHTML =
        html;


    lastResponse =
        "Quiz: " +
        quiz.title;

}



/* =====================================================
   CHECK QUIZ
   ===================================================== */


function checkQuiz() {

    if (!currentQuiz) {

        return;
    }


    let score = 0;


    currentQuiz.questions.forEach(
        (
            question,
            index
        ) => {

            const selected =
                document.querySelector(
                    `input[name="quiz_question_${index}"]:checked`
                );


            const feedback =
                document.getElementById(
                    `feedback_${index}`
                );


            feedback.style.display =
                "block";


            if (!selected) {

                feedback.className =
                    "quiz-feedback wrong";

                feedback.textContent =
                    `No answer selected. Correct answer: ${question.correct_answer}`;

                return;
            }


            if (
                selected.value ===
                question.correct_answer
            ) {

                score++;


                feedback.className =
                    "quiz-feedback correct";

                feedback.textContent =
                    "✓ Correct! " +
                    question.explanation;

            } else {

                feedback.className =
                    "quiz-feedback wrong";

                feedback.textContent =
                    "✗ Incorrect. Correct answer: " +
                    question.correct_answer +
                    ". " +
                    question.explanation;
            }

        }
    );


    showToast(
        `You scored ${score}/${currentQuiz.questions.length}`
    );

}



/* =====================================================
   EXAMPLE
   ===================================================== */


function useExample(
    text
) {

    const input =
        document.getElementById(
            "mainInput"
        );


    input.value =
        text;


    updateCharacterCount();

    input.focus();

}



/* =====================================================
   CHARACTER COUNT
   ===================================================== */


function updateCharacterCount() {

    const input =
        document.getElementById(
            "mainInput"
        );


    const counter =
        document.getElementById(
            "characterCount"
        );


    counter.textContent =
        `${input.value.length} / 30000`;

}



/* =====================================================
   SEARCH
   ===================================================== */


function handleSearch(
    event
) {

    if (
        event.key ===
        "Enter"
    ) {

        const value =
            event.target.value.trim();


        if (!value) {

            return;
        }


        useExample(
            value
        );


        showToast(
            "Search added to your learning workspace."
        );

    }

}



/* =====================================================
   GLOBAL SHORTCUT
   ===================================================== */


function handleGlobalShortcut(
    event
) {

    if (
        (event.ctrlKey ||
            event.metaKey) &&
        event.key.toLowerCase() ===
        "k"
    ) {

        event.preventDefault();


        const search =
            document.getElementById(
                "globalSearch"
            );


        search.focus();

    }

}



/* =====================================================
   SIDEBAR
   ===================================================== */


function toggleSidebar() {

    document
        .getElementById(
            "sidebar"
        )
        .classList.toggle(
            "open"
        );

}



/* =====================================================
   SCROLL
   ===================================================== */


function scrollToWorkspace() {

    const workspace =
        document.getElementById(
            "workspace"
        );


    workspace.scrollIntoView(
        {
            behavior:
                "smooth",
            block:
                "start"
        }
    );

}



/* =====================================================
   THEME
   ===================================================== */


function toggleTheme() {

    document.body.classList.toggle(
        "light-mode"
    );


    const isLight =
        document.body.classList.contains(
            "light-mode"
        );


    localStorage.setItem(
        "edugenie-theme",
        isLight
            ? "light"
            : "dark"
    );

}



/* =====================================================
   LOAD THEME
   ===================================================== */


(function loadTheme() {

    const theme =
        localStorage.getItem(
            "edugenie-theme"
        );


    if (
        theme ===
        "light"
    ) {

        document.body.classList.add(
            "light-mode"
        );

    }

})();



/* =====================================================
   COPY RESPONSE
   ===================================================== */


async function copyResponse() {

    if (!lastResponse) {

        showToast(
            "There is no response to copy."
        );

        return;
    }


    try {

        await navigator.clipboard.writeText(
            lastResponse
        );


        showToast(
            "Response copied."
        );

    } catch {

        showToast(
            "Could not copy the response."
        );

    }

}



/* =====================================================
   UPLOAD MESSAGE
   ===================================================== */


function showUploadMessage() {

    showToast(
        "File upload will be added in the next version."
    );

}



/* =====================================================
   ERROR
   ===================================================== */


function displayError(
    message
) {

    const response =
        document.getElementById(
            "responseContent"
        );


    const status =
        document.getElementById(
            "responseStatus"
        );


    status.textContent =
        "Something went wrong";


    response.innerHTML = `

        <div
            style="
                color:#ff7c9a;
                padding:15px;
            "
        >

            <strong>
                Error
            </strong>

            <br>

            ${escapeHTML(
        message
    )}

        </div>

    `;

}



/* =====================================================
   TOAST
   ===================================================== */


function showToast(
    message
) {

    const toast =
        document.getElementById(
            "toast"
        );


    const text =
        document.getElementById(
            "toastMessage"
        );


    text.textContent =
        message;


    toast.classList.add(
        "show"
    );


    setTimeout(
        () => {

            toast.classList.remove(
                "show"
            );

        },
        2500
    );

}



/* =====================================================
   SECURITY
   ===================================================== */


function escapeHTML(
    value
) {

    return String(value)

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );

}


function escapeAttribute(
    value
) {

    return escapeHTML(
        value
    );

}