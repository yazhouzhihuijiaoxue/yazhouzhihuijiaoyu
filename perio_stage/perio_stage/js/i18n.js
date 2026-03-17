// i18n initialization for perio_stage
(function() {
    'use strict';
    
    // Get saved language or default to English
    const savedLang = localStorage.getItem('language') || 'en';
    
    // Initialize i18next
    i18next.init({
        lng: savedLang,
        fallbackLng: 'en',
        debug: false,
        resources: {
            en: {
                translation: {} // Will be loaded from translation.json
            },
            'zh-CN': {
                translation: {} // Chinese translations (fallback)
            }
        }
    });
    
    // Load translation resources
    function loadTranslations() {
        console.log('Loading translation resources...');
        const promises = [
            fetch('./locales/en/translation.json')
                .then(response => {
                    console.log('EN response status:', response.status);
                    return response.json();
                })
                .then(data => {
                    console.log('Loaded EN translations:', Object.keys(data));
                    i18next.addResourceBundle('en', 'translation', data);
                    return data;
                })
                .catch(error => {
                    console.warn('Failed to load English translations:', error);
                    return {};
                }),
            fetch('./locales/zh-CN/translation.json')
                .then(response => {
                    console.log('ZH-CN response status:', response.status);
                    return response.json();
                })
                .then(data => {
                    console.log('Loaded ZH-CN translations:', Object.keys(data));
                    i18next.addResourceBundle('zh-CN', 'translation', data);
                    return data;
                })
                .catch(error => {
                    console.warn('Failed to load Chinese translations:', error);
                    return {};
                })
        ];
        
        return Promise.all(promises);
    }
    
    // Apply translations to the page
    function applyTranslations() {
        console.log('Applying translations for language:', i18next.language);
        
        // Update page title and meta
        const title = i18next.t('title');
        if (title && title !== 'title') {
            document.title = title;
        }
        
        // Update meta description
        const description = i18next.t('meta.description');
        if (description && description !== 'meta.description') {
            const metaDesc = document.querySelector('meta[name="description"]');
            if (metaDesc) metaDesc.setAttribute('content', description);
        }
        
        // Update all elements with data-i18n attribute
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = i18next.t(key);
            if (translation && translation !== key) {
                element.textContent = translation;
            }
        });
        
        // Update alt attributes
        document.querySelectorAll('[data-i18n-alt]').forEach(element => {
            const key = element.getAttribute('data-i18n-alt');
            const translation = i18next.t(key);
            if (translation && translation !== key) {
                element.setAttribute('alt', translation);
            }
        });
    }
    
    // Update select options with translations
    function updateSelectOptions() {
        // Options are now handled by the main applyTranslations function via data-i18n attributes
        // This provides a backup for any options that might not have data-i18n attributes
        const selects = document.querySelectorAll('select');
        selects.forEach(select => {
            const options = select.querySelectorAll('option:not([data-i18n])');
            options.forEach(option => {
                if (!option.value) {
                    const selectText = i18next.t('diagnosis.buttons.select');
                    if (selectText && selectText !== 'diagnosis.buttons.select') {
                        option.textContent = selectText;
                    }
                }
            });
        });
    }
    
    // Language switcher
    function createLanguageSwitcher() {
        const header = document.querySelector('header');
        if (!header) return;
        
        // Remove existing language switcher if any
        const existing = header.querySelector('.language-switcher');
        if (existing) existing.remove();
        
        const langSwitcher = document.createElement('div');
        langSwitcher.className = 'language-switcher';
        langSwitcher.style.cssText = 'position: absolute; top: 10px; right: 20px; z-index: 1000;';
        
        const enBtn = document.createElement('button');
        enBtn.textContent = 'EN';
        enBtn.onclick = () => switchLanguage('en');
        enBtn.style.cssText = 'margin-right: 5px; padding: 5px 10px; border: 1px solid #ccc; background: white; cursor: pointer; border-radius: 3px; font-size: 12px;';
        
        const zhBtn = document.createElement('button');
        zhBtn.textContent = '中文';
        zhBtn.onclick = () => switchLanguage('zh-CN');
        zhBtn.style.cssText = 'padding: 5px 10px; border: 1px solid #ccc; background: white; cursor: pointer; border-radius: 3px; font-size: 12px;';
        
        langSwitcher.appendChild(enBtn);
        langSwitcher.appendChild(zhBtn);
        header.appendChild(langSwitcher);
    }
    
    // Switch language
    function switchLanguage(lng) {
        i18next.changeLanguage(lng, (err, t) => {
            if (err) {
                console.error('Language switch failed:', err);
                return;
            }
            
            console.log('Switched to language:', lng);
            
            // Store language preference
            localStorage.setItem('language', lng);
            
            // Reapply translations
            applyTranslations();
            updateSelectOptions();
            
            // Update page lang attribute
            document.documentElement.lang = lng;
            
            // Update language switcher buttons
            updateLanguageSwitcher(lng);
        });
    }
    
    // Update language switcher button styles
    function updateLanguageSwitcher(currentLang) {
        const buttons = document.querySelectorAll('.language-switcher button');
        buttons.forEach(btn => {
            btn.style.background = 'white';
            btn.style.color = 'black';
        });
        
        if (currentLang === 'en') {
            const enBtn = Array.from(buttons).find(btn => btn.textContent === 'EN');
            if (enBtn) {
                enBtn.style.background = '#007bff';
                enBtn.style.color = 'white';
            }
        } else if (currentLang === 'zh-CN') {
            const zhBtn = Array.from(buttons).find(btn => btn.textContent === '中文');
            if (zhBtn) {
                zhBtn.style.background = '#007bff';
                zhBtn.style.color = 'white';
            }
        }
    }
    
    // Initialize when DOM is ready
    function init() {
        console.log('Initializing i18n...');
        // Load saved language preference
        const savedLang = localStorage.getItem('language') || 'en';
        console.log('Saved language:', savedLang);
        
        loadTranslations().then(() => {
            console.log('Translations loaded, changing language to:', savedLang);
            i18next.changeLanguage(savedLang, () => {
                console.log('Language changed, applying translations...');
                applyTranslations();
                updateSelectOptions();
                createLanguageSwitcher();
                updateLanguageSwitcher(savedLang);
                document.documentElement.lang = savedLang;
                console.log('i18n initialization complete');
            });
        });
    }
    
    // Initialize when DOM is loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // Expose functions globally for debugging
    window.i18nStage = {
        switchLanguage,
        applyTranslations,
        getCurrentLanguage: () => i18next.language
    };
    
})(); 