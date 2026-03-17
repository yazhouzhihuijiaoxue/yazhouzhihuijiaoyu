// 初始化页面功能
document.addEventListener('DOMContentLoaded', function() {
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

    // 诊断按钮点击事件
    const diagnoseBtn = document.getElementById('diagnose-btn');
    diagnoseBtn.addEventListener('click', diagnose);
});

/**
 * 显示版权声明弹窗
 */
function showCopyrightNotice() {
    // 检查是否已经显示过
    if (!localStorage.getItem('copyrightNoticeShown')) {
        const message = "欢迎使用牙周炎分期分级诊断工具！\n\n" +
                      "© 2024 刘欢 (Huan Liu)\n" +
                      "武汉大学口腔医学院\n" +
                      "Wuhan University, School and Hospital of Stomatology\n\n" +
                      "本工具为原创设计与开发，版权所有，保留所有权利。";
        
        alert(message);
        
        // 记录已显示
        localStorage.setItem('copyrightNoticeShown', 'true');
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
        alert('请至少填写临床附着丧失(CAL)和骨吸收程度字段');
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
    let stage = '';
    let explanation = '';

    // 根据CAL和骨吸收进行初步判断
    if (cal === '1-2' && boneLoss === '<15%') {
        stage = 'I期';
        explanation = '根据临床附着丧失(CAL)为1-2mm和骨吸收<15%，判定为I期牙周炎。';
    } 
    else if (cal === '3-4' && boneLoss === '15-30%') {
        // 检查是否有升级到III/IV期的条件
        if (pd === '>5' || furcation === 'II' || furcation === 'III') {
            stage = 'III期';
            explanation = '虽然临床附着丧失(CAL)为3-4mm和骨吸收15-30%符合II期标准，但由于';
            
            if (pd === '>5') {
                explanation += '探诊深度>5mm';
            }
            
            if (furcation === 'II' || furcation === 'III') {
                if (pd === '>5') explanation += '和';
                explanation += '存在' + furcation + '度根分叉病变';
            }
            
            explanation += '，升级为III期牙周炎。';
        } else {
            stage = 'II期';
            explanation = '根据临床附着丧失(CAL)为3-4mm和骨吸收15-30%，判定为II期牙周炎。';
        }
    } 
    else if (cal === '>=5' || boneLoss === '>30%') {
        // III期和IV期的判断
        if (toothLoss === '>4') {
            stage = 'IV期';
            explanation = '根据临床附着丧失(CAL)≥5mm或骨吸收>30%，且因牙周炎缺失>4颗牙，判定为IV期牙周炎。';
        } 
        else if (opposingTeeth === 'no') {
            stage = 'IV期';
            explanation = '根据临床附着丧失(CAL)≥5mm或骨吸收>30%，且存在对合牙数量<10对，判定为IV期牙周炎。';
        } 
        else if (complications === 'yes') {
            stage = 'IV期';
            explanation = '根据临床附着丧失(CAL)≥5mm或骨吸收>30%，且存在垂直距离降低、牙齿移位或出现间隙等并发症，判定为IV期牙周炎。';
        } 
        else if (severeRidge === 'yes') {
            stage = 'IV期';
            explanation = '根据临床附着丧失(CAL)≥5mm或骨吸收>30%，且存在严重牙槽嵴吸收，判定为IV期牙周炎。';
        } 
        else {
            stage = 'III期';
            explanation = '根据临床附着丧失(CAL)≥5mm或骨吸收>30%，判定为III期牙周炎。';
        }
    } 
    else {
        stage = '无法确定';
        explanation = '提供的信息不足以确定分期，请完善相关临床参数。';
    }

    return {
        stage: stage,
        explanation: explanation
    };
}

/**
 * 确定牙周炎分级
 */
function determineGrade(treatmentHistory, fiveYearLoss, boneLossAge, smoking, diabetes) {
    let baseGrade = '';
    let finalGrade = '';
    let explanation = '';

    // 根据治疗历史或骨吸收/年龄比确定基础分级
    if (treatmentHistory === 'yes') {
        if (fiveYearLoss === 'none') {
            baseGrade = 'A';
            explanation = '根据超过5年无临床附着丧失或骨吸收，基础分级为A级（慢速进展）。';
        } else if (fiveYearLoss === '<2mm') {
            baseGrade = 'B';
            explanation = '根据5年内临床附着丧失或骨吸收<2mm，基础分级为B级（中速进展）。';
        } else if (fiveYearLoss === '>=2mm') {
            baseGrade = 'C';
            explanation = '根据5年内临床附着丧失或骨吸收≥2mm，基础分级为C级（快速进展）。';
        }
    } else if (treatmentHistory === 'no') {
        if (boneLossAge === '<0.25%') {
            baseGrade = 'A';
            explanation = '根据骨吸收百分比/年龄<0.25%，基础分级为A级（慢速进展）。';
        } else if (boneLossAge === '0.25-1.0%') {
            baseGrade = 'B';
            explanation = '根据骨吸收百分比/年龄在0.25%-1.0%之间，基础分级为B级（中速进展）。';
        } else if (boneLossAge === '>1.0%') {
            baseGrade = 'C';
            explanation = '根据骨吸收百分比/年龄>1.0%，基础分级为C级（快速进展）。';
        }
    }

    // 根据风险因素调整分级
    finalGrade = baseGrade;
    let adjustmentExplanation = '';

    // 吸烟调整
    if (smoking === '<=10' && baseGrade === 'A') {
        finalGrade = 'B';
        adjustmentExplanation += '由于吸烟≤10支/天，分级从A级升级为B级。';
    } else if (smoking === '>10') {
        finalGrade = 'C';
        adjustmentExplanation += '由于吸烟>10支/天，分级升级为C级。';
    }

    // 糖尿病调整
    if (diabetes === '>=7.0%' && (baseGrade === 'A' || finalGrade === 'A')) {
        finalGrade = 'B';
        if (adjustmentExplanation) adjustmentExplanation += ' ';
        adjustmentExplanation += '由于糖尿病HbA1c≥7.0%，分级从A级升级为B级。';
    } else if (diabetes === 'uncontrolled') {
        finalGrade = 'C';
        if (adjustmentExplanation) adjustmentExplanation += ' ';
        adjustmentExplanation += '由于糖尿病未控制，分级升级为C级。';
    }

    if (adjustmentExplanation) {
        explanation += ' ' + adjustmentExplanation;
    } else if (baseGrade) {
        explanation += ' 无风险因素调整，最终分级保持为' + baseGrade + '级。';
    }

    if (!baseGrade) {
        finalGrade = '无法确定';
        explanation = '提供的信息不足以确定分级，请完善相关临床参数。';
    }

    return {
        grade: finalGrade,
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

    // 显示分期和分级结果
    stageResultSpan.textContent = stageResult.stage;
    gradeResultSpan.textContent = gradeResult.grade;
    
    // 显示诊断依据
    diagnosisExplanation.innerHTML = '<strong>分期依据：</strong>' + stageResult.explanation + 
                                    '<br><strong>分级依据：</strong>' + gradeResult.explanation;
    
    // 显示结果区域
    resultDiv.classList.remove('hidden');
    
    // 滚动到结果区域
    resultDiv.scrollIntoView({ behavior: 'smooth' });
} 