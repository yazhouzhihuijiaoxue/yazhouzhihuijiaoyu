// 国际化支持的页面功能
document.addEventListener('DOMContentLoaded', function() {
    // 等待 i18n 初始化完成
    setTimeout(() => {
        // 显示版权声明弹窗
        showCopyrightNotice();
        
        // 标签页切换功能
        const tabBtns = document.querySelectorAll('.tab-btn');
        const tabPanes = document.querySelectorAll('.tab-pane');

        tabBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                // 移除所有标签页的active类
                tabBtns.forEach(btn => btn.classList.remove('active'));
                tabPanes.forEach(pane => pane.classList.remove('active'));

                // 添加当前标签页的active类
                this.classList.add('active');
                const tabId = this.getAttribute('data-tab');
                document.getElementById(tabId).classList.add('active');
            });
        });

        // 处理治疗历史选择显示/隐藏相关字段
        const treatmentHistorySelect = document.getElementById('treatment-history');
        if (treatmentHistorySelect) {
            const treatmentHistoryYesFields = document.querySelectorAll('.treatment-history-yes');
            const treatmentHistoryNoFields = document.querySelectorAll('.treatment-history-no');

            treatmentHistorySelect.addEventListener('change', function() {
                if (this.value === 'yes') {
                    treatmentHistoryYesFields.forEach(field => field.classList.remove('hidden'));
                    treatmentHistoryNoFields.forEach(field => field.classList.add('hidden'));
                } else if (this.value === 'no') {
                    treatmentHistoryYesFields.forEach(field => field.classList.add('hidden'));
                    treatmentHistoryNoFields.forEach(field => field.classList.remove('hidden'));
                } else {
                    treatmentHistoryYesFields.forEach(field => field.classList.add('hidden'));
                    treatmentHistoryNoFields.forEach(field => field.classList.add('hidden'));
                }
            });
        }

        // 诊断按钮点击事件
        const diagnoseBtn = document.getElementById('diagnose-btn');
        if (diagnoseBtn) {
            diagnoseBtn.addEventListener('click', diagnose);
        }
    }, 500); // 等待 i18n 初始化
});

/**
 * 显示版权声明弹窗
 */
function showCopyrightNotice() {
    // 检查是否已经显示过
    const storageKey = 'copyrightNoticeShown_' + (i18next.language || 'zh-CN');
    if (!localStorage.getItem(storageKey)) {
        const currentLang = i18next.language || 'zh-CN';
        let message = '';
        
        if (currentLang === 'en') {
            message = "Welcome to the Periodontal Staging and Grading Diagnostic Tool!\n\n" +
                     "© 2024 Huan Liu\n" +
                     "Wuhan University, School and Hospital of Stomatology\n\n" +
                     "This tool is originally designed and developed. All rights reserved.";
        } else {
            message = "欢迎使用牙周炎分期分级诊断工具！\n\n" +
                     "© 2024 刘欢 (Huan Liu)\n" +
                     "武汉大学口腔医学院\n" +
                     "Wuhan University, School and Hospital of Stomatology\n\n" +
                     "本工具为原创设计与开发，版权所有，保留所有权利。";
        }
        
        alert(message);
        
        // 记录已显示
        localStorage.setItem(storageKey, 'true');
    }
}

/**
 * 执行牙周炎分期分级诊断
 */
function diagnose() {
    // 获取所有输入值
    const cal = document.getElementById('cal').value;
    const boneLoss = document.getElementById('bone-loss').value;
    const pd = document.getElementById('pd').value;
    const furcation = document.getElementById('furcation').value;
    const toothLoss = document.getElementById('tooth-loss').value;
    const opposingTeeth = document.getElementById('opposing-teeth').value;
    const complications = document.getElementById('complications').value;
    const severeRidge = document.getElementById('severe-ridge').value;
    const treatmentHistory = document.getElementById('treatment-history').value;
    const fiveYearLoss = document.getElementById('five-year-loss').value;
    const boneLossAge = document.getElementById('bone-loss-age').value;
    const smoking = document.getElementById('smoking').value;
    const diabetes = document.getElementById('diabetes').value;

    // 验证必填字段
    if (!cal || !boneLoss) {
        const currentLang = i18next.language || 'zh-CN';
        const alertMessage = currentLang === 'en' ? 
            'Please fill in at least Clinical Attachment Loss (CAL) and Bone Loss Level fields' :
            '请至少填写临床附着丧失(CAL)和骨吸收程度字段';
        alert(alertMessage);
        return;
    }

    // 分期诊断
    let stage = determineStage(cal, boneLoss, pd, furcation, toothLoss, opposingTeeth, complications, severeRidge);
    
    // 分级诊断
    let grade = determineGrade(treatmentHistory, fiveYearLoss, boneLossAge, smoking, diabetes);
    
    // 显示结果
    displayResults(stage, grade);
}

