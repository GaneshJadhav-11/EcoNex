(function () {
    "use strict";

    const translations = {
        hi: {
            "EcoNex | Kabadiwala Connect": "EcoNex | कबाड़ीवाला कनेक्ट",
            "INDIA’S FAIR E-WASTE MOVEMENT": "भारत का उचित ई-कचरा अभियान",
            "Scrap is": "स्क्रैप में है", "power.": "ताकत।", "Own your": "पाइए अपनी", "value.": "असली कीमत।",
            "EcoNex turns every cable, battery and board into a fair deal — with live rates, verified buyers and proof of every handover.": "EcoNex हर केबल, बैटरी और बोर्ड को सही सौदे में बदलता है — लाइव दरों, सत्यापित खरीदारों और हर हस्तांतरण के प्रमाण के साथ।",
            "Fair prices": "उचित कीमत", "Verified recyclers": "सत्यापित रीसाइकलर", "Works offline": "ऑफलाइन भी चलेगा",
            "Know the": "जानें", "real rate": "असली दर", "Find a safe": "पाएँ सुरक्षित", "buyer nearby": "पास का खरीदार", "Keep proof of": "रखें प्रमाण", "every deal": "हर सौदे का",
            "GET STARTED": "शुरू करें", "Choose your workspace": "अपना कार्यस्थान चुनें", "I’m a collector": "मैं कलेक्टर हूँ", "Lots, offers and earnings": "लॉट, ऑफर और कमाई", "I’m a recycler": "मैं रीसाइकलर हूँ", "Review lots and make offers": "लॉट देखें और ऑफर दें", "Your data stays on this device in prototype mode.": "प्रोटोटाइप मोड में आपका डेटा इसी डिवाइस पर रहता है।", "Built for the hands that keep India circular.": "भारत को चक्रीय रखने वाले हाथों के लिए बनाया गया।",
            "Collector Dashboard": "कलेक्टर डैशबोर्ड", "Recycler Portal": "रीसाइकलर पोर्टल",
            "Earnings Ledger": "कमाई बही", "Digital Handover": "डिजिटल हस्तांतरण",
            "Recycler Offers": "रीसाइकलर के ऑफर", "Create E-Waste Lot": "ई-कचरा लॉट बनाएँ",
            "Admin Verification": "एडमिन सत्यापन", "Log out": "लॉग आउट", "Dashboard": "डैशबोर्ड",
            "Home": "होम", "Collector workspace • कलेक्टर डैशबोर्ड": "कलेक्टर कार्यस्थान",
            "Recycler workspace • authorised network": "रीसाइकलर कार्यस्थान • अधिकृत नेटवर्क",
            "New collection • नया कलेक्शन": "नया कलेक्शन", "Price board • मूल्य सूची": "मूल्य सूची",
            "My earnings • मेरी कमाई": "मेरी कमाई", "Verified transfer • सत्यापित हस्तांतरण": "सत्यापित हस्तांतरण",
            "Admin workspace • recycler verification": "एडमिन कार्यस्थान • रीसाइकलर सत्यापन",
            "COLLECT • CONNECT • CASH IN": "इकट्ठा करें • जुड़ें • कमाएँ",
            "Every scrap lot has": "हर स्क्रैप लॉट में है", "serious value.": "असली कीमत।",
            "See live offers from verified recyclers near you.": "अपने पास के सत्यापित रीसाइकलर के लाइव ऑफर देखें।",
            "Ready to sync": "सिंक के लिए तैयार", "Your work is saved on this device": "आपका काम इस डिवाइस पर सुरक्षित है",
            "Collected lots": "इकट्ठा किए लॉट", "Safe handovers": "सुरक्षित हस्तांतरण", "Total earnings": "कुल कमाई",
            "Create a lot": "लॉट बनाएँ", "Compare offers": "ऑफर की तुलना करें", "Digital handover": "डिजिटल हस्तांतरण", "Earnings ledger": "कमाई बही",
            "Take a photo, add weight and get a fair value estimate.": "फोटो लें, वजन डालें और उचित कीमत का अनुमान पाएँ।",
            "Choose the best price from authorised recyclers.": "अधिकृत रीसाइकलर से सबसे अच्छी कीमत चुनें।",
            "Keep a verified record of every handover.": "हर हस्तांतरण का सत्यापित रिकॉर्ड रखें।",
            "Track money received and your transaction history.": "मिली हुई रकम और लेन-देन का रिकॉर्ड देखें।",
            "Add e-waste →": "ई-कचरा जोड़ें →", "See recycler offers →": "रीसाइकलर ऑफर देखें →",
            "Open handover →": "हस्तांतरण खोलें →", "View my ledger →": "मेरी बही देखें →",
            "STEP 1 OF 1": "चरण 1 / 1", "Create a new lot": "नया लॉट बनाएँ",
            "Add only the details you know. You can complete this offline and sync later.": "जो जानकारी हो वही भरें। ऑफलाइन पूरा करें और बाद में सिंक करें।",
            "Photograph the e-waste": "ई-कचरे की फोटो लें", "A clear photo helps with the estimate": "साफ फोटो से अनुमान बेहतर होता है",
            "What have you collected?": "आपने क्या इकट्ठा किया?", "Select a material": "सामग्री चुनें",
            "Approximate weight (kg)": "अनुमानित वजन (किलो)", "Condition": "स्थिति", "Collection location": "कलेक्शन स्थान",
            "Tap below to capture location": "स्थान लेने के लिए नीचे दबाएँ", "Capture my location": "मेरा स्थान लें",
            "Create lot & see offers →": "लॉट बनाएँ और ऑफर देखें →", "Location is used only to find nearby verified recyclers.": "स्थान केवल पास के सत्यापित रीसाइकलर खोजने के लिए है।",
            "VERIFIED RECYCLERS": "सत्यापित रीसाइकलर", "Offers for your lots": "आपके लॉट के ऑफर",
            "Compare price, pickup and recycler before you decide.": "चुनने से पहले कीमत, पिकअप और रीसाइकलर की तुलना करें।",
            "Authorised network": "अधिकृत नेटवर्क", "No offers yet": "अभी कोई ऑफर नहीं",
            "Ask recyclers to submit their price offers.": "रीसाइकलर से कीमत के ऑफर देने को कहें।", "Select This Offer": "यह ऑफर चुनें",
            "SECURE HANDOVER": "सुरक्षित हस्तांतरण", "Confirm your handover": "अपना हस्तांतरण पक्का करें",
            "Check the final weight and price. This creates a traceable recycling record.": "अंतिम वजन और कीमत जाँचें। इससे रीसाइक्लिंग का रिकॉर्ड बनता है।",
            "Transaction Details": "लेन-देन का विवरण", "Final Weight at Handover (kg)": "हस्तांतरण पर अंतिम वजन (किलो)",
            "Final Price (₹/kg)": "अंतिम कीमत (₹/किलो)", "Capture GPS Location": "GPS स्थान लें", "Location not captured": "स्थान नहीं लिया गया",
            "Confirm Digital Handover": "डिजिटल हस्तांतरण पक्का करें", "View Offers": "ऑफर देखें",
            "TOTAL RECEIVED": "कुल प्राप्त", "From verified e-waste handovers": "सत्यापित ई-कचरा हस्तांतरण से",
            "Transaction history": "लेन-देन का इतिहास", "Your completed handovers appear here.": "आपके पूरे हुए हस्तांतरण यहाँ दिखेंगे।",
            "Traceable records": "ट्रैक होने वाले रिकॉर्ड", "No completed transactions": "कोई पूरा लेन-देन नहीं",
            "Your completed transactions will appear here.": "आपके पूरे लेन-देन यहाँ दिखेंगे।",
            "ONBOARDING": "पंजीकरण", "Recycler profile": "रीसाइकलर प्रोफाइल",
            "Add your facility details for admin verification. Only verified recyclers can make offers.": "एडमिन सत्यापन के लिए सुविधा की जानकारी जोड़ें। केवल सत्यापित रीसाइकलर ऑफर दे सकते हैं।",
            "Recycler / Firm Name": "रीसाइकलर / फर्म का नाम", "Contact Number": "संपर्क नंबर", "Facility Location": "सुविधा का स्थान",
            "Accepted Materials": "स्वीकार्य सामग्री", "Authorization / Registration Number": "अनुमति / पंजीकरण नंबर", "Authorization Document": "अनुमति दस्तावेज",
            "Pickup Availability": "पिकअप उपलब्धता", "Save Recycler Profile": "रीसाइकलर प्रोफाइल सेव करें",
            "LIVE MARKETPLACE": "लाइव मार्केटप्लेस", "Available e-waste lots": "उपलब्ध ई-कचरा लॉट",
            "Review collector lots and submit a transparent offer.": "कलेक्टर लॉट देखें और स्पष्ट ऑफर दें।", "Verification required": "सत्यापन जरूरी",
            "No e-waste lots available.": "कोई ई-कचरा लॉट उपलब्ध नहीं।", "New collector lots will appear here.": "नए कलेक्टर लॉट यहाँ दिखेंगे।",
            "TRUST & COMPLIANCE": "विश्वास और अनुपालन", "Recycler verification": "रीसाइकलर सत्यापन",
            "Review registration details and documents before approving network access.": "नेटवर्क अनुमति देने से पहले पंजीकरण और दस्तावेज जाँचें।",
            "Verification History": "सत्यापन इतिहास", "Loading...": "लोड हो रहा है..."
        },
        mr: {
            "EcoNex | Kabadiwala Connect": "EcoNex | कबाडीवाला कनेक्ट",
            "INDIA’S FAIR E-WASTE MOVEMENT": "भारताची योग्य ई-कचरा चळवळ", "Scrap is": "स्क्रॅप म्हणजे", "power.": "ताकद।", "Own your": "मिळवा तुमची", "value.": "खरी किंमत।", "EcoNex turns every cable, battery and board into a fair deal — with live rates, verified buyers and proof of every handover.": "EcoNex प्रत्येक केबल, बॅटरी आणि बोर्डाचे योग्य व्यवहारात रूपांतर करते — लाइव्ह दर, पडताळलेले खरेदीदार आणि प्रत्येक हस्तांतरणाच्या पुराव्यासह।", "Fair prices": "योग्य दर", "Verified recyclers": "पडताळलेले पुनर्चक्रण केंद्र", "Works offline": "ऑफलाइन चालते", "Know the": "जाणा", "real rate": "खरा दर", "Find a safe": "शोधा सुरक्षित", "buyer nearby": "जवळचा खरेदीदार", "Keep proof of": "ठेवा पुरावा", "every deal": "प्रत्येक व्यवहाराचा", "GET STARTED": "सुरू करा", "Choose your workspace": "तुमचे कार्यक्षेत्र निवडा", "I’m a collector": "मी संकलक आहे", "Lots, offers and earnings": "लॉट, ऑफर आणि कमाई", "I’m a recycler": "मी पुनर्चक्रण केंद्र आहे", "Review lots and make offers": "लॉट पहा आणि ऑफर द्या", "Your data stays on this device in prototype mode.": "प्रोटोटाइपमध्ये तुमचा डेटा या उपकरणावर राहतो।", "Built for the hands that keep India circular.": "भारताला चक्रीय ठेवणाऱ्या हातांसाठी तयार केले।",
            "Collector Dashboard": "संकलक डॅशबोर्ड", "Recycler Portal": "पुनर्चक्रण केंद्र पोर्टल", "Earnings Ledger": "कमाईची वही", "Digital Handover": "डिजिटल हस्तांतरण", "Recycler Offers": "पुनर्चक्रण केंद्राचे ऑफर", "Create E-Waste Lot": "ई-कचरा लॉट तयार करा", "Admin Verification": "प्रशासक पडताळणी",
            "Log out": "लॉग आउट", "Dashboard": "डॅशबोर्ड", "Home": "होम", "Collector workspace • कलेक्टर डैशबोर्ड": "संकलक कार्यक्षेत्र", "Recycler workspace • authorised network": "पुनर्चक्रण केंद्र कार्यक्षेत्र • अधिकृत नेटवर्क",
            "New collection • नया कलेक्शन": "नवीन संकलन", "Price board • मूल्य सूची": "दरपत्रक", "My earnings • मेरी कमाई": "माझी कमाई", "Verified transfer • सत्यापित हस्तांतरण": "पडताळलेले हस्तांतरण", "Admin workspace • recycler verification": "प्रशासक कार्यक्षेत्र • पुनर्चक्रण केंद्र पडताळणी",
            "COLLECT • CONNECT • CASH IN": "गोळा करा • जोडा • कमवा", "Every scrap lot has": "प्रत्येक स्क्रॅप लॉटमध्ये आहे", "serious value.": "खरी किंमत।", "See live offers from verified recyclers near you.": "तुमच्या जवळच्या पडताळलेल्या पुनर्चक्रण केंद्रांचे लाइव्ह ऑफर पहा।", "Ready to sync": "सिंकसाठी तयार", "Your work is saved on this device": "तुमचे काम या उपकरणावर जतन केले आहे",
            "Collected lots": "गोळा केलेले लॉट", "Safe handovers": "सुरक्षित हस्तांतरण", "Total earnings": "एकूण कमाई", "Create a lot": "लॉट तयार करा", "Compare offers": "ऑफरची तुलना करा", "Digital handover": "डिजिटल हस्तांतरण", "Earnings ledger": "कमाईची वही", "Take a photo, add weight and get a fair value estimate.": "फोटो घ्या, वजन भरा आणि योग्य किमतीचा अंदाज मिळवा।", "Choose the best price from authorised recyclers.": "अधिकृत पुनर्चक्रण केंद्रांमधून सर्वोत्तम किंमत निवडा।", "Keep a verified record of every handover.": "प्रत्येक हस्तांतरणाची पडताळलेली नोंद ठेवा।", "Track money received and your transaction history.": "मिळालेले पैसे आणि व्यवहारांचा इतिहास पहा।",
            "Add e-waste →": "ई-कचरा जोडा →", "See recycler offers →": "पुनर्चक्रण ऑफर पहा →", "Open handover →": "हस्तांतरण उघडा →", "View my ledger →": "माझी वही पहा →",
            "Create a new lot": "नवीन लॉट तयार करा", "What have you collected?": "तुम्ही काय गोळा केले?", "Select a material": "साहित्य निवडा", "Approximate weight (kg)": "अंदाजे वजन (किलो)", "Condition": "स्थिती", "Collection location": "संकलनाचे ठिकाण", "Capture my location": "माझे ठिकाण घ्या", "Create lot & see offers →": "लॉट तयार करा आणि ऑफर पहा →",
            "Offers for your lots": "तुमच्या लॉटसाठी ऑफर", "No offers yet": "अजून ऑफर नाहीत", "Select This Offer": "हे ऑफर निवडा", "Confirm your handover": "तुमचे हस्तांतरण निश्चित करा", "Transaction Details": "व्यवहाराचा तपशील", "Confirm Digital Handover": "डिजिटल हस्तांतरण निश्चित करा", "View Offers": "ऑफर पहा", "Transaction history": "व्यवहाराचा इतिहास", "No completed transactions": "पूर्ण झालेले व्यवहार नाहीत", "Recycler profile": "पुनर्चक्रण केंद्र प्रोफाइल", "Recycler / Firm Name": "पुनर्चक्रण केंद्र / फर्मचे नाव", "Contact Number": "संपर्क क्रमांक", "Facility Location": "केंद्राचे ठिकाण", "Accepted Materials": "स्वीकारलेले साहित्य", "Save Recycler Profile": "प्रोफाइल जतन करा", "Available e-waste lots": "उपलब्ध ई-कचरा लॉट", "Recycler verification": "पुनर्चक्रण केंद्र पडताळणी", "Verification History": "पडताळणी इतिहास"
        }
    };

    const originalText = new WeakMap();
    const originalAttributes = new WeakMap();
    const languages = { en: "EN", hi: "हिंदी", mr: "मराठी" };

    function translateValue(value, language) {
        return language === "en" ? value : (translations[language][value] || value);
    }

    function translateNode(node, language) {
        if (node.nodeType === Node.TEXT_NODE) {
            if (!originalText.has(node)) originalText.set(node, node.nodeValue);
            const source = originalText.get(node);
            const leading = source.match(/^\s*/)[0];
            const trailing = source.match(/\s*$/)[0];
            const key = source.trim();
            if (key) node.nodeValue = leading + translateValue(key, language) + trailing;
            return;
        }
        if (node.nodeType !== Node.ELEMENT_NODE || ["SCRIPT", "STYLE"].includes(node.tagName)) return;
        ["placeholder", "title", "aria-label"].forEach(attribute => {
            if (!node.hasAttribute(attribute)) return;
            if (!originalAttributes.has(node)) originalAttributes.set(node, {});
            const saved = originalAttributes.get(node);
            if (!(attribute in saved)) saved[attribute] = node.getAttribute(attribute);
            node.setAttribute(attribute, translateValue(saved[attribute], language));
        });
        node.childNodes.forEach(child => translateNode(child, language));
    }

    function applyLanguage(language) {
        document.documentElement.lang = language === "hi" ? "hi" : language === "mr" ? "mr" : "en";
        document.documentElement.dataset.language = language;
        translateNode(document.body, language);
        document.title = translateValue(document.title, language);
        localStorage.setItem("econexLanguage", language);
        const button = document.getElementById("languageButton");
        if (button) button.textContent = languages[language] + " ▾";
        document.querySelectorAll("[data-language-choice]").forEach(item => item.classList.toggle("is-selected", item.dataset.languageChoice === language));
    }

    function addLanguageControl() {
        let button = document.getElementById("languageButton");
        if (!button) {
            button = document.createElement("button");
            button.id = "languageButton";
            button.className = "floating-language";
            button.type = "button";
            document.body.appendChild(button);
        }
        const menu = document.createElement("div");
        menu.className = "language-menu";
        menu.id = "languageMenu";
        menu.innerHTML = '<p>Choose language</p><button data-language-choice="en">English</button><button data-language-choice="hi">हिंदी</button><button data-language-choice="mr">मराठी</button>';
        document.body.appendChild(menu);
        button.addEventListener("click", () => {
            const isOpen = menu.classList.toggle("is-open");
            button.setAttribute("aria-expanded", String(isOpen));
        });
        menu.addEventListener("click", event => {
            const choice = event.target.dataset.languageChoice;
            if (!choice) return;
            applyLanguage(choice);
            menu.classList.remove("is-open");
            button.setAttribute("aria-expanded", "false");
        });
    }

    document.addEventListener("DOMContentLoaded", () => {
        addLanguageControl();
        const language = localStorage.getItem("econexLanguage") || "en";
        applyLanguage(language);
        const observer = new MutationObserver(records => records.forEach(record => record.addedNodes.forEach(node => translateNode(node, localStorage.getItem("econexLanguage") || "en"))));
        observer.observe(document.body, { childList: true, subtree: true });
    });
}());
