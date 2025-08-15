document.addEventListener('DOMContentLoaded', () => {
    // Translations Dictionary
    const translations = {
        ar: {
            title: "محسن السيرة الذاتية بالذكاء الاصطناعي",
            input_header: "أدخل نص سيرتك الذاتية هنا",
            input_subheader: "الصق سيرتك الذاتية الحالية أو اكتبها بلغة طبيعية. كلما زادت التفاصيل، كانت النتيجة أفضل.",
            improve_button: "✨ تحسين السيرة الذاتية",
            output_header: "النتيجة المحسنة",
            download_pdf_button: "📥 تحميل كـ PDF",
            loading_text: "جاري التحليل والتحسين...",
            footer_text: "تم التطوير بواسطة الذكاء الاصطناعي",
            cv_input_placeholder: "مثال: أنا مطور برامج لدي 5 سنوات من الخبرة في...",
            error_empty_input: "الرجاء إدخال نص السيرة الذاتية أولاً.",
            settings_button: "الإعدادات",
            modal_header: "إدخال مفتاح Gemini API",
            modal_subheader: "الرجاء إدخال مفتاح API الخاص بك للمتابعة. يتم حفظ المفتاح في متصفحك فقط.",
            modal_save_button: "حفظ والتحقق",
            modal_close_button: "إغلاق",
            key_validating: "جاري التحقق...",
            key_invalid: "المفتاح غير صالح. يرجى التحقق منه والمحاولة مرة أخرى.",
            key_valid: "تم التحقق!"
        },
        en: {
            title: "AI CV Improver",
            input_header: "Enter Your CV Text Here",
            input_subheader: "Paste your current CV or write it in natural language. More details lead to better results.",
            improve_button: "✨ Improve CV",
            output_header: "Improved Result",
            download_pdf_button: "📥 Download as PDF",
            loading_text: "Analyzing and improving...",
            footer_text: "Developed by AI",
            cv_input_placeholder: "e.g., I am a software developer with 5 years of experience in...",
            error_empty_input: "Please enter your CV text first.",
            settings_button: "Settings",
            modal_header: "Enter Gemini API Key",
            modal_subheader: "Please enter your API key to continue. The key is saved only in your browser.",
            modal_save_button: "Save & Validate",
            modal_close_button: "Close",
            key_validating: "Validating...",
            key_invalid: "The key is invalid. Please check it and try again.",
            key_valid: "Validated!"
        }
    };

    // DOM Elements
    const langArBtn = document.getElementById('lang-ar');
    const langEnBtn = document.getElementById('lang-en');
    const improveBtn = document.getElementById('improve-btn');
    const pdfBtn = document.getElementById('pdf-btn');
    const cvInput = document.getElementById('cv-input');
    const cvOutput = document.getElementById('cv-output');
    const loadingSpinner = document.getElementById('loading-spinner');
    const errorMessage = document.getElementById('error-message');
    // New Modal Elements
    const settingsBtn = document.getElementById('settings-btn');
    const apiKeyModal = document.getElementById('api-key-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const saveKeyBtn = document.getElementById('save-key-btn');
    const apiKeyInput = document.getElementById('api-key-input');
    const modalError = document.getElementById('modal-error');

    let currentLang = 'ar'; // Default language
    let userApiKey = null; // To store the user's API key

    // --- FUNCTIONS ---

    // Function to switch language
    function setLanguage(lang) {
        currentLang = lang;
        document.documentElement.lang = lang;
        document.body.className = lang === 'en' ? 'ltr' : '';
        document.documentElement.dir = lang === 'en' ? 'ltr' : 'rtl';

        document.querySelectorAll('[data-lang-key]').forEach(element => {
            const key = element.getAttribute('data-lang-key');
            if (translations[lang][key]) {
                // Using textContent is slightly safer and more consistent
                element.textContent = translations[lang][key];
            }
        });

        cvInput.placeholder = translations[lang].cv_input_placeholder;

        langArBtn.classList.toggle('active', lang === 'ar');
        langEnBtn.classList.toggle('active', lang === 'en');
    }

    // Function to show/hide loading spinner
    function showLoading(isLoading) {
        loadingSpinner.classList.toggle('hidden', !isLoading);
    }

    // Function to show an error message
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.classList.remove('hidden');
    }

    // Function to hide the error message
    function hideError() {
        errorMessage.classList.add('hidden');
    }

    // The hardcoded API_KEY and API_URL constants are removed.
    // They will be constructed dynamically using the key from localStorage.

    // --- Modal and API Key Logic ---

    function openModal() {
        apiKeyModal.classList.remove('hidden');
    }

    function closeModal() {
        apiKeyModal.classList.add('hidden');
        modalError.classList.add('hidden'); // Hide error on close
    }

    function checkApiKey() {
        userApiKey = localStorage.getItem('gemini-api-key');
        if (!userApiKey) {
            openModal();
            improveBtn.disabled = true;
            // Add a visual cue for disabled state
            improveBtn.style.cursor = 'not-allowed';
            improveBtn.style.opacity = '0.6';
        } else {
            improveBtn.disabled = false;
            improveBtn.style.cursor = 'pointer';
            improveBtn.style.opacity = '1';
            apiKeyInput.value = userApiKey; // Pre-fill for easy editing
        }
    }

    async function validateAndSaveApiKey() {
        const key = apiKeyInput.value.trim();
        if (!key) return;

        // Show loading state
        saveKeyBtn.disabled = true;
        saveKeyBtn.textContent = translations[currentLang].key_validating;
        modalError.classList.add('hidden');

        const validationUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;

        try {
            const response = await fetch(validationUrl);
            if (!response.ok) {
                const errorData = await response.json();
                const errorMessage = errorData?.error?.message || translations[currentLang].key_invalid;
                throw new Error(errorMessage);
            }

            // If we get here, the key is valid
            localStorage.setItem('gemini-api-key', key);
            userApiKey = key; // Update the global variable

            // Show success briefly, then close
            saveKeyBtn.style.backgroundColor = 'var(--accent-success)';
            saveKeyBtn.textContent = translations[currentLang].key_valid;

            setTimeout(() => {
                closeModal();
                checkApiKey(); // Re-check to enable the UI
                saveKeyBtn.disabled = false; // Re-enable button
                saveKeyBtn.style.backgroundColor = 'var(--accent-primary)';
                saveKeyBtn.textContent = translations[currentLang].modal_save_button;
            }, 1500);

        } catch (error) {
            localStorage.removeItem('gemini-api-key'); // Remove invalid key
            userApiKey = null;
            modalError.textContent = error.message;
            modalError.classList.remove('hidden');
            saveKeyBtn.disabled = false; // Re-enable button
            saveKeyBtn.textContent = translations[currentLang].modal_save_button;
            checkApiKey(); // Re-check to disable the UI
        }
    }

    // Function to generate the prompt for Gemini
    function getPrompt(text, lang) {
        if (lang === 'ar') {
            return `
            أنت خبير في كتابة السير الذاتية (CV). مهمتك هي أخذ النص الخام التالي الذي أدخله المستخدم ومراجعته وتحسينه وإعادة تنسيقه باللغة العربية.

            التعليمات:
            1.  **التدقيق اللغوي والإملائي:** صحح أي أخطاء لغوية أو إملائية.
            2.  **إعادة الصياغة:** استخدم عبارات قوية واحترافية.
            3.  **التنسيق:** قم بتنظيم المحتوى في أقسام واضحة مثل: "الملخص الشخصي"، "الخبرة العملية"، "التعليم"، "المهارات". استخدم العناوين والنقاط لتسهيل القراءة.
            4.  **الحفاظ على المحتوى:** لا تضف معلومات غير موجودة في النص الأصلي.
            5.  **اللغة:** يجب أن تكون النتيجة النهائية بالكامل باللغة العربية.

            النص الخام من المستخدم:
            ---
            ${text}
            ---

            الرجاء تقديم السيرة الذاتية المحسنة فقط، بدون أي مقدمات أو ملاحظات إضافية.
            `;
        } else { // lang === 'en'
            return `
            You are an expert CV writer and editor. Your task is to take the following raw text provided by a user and review, improve, and reformat it into a professional CV in English.

            Instructions:
            1.  **Proofread and Correct:** Fix any grammatical or spelling errors.
            2.  **Rephrase:** Use strong, professional action verbs and phrases.
            3.  **Format:** Organize the content into clear sections like "Professional Summary," "Work Experience," "Education," and "Skills." Use headings and bullet points for readability.
            4.  **Preserve Content:** Do not add information that is not present in the original text.
            5.  **Language:** The final output must be entirely in English. If the input is in another language (like Arabic), translate it to professional English first, then format it.

            Raw text from the user:
            ---
            ${text}
            ---

            Please provide only the improved CV content, with no additional introductions or notes.
            `;
        }
    }

    // Function to call the Gemini API
    async function callGeminiApi(text) {
        if (!userApiKey) {
            const errorMsg = currentLang === 'ar' ? 'مفتاح API غير موجود. الرجاء إضافته من الإعدادات.' : 'API Key not found. Please set it in the settings.';
            showError(errorMsg);
            openModal();
            return;
        }

        showLoading(true);
        hideError();
        cvOutput.innerHTML = '';
        pdfBtn.disabled = true;

        const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=${userApiKey}`;

        const prompt = getPrompt(text, currentLang);
        const requestBody = {
            contents: [{
                parts: [{
                    text: prompt
                }]
            }],
            generationConfig: {
                temperature: 0.5,
                topK: 1,
                topP: 1,
                maxOutputTokens: 2048,
            }
        };

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error.message || 'An unknown error occurred.');
            }

            const data = await response.json();
            // It's good practice to check if the response structure is as expected
            if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0]) {
                const improvedText = data.candidates[0].content.parts[0].text;
                // Per user feedback, render the HTML content from the API
                cvOutput.innerHTML = improvedText;
                pdfBtn.disabled = false;
            } else {
                throw new Error("Received an unexpected response format from the API.");
            }

        } catch (error) {
            console.error('Error calling Gemini API:', error);
            const errorMessageText = currentLang === 'ar'
                ? `حدث خطأ أثناء الاتصال بالـ API: ${error.message}`
                : `Error calling the API: ${error.message}`;
            showError(errorMessageText);
        } finally {
            showLoading(false);
        }
    }

    // --- EVENT LISTENERS ---

    // Language switchers
    langArBtn.addEventListener('click', () => setLanguage('ar'));
    langEnBtn.addEventListener('click', () => setLanguage('en'));

    // Settings Modal
    settingsBtn.addEventListener('click', openModal);
    closeModalBtn.addEventListener('click', closeModal);
    apiKeyModal.addEventListener('click', (e) => {
        // Close modal if overlay is clicked, but not its children
        if (e.target === apiKeyModal) {
            closeModal();
        }
    });
    saveKeyBtn.addEventListener('click', validateAndSaveApiKey);

    // Improve button click
    improveBtn.addEventListener('click', () => {
        const inputText = cvInput.value.trim();

        if (!inputText) {
            showError(translations[currentLang].error_empty_input);
            return;
        }

        callGeminiApi(inputText);
    });

    // PDF button click listener
    pdfBtn.addEventListener('click', () => {
        const element = document.getElementById('cv-output');
        const filename = currentLang === 'ar' ? 'سيرة_ذاتية_محسنة.pdf' : 'Improved_CV.pdf';

        // The CSS applied to the element (font, direction, etc.) will be captured by html2pdf.
        const opt = {
          margin:       0.75, // in inches
          filename:     filename,
          image:        { type: 'jpeg', quality: 0.98 },
          html2canvas:  {
              scale: 2, // Higher scale for better quality
              letterRendering: true,
              useCORS: true
          },
          jsPDF:        {
              unit: 'in',
              format: 'a4',
              orientation: 'portrait'
          }
        };

        // Use the html2pdf library to generate the PDF from the element
        html2pdf().from(element).set(opt).save();
    });

    // --- INITIALIZATION ---
    setLanguage('ar'); // Set initial language on page load
    checkApiKey(); // Check for a saved API key on load
});