/**
 * 确定牙周炎分期
 */
function determineStage(cal, boneLoss, pd, furcation, toothLoss, opposingTeeth, complications, severeRidge) {
    const currentLang = i18next.language || 'zh-CN';
    let stage = 'I';
    let explanation = '';
    
    // 根据CAL和骨吸收程度确定基本分期
    if (cal === '>=5' || boneLoss === '>30%') {
        stage = 'III';
        explanation = currentLang === 'en' ? 
            'CAL ≥5mm or bone loss >30%' :
            'CAL ≥5mm 或骨吸收 >30%';
    } else if (cal === '3-4' || boneLoss === '15-30%') {
        stage = 'II';
        explanation = currentLang === 'en' ? 
            'CAL 3-4mm or bone loss 15-30%' :
            'CAL 3-4mm 或骨吸收 15-30%';
    } else {
        stage = 'I';
        explanation = currentLang === 'en' ? 
            'CAL 1-2mm and bone loss <15%' :
            'CAL 1-2mm 且骨吸收 <15%';
    }
    
    // 根据复杂因素调整分期
    if (toothLoss === '>4') {
        stage = 'IV';
        explanation += currentLang === 'en' ? 
            '; >4 teeth lost due to periodontitis' :
            '；因牙周炎缺失牙齿 >4颗';
    } else if (furcation === 'III' || complications === 'yes' || severeRidge === 'yes') {
        if (stage === 'I' || stage === 'II') stage = 'III';
        explanation += currentLang === 'en' ? 
            '; complexity factors present' :
            '；存在复杂因素';
    }
    
    return {
        stage: currentLang === 'en' ? `Stage ${stage}` : `${stage}期`,
        explanation: explanation
    };
}

/**
 * 确定牙周炎分级
 */
function determineGrade(treatmentHistory, fiveYearLoss, boneLossAge, smoking, diabetes) {
    const currentLang = i18next.language || 'zh-CN';
    let grade = 'B';
    let explanation = '';
    
    // 根据骨吸收速率确定分级
    if (boneLossAge === '>1.0') {
        grade = 'C';
        explanation = currentLang === 'en' ? 
            'Bone loss rate >1.0' :
            '骨吸收速率 >1.0';
    } else if (boneLossAge === '<0.25') {
        grade = 'A';
        explanation = currentLang === 'en' ? 
            'Bone loss rate <0.25' :
            '骨吸收速率 <0.25';
    } else {
        grade = 'B';
        explanation = currentLang === 'en' ? 
            'Bone loss rate 0.25-1.0' :
            '骨吸收速率 0.25-1.0';
    }
    
    // 根据危险因素调整分级
    if (smoking === '>=10' || diabetes === 'hba1c>=7') {
        if (grade === 'A') grade = 'B';
        if (grade === 'B') grade = 'C';
        explanation += currentLang === 'en' ? 
            '; high risk factors present' :
            '；存在高危因素';
    }
    
    return {
        grade: currentLang === 'en' ? `Grade ${grade}` : `${grade}级`,
        explanation: explanation
    };
}

/**
 * 显示诊断结果
 */
function displayResults(stageResult, gradeResult) {
    const resultDiv = document.getElementById('result');
    const stageResultSpan = document.getElementById('stage-result');
    const gradeResultSpan = document.getElementById('grade-result');
    const diagnosisExplanation = document.getElementById('diagnosis-explanation');

    if (!resultDiv || !stageResultSpan || !gradeResultSpan || !diagnosisExplanation) {
        console.warn('Result elements not found');
        return;
    }

    // 显示分期和分级结果
    stageResultSpan.textContent = stageResult.stage;
    gradeResultSpan.textContent = gradeResult.grade;
    
    // 显示诊断依据
    const currentLang = i18next.language || 'zh-CN';
    const stageLabel = currentLang === 'en' ? 'Staging basis:' : '分期依据：';
    const gradeLabel = currentLang === 'en' ? 'Grading basis:' : '分级依据：';
    
    diagnosisExplanation.innerHTML = `<strong>${stageLabel}</strong> ${stageResult.explanation}<br><strong>${gradeLabel}</strong> ${gradeResult.explanation}`;
    
    // 显示结果区域
    resultDiv.classList.remove('hidden');
    
    // 滚动到结果区域
    resultDiv.scrollIntoView({ behavior: 'smooth' });
} 